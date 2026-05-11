package MindUrCode.service;

// =====================================================================
// SimplificationService.java
// MindUrCode — AI-Powered Code Review Tool
// =====================================================================
//
// WHERE THIS FILE LIVES:
//   src/main/java/com/minduryourcode/service/SimplificationService.java
//
// WHERE IT FITS IN THE FRAMEWORK:
//
//   [ React Frontend ]
//          ↓  "Run Simplification Engine on this repo"
//   [ AnalysisController ]       ← REST layer
//          ↓  calls
//   [ SimplificationService ]    ← YOU ARE HERE
//          ↓              ↓
//   [ OllamaService ]    [ MethodRepo / ToolResultRepo ]  (M's repos)
//          ↓
//   [ PostgreSQL ]
//
// WHAT DOES THIS TOOL DO? (from the one-pager and mockup PDF)
//   The Simplification Engine targets UNNECESSARY COMPLEXITY —
//   code that is correct but harder to read than it needs to be.
//   It is different from the Refactoring Advisor:
//     • Refactoring Advisor → structural problems (long methods, smells)
//     • Simplification Engine → readability problems (nested ifs, old loops,
//       manual null checks that Java already handles cleanly)
//
//   Specific issues it detects (from the mockup PDF analysis panel):
//     - Overly nested conditionals (3+ levels of if inside if)
//     - Index-based for loops where the index is never actually used
//     - Manual null checks that should use Objects.nonNull
//     - Intermediate variables used only to collect and immediately return
//     - Unused imports, variables, or methods
//
// PUBLIC METHOD (from the UML):
//   simplify(body) — analyzes ONE method body and returns a suggestion
//
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

// @Service — Spring creates and manages one instance of this class.
@Service
public class SimplificationService {

    // -----------------------------------------------------------------
    // DEPENDENCIES — injected by Spring
    // -----------------------------------------------------------------
    private final OllamaService ollamaService;   // sends prompts to AI
    private final MethodRepo methodRepo;          // M's repo — reads methods
    private final ToolResultRepo toolResultRepo;  // M's repo — saves results

    @Autowired
    public SimplificationService(OllamaService ollamaService,
                                 MethodRepo methodRepo,
                                 ToolResultRepo toolResultRepo) {
        this.ollamaService  = ollamaService;
        this.methodRepo     = methodRepo;
        this.toolResultRepo = toolResultRepo;
    }

    // =================================================================
    // PUBLIC METHOD:  analyzeSimplification
    // =================================================================
    // PURPOSE:
    //   Entry point called by AnalysisController.
    //   Loops through every file and every method.
    //   For each method that shows complexity signals, calls simplify()
    //   to get an AI suggestion and save it as PENDING.
    //
    // PARAMETER:
    //   List<SourceFile> sourceFiles — Java files parsed from the repo
    //
    // RETURN TYPE:
    //   List<ToolResult> — every simplification suggestion created
    // =================================================================
    public List<ToolResult> analyzeSimplification(List<SourceFile> sourceFiles, UUID analysisRunId) {

        List<ToolResult> allResults = new ArrayList<>();

        for (SourceFile file : sourceFiles) {

            // Ask Mahala's MethodRepo for all methods in this file.
            List<Method> methods = methodRepo.findBySourceFileId(file.getId());

            for (Method method : methods) {

                // Skip test methods — we simplify production code only.
                if (method.getMethodName().toLowerCase().startsWith("test")) {
                    continue;
                }

                // Apply simplicity heuristics.
                // If the method has complexity issues, send it to the AI.
                if (needsSimplification(method)) {
                    try {
                        ToolResult result = simplify(method.getRawCode(), method, analysisRunId);
                        allResults.add(result);
                    } catch (Exception e) {
                        // Skip methods where Ollama fails — return the rest
                    }
                }
            }
        }

        return allResults;
    }

    // =================================================================
    // PUBLIC METHOD:  simplify   (declared in the UML)
    // =================================================================
    // PURPOSE:
    //   Analyzes ONE method body for unnecessary complexity.
    //   Sends it to the AI and saves the suggestion as a ToolResult.
    //
    // WHAT IS "UNNECESSARY COMPLEXITY"?
    //   It is code that does the job but in a harder-to-read way than
    //   necessary. For example (from the Simplification Engine mockup):
    //
    //   BEFORE (complex):
    //     List<String> result = new ArrayList<>();
    //     for (int i = 0; i < users.size(); i++) {
    //         User u = users.get(i);
    //         if (u != null) {
    //             if (u.isActive()) {
    //                 if (u.getEmail() != null) {
    //                     result.add(u.getEmail());
    //                 }
    //             }
    //         }
    //     }
    //     return result;
    //
    //   AFTER (simplified):
    //     return users.stream()
    //         .filter(Objects::nonNull)
    //         .filter(User::isActive)
    //         .map(User::getEmail)
    //         .filter(Objects::nonNull)
    //         .collect(Collectors.toList());
    //
    //   Both do the same thing. The second is shorter and more readable.
    //
    // PARAMETERS:
    //   String body   — the raw source code of the method
    //   Method method — the Method entity (used to get id for saving)
    //
    // RETURN TYPE:
    //   ToolResult — the saved AI suggestion (status = PENDING)
    // =================================================================
    public ToolResult simplify(String body, Method method, UUID analysisRunId) {

        String prompt       = buildPrompt(body);
        String aiSuggestion = ollamaService.analyze(prompt);

        // Save and return the result.
        return saveResult(method, aiSuggestion, analysisRunId);
    }

