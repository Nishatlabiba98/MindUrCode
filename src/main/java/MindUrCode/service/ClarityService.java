package MindUrCode.service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;

import org.springframework.stereotype.Service;

import MindUrCode.enums.ResultStatus;
import MindUrCode.enums.ToolType;
import MindUrCode.model.Method;
import MindUrCode.model.SourceFile;
import MindUrCode.model.ToolResult;
import MindUrCode.repository.MethodRepo;
import MindUrCode.repository.ToolResultRepo;

@Service
public class ClarityService {

    private final OllamaService ollamaService;
    private final MethodRepo methodRepo;
    private final ToolResultRepo toolResultRepo;
    private final ExecutorService analysisExecutor;

    public ClarityService(OllamaService ollamaService,
                          MethodRepo methodRepo,
                          ToolResultRepo toolResultRepo,
                          ExecutorService analysisExecutor) {
        this.ollamaService     = ollamaService;
        this.methodRepo        = methodRepo;
        this.toolResultRepo    = toolResultRepo;
        this.analysisExecutor  = analysisExecutor;
    }

    // Parallel fan-out — see TestCoverageService for the pattern rationale.
    public List<ToolResult> analyzeClarity(List<SourceFile> sourceFiles, UUID analysisRunId) {
        List<Method> targets = sourceFiles.stream()
                .flatMap(f -> methodRepo.findBySourceFileId(f.getId()).stream())
                .toList();

        List<CompletableFuture<ToolResult>> futures = targets.stream()
                .map(method -> CompletableFuture.supplyAsync(() -> {
                    try {
                        return analyzeMethod(method, analysisRunId);
                    } catch (Exception e) {
                        return null;
                    }
                }, analysisExecutor))
                .toList();

        return futures.stream()
                .map(CompletableFuture::join)
                .filter(Objects::nonNull)
                .toList();
    }

    public ToolResult analyzeMethod(Method method, UUID analysisRunId) {
        String prompt     = buildPrompt(method.getMethodName(), method.getRawCode());
        String suggestion = ollamaService.analyze(prompt);
        return saveResult(method, suggestion, analysisRunId);
    }

    private String buildPrompt(String methodName, String methodBody) {
    return """
                You are a Java code clarity expert reviewing code.

                On the very first line of your response, write exactly one severity rating based on how much the naming or clarity issue affects the code:
                SEVERITY: CLEAR — name is clear and understandble, no risk of confusion for developers reading this code
                SEVERITY: CONSEQUENTIAL — misleading name that will slow down developers reading this code
                SEVERITY: IMPORTANT — name actively contradicts what the method does, creating real risk of misuse

                Then analyze this method:
                Method name: %s
                Method body:
                %s
                Does the method name clearly describe what the code does?
                Suggest a better name if needed and explain why in one or two sentences.
                
                Specifically, consider these points when evaluating and suggesting changes:
                1. Clarity of intent: Is it immediately clear from the name what the method is supposed to do?
                2. Consistency with naming conventions: Does it follow common Java naming patterns (e.g., snake_case for methods)?
                3. Avoid abbreviations: If abbreviations are used, ensure they are well-known and widely understood.
                4. Relevance: Ensure that the name accurately reflects the functionality of the method.
                5. Simplicity: Keep names concise and avoid overly complex or ambiguous terms.

                Return ONLY the revised method name and explanation in the following format:
                - New Method Name: %s
                - Reason for Change: %s
                """.formatted(methodName, methodBody, methodName, "");
}


    private ToolResult saveResult(Method method, String aiSuggestion, UUID analysisRunId) {
        ToolResult result = new ToolResult();
        result.setId(UUID.randomUUID());
        result.setMethodId(method.getId());
        result.setAnalysisRunId(analysisRunId);
        result.setToolType(ToolType.CLARITY);
        result.setAiSuggestion(aiSuggestion);
        result.setStatus(ResultStatus.PENDING);
        result.setCreatedAt(new Timestamp(Instant.now().toEpochMilli()));
        return toolResultRepo.save(result);
    }
}
