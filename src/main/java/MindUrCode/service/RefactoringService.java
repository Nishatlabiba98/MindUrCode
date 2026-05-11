package MindUrCode.service;

// =====================================================================
// RefactoringService.java
// MindUrCode — AI-Powered Code Review Tool
// =====================================================================
//
// WHERE THIS FILE LIVES:
//   src/main/java/com/minduryourcode/service/RefactoringService.java
//
// WHERE IT FITS IN THE FRAMEWORK:
//
//   [ React Frontend ]
//          ↓  "Run Refactoring Advisor on this repo"
//   [ AnalysisController ]      ← REST layer
//          ↓  calls
//   [ RefactoringService ]      ← YOU ARE HERE
//          ↓              ↓
//   [ OllamaService ]   [ MethodRepo / ToolResultRepo ]  (M's repos)
//          ↓
//   [ PostgreSQL ]
//
// WHAT DOES THIS TOOL DO? (from the one-pager and mockup PDF)
//   The Refactoring Advisor finds "code smells" — patterns in code
//   that suggest something could be improved:
//     • Long methods (too many lines / too high cyclomatic complexity)
//     • Duplicate code (the same null-check or logic repeated multiple times)
//     • God objects (one class doing too many different things)
//     • Feature envy (a method that uses another class more than its own)
//   For each smell found, the AI proposes a concrete refactoring step.
//   The developer previews and approves before anything is applied.
//
// TWO PUBLIC METHODS (from the UML):
//   1. detectSmells(body)      — main entry point, analyzes a method body
//   2. buildPrompt(body)       — constructs the AI prompt (private in UML)
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
// It is injected into AnalysisController automatically.
@Service
public class RefactoringService {

    // -----------------------------------------------------------------
    // DEPENDENCIES — provided by Spring via constructor injection
    // -----------------------------------------------------------------
    private final OllamaService ollamaService;   // AI communication
    private final MethodRepo methodRepo;          // M's repo — reads methods
    private final ToolResultRepo toolResultRepo;  // M's repo — saves results

    @Autowired
    public RefactoringService(OllamaService ollamaService,
                              MethodRepo methodRepo,
                              ToolResultRepo toolResultRepo) {
        this.ollamaService  = ollamaService;
        this.methodRepo     = methodRepo;
        this.toolResultRepo = toolResultRepo;
    }