    // =================================================================
    // PRIVATE HELPER:  needsSimplification
    // =================================================================
    // PURPOSE:
    //   Pre-screens a method using fast text heuristics to decide
    //   whether to send it to the AI. Saves unnecessary AI calls.
    //
    // CHECKS PERFORMED (based on the Simplification Engine mockup):
    //
    //   CHECK 1 — Nested conditionals
    //     Looks for "if" appearing inside another "if" by counting
    //     indentation depth signals.
    //     Simplified: counts total "if" occurrences and triggers if > 2,
    //     because 3+ nested ifs is almost always worth simplifying.
    //
    //   CHECK 2 — Index-based for loop with unused index
    //     The pattern "for (int i = 0" is the classic C-style loop.
    //     If the index i is never used for anything except incrementing,
    //     a for-each loop or stream would be cleaner.
    //     We detect this by checking:
    //       - "for (int i = 0" appears in the code, AND
    //       - "users.get(i)" or ".get(i)" does NOT appear
    //         (meaning i is only used in the loop header, not the body)
    //
    //   CHECK 3 — Manual null check (Objects.nonNull pattern)
    //     Detects "!= null" in the body. Java streams and Optional
    //     provide cleaner ways to handle nulls in most cases.
    //
    //   CHECK 4 — Intermediate collect-and-return variable
    //     Detects the pattern where a List is created, items are added
    //     in a loop, and then the list is returned at the end.
    //     This pattern is almost always replaceable with a stream.
    //     We detect it by looking for both "new ArrayList" and "return"
    //     in the same method body.
    //
    // RETURNS true if ANY check triggers.
    // RETURNS false if the method looks simple enough already.
    // =================================================================
    private boolean needsSimplification(Method method) {
        String body = method.getRawCode();
        if (body == null || body.isBlank()) return false;

        // CHECK 1 — Nested conditionals (more than 2 "if" blocks)
        // split("if", -1).length - 1 counts how many times "if" appears.
        int ifCount = body.split("if", -1).length - 1;
        if (ifCount > 2) return true;

        // CHECK 2 — Index-based for loop where the index is not used in the body
        // contains() returns true if the substring is found anywhere in the String.
        boolean hasIndexLoop = body.contains("for (int i = 0")
                || body.contains("for(int i = 0");
        boolean indexUsedInBody = body.contains(".get(i)");
        if (hasIndexLoop && !indexUsedInBody) return true;

        // CHECK 3 — Manual null check instead of Objects.nonNull
        boolean hasManualNullCheck = body.contains("!= null");
        if (hasManualNullCheck) return true;

        // CHECK 4 — Intermediate list variable that is only used to return
        boolean hasIntermediateList = body.contains("new ArrayList")
                && body.contains("return");
        if (hasIntermediateList) return true;

        return false;
    }

    // =================================================================
    // PRIVATE HELPER:  buildPrompt   (matches UML signature)
    // =================================================================
    // PURPOSE:
    //   Builds the prompt sent to the AI.
    //   Asks the AI to identify specific simplification opportunities
    //   and suggest modern Java equivalents (streams, lambdas, etc.).
    //
    // WHAT ARE STREAMS AND LAMBDAS? (for learning reference)
    //   Java 8 introduced the Stream API and lambda expressions.
    //   Streams let you process collections in a pipeline:
    //     list.stream()
    //         .filter(x -> x != null)   ← lambda: an inline function
    //         .map(x -> x.getName())    ← transform each element
    //         .collect(Collectors.toList())
    //   This replaces many manual for-loops with a single readable chain.
    // =================================================================
    private String buildPrompt(String body) {
        return String.format(
                "You are a Java simplification expert reviewing code for the MindUrCode project.\n\n" +
                "On the very first line of your response, write exactly one severity rating based on how much this issue affects the code:\n" +
                "SEVERITY: CLEAR — no style or readability concern\n" +
                "SEVERITY: CONSEQUENTIAL — affects maintainability or testability in a meaningful way\n" +
                "SEVERITY: IMPORTANT — significant complexity that is likely to cause bugs or serious maintenance problems\n\n" +
                "Then analyze the following Java method for unnecessary complexity:\n\n" +
                "%s\n\n" +
                "Look for these specific issues:\n" +
                "1. Overly nested conditionals — 3 or more levels of if-inside-if.\n" +
                "2. Index-based for loop where the index variable is never used semantically.\n" +
                "3. Manual null checks that could use Objects.nonNull in a stream filter.\n" +
                "4. Intermediate variables that are only used to collect and immediately return.\n" +
                "5. Unused imports, variables, or methods that add clutter.\n\n" +
                "For each issue you find:\n" +
                "- Identify the exact lines affected.\n" +
                "- Explain the simpler modern Java alternative (e.g., Stream API, for-each, Optional).\n" +
                "Return ONLY the simplified version of the method as a Java code block. Do not include any explanation outside of brief inline comments on the changed lines.",
                
                body
        );
    }


    // =================================================================
    // PRIVATE HELPER:  saveResult
    // =================================================================
    // PURPOSE:
    //   Wraps the AI suggestion in a ToolResult entity and saves it
    //   to PostgreSQL via Mahala's ToolResultRepo.
    //
    // ToolType.SIMPLIFICATION — matches James's ToolType enum value
    // ResultStatus.PENDING    — developer must approve; nothing auto-applies
    // =================================================================
    private ToolResult saveResult(Method method, String aiSuggestion, UUID analysisRunId) {
        ToolResult result = new ToolResult();
        result.setId(UUID.randomUUID());
        result.setMethodId(method.getId());
        result.setAnalysisRunId(analysisRunId);
        result.setToolType(ToolType.SIMPLIFICATION);
        result.setAiSuggestion(aiSuggestion);
        result.setStatus(ResultStatus.PENDING);
        result.setCreatedAt(new Timestamp(Instant.now().toEpochMilli()));
        return toolResultRepo.save(result);
    }
}
