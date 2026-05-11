package MindUrCode.service;

// =====================================================================
// DocumentationService.java
// MindUrCode — AI-Powered Code Review Tool
// =====================================================================
//
// WHERE THIS FILE LIVES:
//   src/main/java/com/minduryourcode/service/DocumentationService.java
//
// WHERE IT FITS IN THE FRAMEWORK:
//
//   [ React Frontend ]
//          ↓  "Generate Javadoc for this repo"
//   [ AnalysisController ]       ← REST layer — receives the HTTP request
//          ↓  calls
//   [ DocumentationService ]     ← YOU ARE HERE
//          ↓              ↓
//   [ OllamaService ]    [ MethodRepo / ToolResultRepo ]  (M's repos)
//          ↓
//   [ PostgreSQL ]
//
// WHAT DOES THIS TOOL DO? (from the one-pager and mockup PDF)
//   The Documentation Assistant scans every method in the repo,
//   finds ones that have NO Javadoc comment, asks the AI to generate
//   a proper Javadoc block (@param, @return, @throws), and saves
//   each suggestion as a PENDING ToolResult.
//   The developer then reads each suggestion and approves, edits,
//   or rejects it. Nothing is written to their code without approval.
//
// TWO PUBLIC METHODS (from the UML):
//   1. generateJavadoc(sig, body)  — generates Javadoc for ONE method
//   2. buildPrompt(sig, body)      — constructs the AI prompt (private in UML,
//                                    kept private here too)
// =====================================================================

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import MindUrCode.enums.ResultStatus;
import MindUrCode.enums.ToolType;
import MindUrCode.model.Method;
import MindUrCode.model.SourceFile;
import MindUrCode.model.ToolResult;
import MindUrCode.repository.MethodRepo;
import MindUrCode.repository.ToolResultRepo;

@Service
public class DocumentationService {

    // -----------------------------------------------------------------
    // DEPENDENCIES — Spring injects these automatically
    // -----------------------------------------------------------------
    // Think of these as tools this service borrows.
    // Spring creates them once and hands them to us in the constructor.
    // -----------------------------------------------------------------
    private final OllamaService ollamaService;    // sends prompts to the AI
    private final MethodRepo methodRepo;           // M's repo — reads methods
    private final ToolResultRepo toolResultRepo;   // M's repo — saves results

    // @Autowired on the constructor tells Spring:
    // "Fill in these three parameters automatically when creating this class."
    @Autowired
    public DocumentationService(OllamaService ollamaService,
                                MethodRepo methodRepo,
                                ToolResultRepo toolResultRepo) {
        this.ollamaService  = ollamaService;
        this.methodRepo     = methodRepo;
        this.toolResultRepo = toolResultRepo;
    }

    // =================================================================
    // PUBLIC METHOD:  analyzeDocumentation
    // =================================================================
    // PURPOSE:
    //   Entry point called by AnalysisController.
    //   Loops through every source file → loads its methods → finds
    //   any that are missing Javadoc → sends each to the AI →
    //   saves the result as PENDING.
    //
    // PARAMETER:
    //   List<SourceFile> sourceFiles — the Java files parsed from the repo
    //                                  (SourceFile is Nishat's entity)
    //
    // RETURN TYPE:
    //   List<ToolResult> — every suggestion created during this run,
    //                      returned to the controller and sent to React.
    // =================================================================
    public List<ToolResult> analyzeDocumentation(List<SourceFile> sourceFiles, UUID analysisRunId) {

        List<ToolResult> allResults = new ArrayList<>();

        for (SourceFile file : sourceFiles) {

            // Load all methods in this file using M's MethodRepo.
            List<Method> methods = methodRepo.findBySourceFileId(file.getId());

            for (Method method : methods) {

                // Skip methods that already have a Javadoc comment.
                // rawCode is the full source text of the method.
                // If it starts with "/**", a Javadoc block is already there.
                String rawCode = method.getRawCode();
                if (rawCode != null && rawCode.trim().startsWith("/**")) {
                    continue; // Already documented — skip
                }

                // Build the method signature line for the prompt.
                // The "signature" is the first line of a method:
                //   e.g.  "public List<String> getActiveUsers(List<User> users)"
                // We extract it by grabbing everything up to the opening brace "{".
                //
                // NOTE ON indexOf('{') :
                //   String.indexOf(char) returns the position of the first
                //   occurrence of that character. If not found, returns -1.
                //   substring(0, index) extracts characters from 0 up to (not
                //   including) that index.
                String signature = extractSignature(rawCode);

                // Call the UML-specified public method to generate the Javadoc.
                try {
                    ToolResult result = generateJavadoc(signature, rawCode, method, analysisRunId);
                    allResults.add(result);
                } catch (Exception e) {
                    // Skip methods where Ollama fails — return the rest
                }
            }
        }

        return allResults;
    }

