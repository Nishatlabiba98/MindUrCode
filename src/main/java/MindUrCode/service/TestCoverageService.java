package MindUrCode.service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;

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
public class TestCoverageService {

    private final OllamaService ollamaService;
    private final MethodRepo methodRepo;
    private final ToolResultRepo toolResultRepo;
    private final ExecutorService analysisExecutor;

    @Autowired
    public TestCoverageService(OllamaService ollamaService,
                               MethodRepo methodRepo,
                               ToolResultRepo toolResultRepo,
                               ExecutorService analysisExecutor) {
        this.ollamaService     = ollamaService;
        this.methodRepo        = methodRepo;
        this.toolResultRepo    = toolResultRepo;
        this.analysisExecutor  = analysisExecutor;
    }

    // Parallel fan-out: every untested method becomes a CompletableFuture on
    // the shared analysisExecutor (16 threads). Ollama's NUM_PARALLEL=4 still
    // serializes inference, but threads stay busy while waiting and DB saves
    // overlap with the next method's Ollama call.
    public List<ToolResult> analyzeCoverage(List<SourceFile> sourceFiles, UUID analysisRunId) {
        List<Method> targets = sourceFiles.stream()
                .flatMap(f -> findUntested(methodRepo.findBySourceFileId(f.getId())).stream())
                .toList();

        List<CompletableFuture<ToolResult>> futures = targets.stream()
                .map(method -> CompletableFuture.supplyAsync(() -> {
                    try {
                        String prompt       = buildPrompt(method);
                        String aiSuggestion = ollamaService.analyze(prompt);
                        return saveResult(method, aiSuggestion, analysisRunId);
                    } catch (Exception e) {
                        return null;  // existing per-method resilience
                    }
                }, analysisExecutor))
                .toList();

        return futures.stream()
                .map(CompletableFuture::join)
                .filter(Objects::nonNull)
                .toList();
    }

    public List<Method> findUntested(List<Method> methods) {
        List<Method> untested = new ArrayList<>();

        for (Method method : methods) {
            if (method.getMethodName().toLowerCase().startsWith("test")) {
                continue;
            }
            String rawCode = method.getRawCode();
            if (rawCode != null && rawCode.contains("@Test")) {
                continue;
            }
            untested.add(method);
        }

        return untested;
    }

    private String buildPrompt(Method method) {
    return String.format(
            "You are a Java testing expert reviewing code.\n\n" +
            "On the very first line of your response, write exactly one severity rating based on the risk of having no test coverage for this method:\n" +
            "SEVERITY: CLEAR — simple method with obvious behavior that is low risk to leave untested\n" +
            "SEVERITY: CONSEQUENTIAL — method with branching logic or side effects that should have tests\n" +
            "SEVERITY: IMPORTANT — critical method where missing tests is a significant risk to correctness\n\n" +
            "The following Java method has no unit test coverage:\n\n" +
            "Method name: %s\n" +
            "Source lines: %d to %d\n\n" +
            "Raw code:\n%s\n\n" +
            "Please do the following:\n" +
            "1. Identify which branches or paths in this method have no tests.\n" +
            "2. Suggest specific JUnit 5 test cases that would cover the missing paths.\n" +
            "3. Include edge cases such as null inputs, empty lists, and boundary values.\n" +
            "4. Ensure each test case is descriptive (e.g., methodName_condition_expectedResult).\n" +
            "5. Write each test method as a separate JUnit 5 @Test annotation within the provided Java code block.\n" +
            "6. Include brief inline comments above each test case to explain the scenario being tested and the expected outcome.\n" +
            "7. Do not include any setup or teardown methods; focus solely on the specific test cases for this method.\n\n" +
            "Return ONLY the JUnit 5 test methods as a Java code block. No explanation outside of the method names and inline comments.",
            
            method.getMethodName(),
            method.getLineStart(),
            method.getLineEnd(),
            method.getRawCode()
    );
}


    private ToolResult saveResult(Method method, String aiSuggestion, UUID analysisRunId) {
        ToolResult result = new ToolResult();
        result.setId(UUID.randomUUID());
        result.setMethodId(method.getId());
        result.setAnalysisRunId(analysisRunId);
        result.setToolType(ToolType.COVERAGE);
        result.setAiSuggestion(aiSuggestion);
        result.setStatus(ResultStatus.PENDING);
        result.setCreatedAt(new Timestamp(Instant.now().toEpochMilli()));
        return toolResultRepo.save(result);
    }
}
