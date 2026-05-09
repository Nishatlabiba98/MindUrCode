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
                You are a Java code clarity expert.
                Analyze this method:
                Method name: %s
                Method body:
                %s
                Does the method name clearly describe what the code does?
                Respond with: CLEAR or UNCLEAR, then one sentence explaining why.
                """.formatted(methodName, methodBody);
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
