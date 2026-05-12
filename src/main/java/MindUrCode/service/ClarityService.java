package MindUrCode.service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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

    public ClarityService(OllamaService ollamaService,
                          MethodRepo methodRepo,
                          ToolResultRepo toolResultRepo) {
        this.ollamaService  = ollamaService;
        this.methodRepo     = methodRepo;
        this.toolResultRepo = toolResultRepo;
    }

    public List<ToolResult> analyzeClarity(List<SourceFile> sourceFiles, UUID analysisRunId) {
        List<ToolResult> allResults = new ArrayList<>();
        for (SourceFile file : sourceFiles) {
            List<Method> methods = methodRepo.findBySourceFileId(file.getId());
            for (Method method : methods) {
                try {
                    ToolResult result = analyzeMethod(method, analysisRunId);
                    allResults.add(result);
                } catch (Exception e) {
                    // Skip methods where Ollama times out or fails — partial results are better than none
                }
            }
        }
        return allResults;
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
                SEVERITY: CLEAR — name is slightly off but intent is still understandable
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