    // =================================================================
    // PUBLIC METHOD:  generateJavadoc   (declared in the UML)
    // =================================================================
    // PURPOSE:
    //   Generates a Javadoc suggestion for ONE method.
    //   Sends the method signature and body to the AI and saves the result.
    //
    // WHAT IS A JAVADOC?
    //   Javadoc is Java's official way to document code.
    //   It looks like this and goes directly above the method:
    //
    //   /**
    //    * Returns active user emails from the given list.
    //    *
    //    * @param users  the list of users to filter
    //    * @return a list of email strings for active users
    //    * @throws NullPointerException if users is null
    //    */
    //
    //   IDEs like VS Code display Javadoc when you hover over a method.
    //   It is also used by tools like Maven to generate HTML documentation.
    //
    // PARAMETERS:
    //   String sig    — the method signature (first line of the method)
    //   String body   — the full raw source code of the method
    //   Method method — the Method entity (used to get the id for saving)
    //
    // RETURN TYPE:
    //   ToolResult — the saved suggestion row (status = PENDING)
    // =================================================================
    public ToolResult generateJavadoc(String sig, String body, Method method, UUID analysisRunId) {

        String prompt       = buildPrompt(sig, body);
        String aiSuggestion = ollamaService.analyze(prompt);

        // Package the AI's suggestion into a ToolResult and save it.
        return saveResult(method, aiSuggestion, analysisRunId);
    }

    // =================================================================
    // PRIVATE HELPER:  buildPrompt   (matches UML signature)
    // =================================================================
    // PURPOSE:
    //   Builds the text we send to the AI model.
    //   The AI reads this and returns a complete Javadoc comment block.
    //
    // WHY PRIVATE?
    //   This is an internal detail. Only DocumentationService needs it.
    //   Keeping it private protects it from being called from outside.
    //
    // STRING FORMATTING:
    //   %s is a placeholder replaced by the matching argument in order.
    //   \n creates a new line inside the String.
    // =================================================================
    private String buildPrompt(String sig, String body) {
        return String.format(
                "You are a Java documentation expert reviewing code for the MindUrCode project.\n\n" +
                "On the very first line of your response, write exactly one severity rating based on how badly this method needs documentation:\n" +
                "SEVERITY: CLEAR — simple method whose purpose is obvious from its name\n" +
                "SEVERITY: CONSEQUENTIAL — method complex enough that missing docs will slow down other developers\n" +
                "SEVERITY: IMPORTANT — complex or critical method where missing docs is a real risk to correctness\n\n" +
                "Then generate a complete Javadoc comment block for the following method.\n\n" +
                "Method signature:\n%s\n\n" +
                "Method body:\n%s\n\n" +
                "If the method already has sufficient documentation or is so simple it needs none, respond with exactly: NO_ISSUES\n\n" +
                "Otherwise, generate the Javadoc with these requirements:\n" +
                "1. Start with /** and end with */\n" +
                "2. Include a one-sentence summary of what the method does.\n" +
                "3. Add a @param tag for every parameter with a brief description.\n" +
                "4. Add a @return tag describing what is returned (skip if void).\n" +
                "5. Add @throws tags for any exceptions the method may throw.\n" +
                "6. Keep language clear and professional.\n" +
                "Return ONLY the Javadoc comment block starting with /** and ending with */. Do not include the method code or any other text.",
                sig,
                body
        );
    }

    // =================================================================
    // PRIVATE HELPER:  extractSignature
    // =================================================================
    // PURPOSE:
    //   Extracts the first line of a method (up to the opening brace)
    //   to use as the "signature" sent to the AI prompt.
    //
    // EXAMPLE:
    //   rawCode = "public List<String> getActiveUsers(List<User> users) {\n ..."
    //   returns  = "public List<String> getActiveUsers(List<User> users)"
    //
    // HOW IT WORKS:
    //   indexOf('{')  — finds the position of the first opening brace
    //   substring(0, braceIndex)  — takes only the text before that brace
    //   .trim()  — removes any leading or trailing whitespace
    // =================================================================
    private String extractSignature(String rawCode) {
        if (rawCode == null) return "";
        int braceIndex = rawCode.indexOf('{');
        if (braceIndex == -1) return rawCode.trim(); // No brace found — return as-is
        return rawCode.substring(0, braceIndex).trim();
    }

    // =================================================================
    // PRIVATE HELPER:  saveResult
    // =================================================================
    // PURPOSE:
    //   Packages the AI suggestion into a ToolResult and saves it to
    //   PostgreSQL via M's ToolResultRepo.
    //
    // KEY POINTS:
    //   ToolType.DOCUMENTATION  — tags this as a Documentation result
    //   ResultStatus.PENDING    — dev must approve before anything changes
    //   UUID.randomUUID()       — generates a unique ID for this row
    // =================================================================
    private ToolResult saveResult(Method method, String aiSuggestion, UUID analysisRunId) {
        ToolResult result = new ToolResult();
        result.setId(UUID.randomUUID());
        result.setMethodId(method.getId());
        result.setAnalysisRunId(analysisRunId);
        result.setToolType(ToolType.DOCUMENTATION);
        result.setAiSuggestion(aiSuggestion);
        result.setStatus(ResultStatus.PENDING);
        result.setCreatedAt(new Timestamp(Instant.now().toEpochMilli()));
        return toolResultRepo.save(result);
    }
}