    // =================================================================
    // PUBLIC METHOD:  analyzeRefactoring
    // =================================================================
    // PURPOSE:
    //   Entry point called by AnalysisController.
    //   Iterates through all source files and their methods.
    //   For each method that smells (determined by heuristics), calls
    //   detectSmells() to generate and save an AI suggestion.
    //
    // PARAMETER:
    //   List<SourceFile> sourceFiles — parsed Java files from the repo
    //
    // RETURN TYPE:
    //   List<ToolResult> — all AI suggestions created during this run
    // =================================================================
    public List<ToolResult> analyzeRefactoring(List<SourceFile> sourceFiles, UUID analysisRunId) {

        List<ToolResult> allResults = new ArrayList<>();

        for (SourceFile file : sourceFiles) {

            // Get every method in this file from Mahala's MethodRepo.
            List<Method> methods = methodRepo.findBySourceFileId(file.getId());

            for (Method method : methods) {

                // Skip test methods — we only refactor production code.
                if (method.getMethodName().toLowerCase().startsWith("test")) {
                    continue;
                }

                // Apply heuristics to decide if this method smells.
                // If it does, send it to the AI and save the result.
                if (hasCodeSmell(method)) {
                    try {
                        ToolResult result = detectSmells(method.getRawCode(), method, analysisRunId);
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
    // PUBLIC METHOD:  detectSmells   (declared in the UML)
    // =================================================================
    // PURPOSE:
    //   Analyzes ONE method body for code smells.
    //   Sends the body to the AI and saves the refactoring suggestion.
    //
    // WHAT IS A CODE SMELL?
    //   A code smell is NOT a bug — the code still works.
    //   It is a pattern that makes code harder to read, maintain, or test.
    //   Common smells (shown in the Refactoring Advisor mockup):
    //     - Long method: over ~15 lines or cyclomatic complexity > 5
    //     - Duplicate code: the same logic copy-pasted in multiple places
    //     - God object: one class doing everything (14+ methods)
    //     - Feature envy: a method more interested in another class's data
    //
    // PARAMETERS:
    //   String body   — the raw source code of the method
    //   Method method — the Method entity (needed to save the result)
    //
    // RETURN TYPE:
    //   ToolResult — the saved AI suggestion (status = PENDING)
    // =================================================================
    public ToolResult detectSmells(String body, Method method, UUID analysisRunId) {

        String prompt       = buildPrompt(body);
        String aiSuggestion = ollamaService.analyze(prompt);

        // Save and return the result.
        return saveResult(method, aiSuggestion, analysisRunId);
    }

    // =================================================================
    // PRIVATE HELPER:  hasCodeSmell
    // =================================================================
    // PURPOSE:
    //   Pre-screening heuristic — decides whether to send a method to
    //   the AI at all. Helps reduce unnecessary AI calls.
    //
    // CHECKS PERFORMED:
    //   1. LINE COUNT — is the method longer than 15 lines?
    //      Methods over 15 lines are hard to read and test.
    //      We split rawCode by newline (\n) and count the parts.
    //      split("\\n") — the double backslash is needed in Java because
    //      backslash itself is an escape character inside String literals.
    //
    //   2. CYCLOMATIC COMPLEXITY ESTIMATE — how many decision points?
    //      Cyclomatic complexity counts the number of paths through code.
    //      We estimate it by counting control-flow keywords:
    //      if, else, for, while, case, catch, &&, ||
    //      Each one adds a branch. Threshold: more than 5 branches.
    //      countOccurrences() is our own helper method below.
    //
    //   3. DUPLICATION SIGNAL — does the code repeat itself?
    //      We look for the same null-check pattern appearing multiple times.
    //      If "!= null" appears more than twice, it may indicate duplicate
    //      guard logic (as shown in the mockup PDF).
    //
    // RETURNS true if ANY check triggers — method should be analyzed.
    // RETURNS false if the method looks clean enough — skip it.
    // =================================================================
    private boolean hasCodeSmell(Method method) {
        String body = method.getRawCode();
        if (body == null || body.isBlank()) return false;

        // CHECK 1 — Line count
        // split("\\n") splits the String at every newline character.
        // .length gives the number of resulting pieces (= number of lines).
        int lineCount = body.split("\\n").length;
        if (lineCount > 15) return true;

        // CHECK 2 — Cyclomatic complexity estimate
        // Count how many branching keywords appear in the method body.
        int complexity = countOccurrences(body, "if")
                + countOccurrences(body, "else")
                + countOccurrences(body, "for")
                + countOccurrences(body, "while")
                + countOccurrences(body, "case")
                + countOccurrences(body, "catch")
                + countOccurrences(body, "&&")
                + countOccurrences(body, "||");
        if (complexity > 5) return true;

        // CHECK 3 — Repeated null-check pattern
        int nullChecks = countOccurrences(body, "!= null");
        if (nullChecks > 2) return true;

        return false;
    }

    // =================================================================
    // PRIVATE HELPER:  countOccurrences
    // =================================================================
    // PURPOSE:
    //   Counts how many times a keyword appears inside a block of code.
    //
    // HOW IT WORKS (step by step):
    //   Suppose text = "if (a) { if (b) {} }" and keyword = "if"
    //
    //   text.split(keyword)  splits the String everywhere "if" appears:
    //     → ["", " (a) { ", " (b) {} }"]
    //     → length = 3
    //
    //   (length - 1) = 2   ← how many times the keyword appeared
    //
    //   This is a common Java trick for counting substrings.
    //   It works because split always returns (occurrences + 1) parts.
    //
    // PARAMETERS:
    //   String text    — the code to search inside
    //   String keyword — the word or symbol to count
    // =================================================================
    private int countOccurrences(String text, String keyword) {
        return text.split(keyword, -1).length - 1;
        // The -1 argument tells split() not to discard trailing empty strings.
        // This makes the count accurate even when the keyword is at the end.
    }

    // =================================================================
    // PRIVATE HELPER:  buildPrompt   (matches UML signature)
    // =================================================================
    // PURPOSE:
    //   Builds the text prompt sent to the AI.
    //   The AI reads the method body and identifies specific smells,
    //   then proposes concrete refactoring steps with explanations.
    // =================================================================
    private String buildPrompt(String body) {
        return String.format(
                "You are a Java refactoring expert reviewing code for the MindUrCode project.\n\n" +
                "On the very first line of your response, write exactly one severity rating based on how much this issue affects the code:\n" +
                "SEVERITY: CLEAR — minor smell, low impact on functionality or maintainability\n" +
                "SEVERITY: CONSEQUENTIAL — smell that meaningfully affects readability, testability, or correctness\n" +
                "SEVERITY: IMPORTANT — serious smell that is very likely to cause bugs or make the code hard to maintain\n\n" +
                "Then analyze the following Java method for code smells:\n\n" +
                "%s\n\n" +
                "Check for these specific code smells:\n" +
                "1. Long method — is it over 15 lines or high cyclomatic complexity?\n" +
                "2. Duplicate code — is the same logic repeated multiple times?\n" +
                "3. God object — is this method trying to do too many things?\n" +
                "4. Feature envy — does it use another class's data more than its own?\n" +
                "5. Unnecessary complexity — deeply nested conditionals or redundant variables?\n\n" +
                "If the method has no code smells, respond with exactly: NO_ISSUES\n\n" +
                "Otherwise, for each smell you find:\n" +
                "- Name the smell and which lines it appears on.\n" +
                "- Suggest a specific refactoring technique (e.g., Extract Method, Replace Loop with Stream).\n" +
                "Return ONLY the refactored Java code block. No preamble, no summary. Use inline comments to mark what changed and why.",
                body
        );
    }

    // =================================================================
    // PRIVATE HELPER:  saveResult
    // =================================================================
    // PURPOSE:
    //   Wraps the AI suggestion in a ToolResult entity and saves it.
    //   Always starts as PENDING — developer must approve first.
    //
    // ToolType.REFACTORING — matches the enum value from James's ToolType
    // =================================================================
    private ToolResult saveResult(Method method, String aiSuggestion, UUID analysisRunId) {
        ToolResult result = new ToolResult();
        result.setId(UUID.randomUUID());
        result.setMethodId(method.getId());
        result.setAnalysisRunId(analysisRunId);
        result.setToolType(ToolType.REFACTORING);
        result.setAiSuggestion(aiSuggestion);
        result.setStatus(ResultStatus.PENDING);
        result.setCreatedAt(new Timestamp(Instant.now().toEpochMilli()));
        return toolResultRepo.save(result);
    }
}