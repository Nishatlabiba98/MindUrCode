package MindUrCode.service;

import MindUrCode.enums.ResultStatus;
import MindUrCode.enums.ToolType;
import MindUrCode.model.Method;
import MindUrCode.model.ToolResult;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ClarityService {

    private final OllamaService ollamaService;

    public ClarityService(OllamaService ollamaService) {
        this.ollamaService = ollamaService;
    }

    public ToolResult analyzeMethod(Method method) {
        String prompt = buildPrompt(method.getMethodName(), method.getRawCode());
        String suggestion = ollamaService.analyze(prompt);

        return ToolResult.builder()
                .method(method)
                .toolType(ToolType.CLARITY)
                .aiSuggestion(suggestion)
                .status(ResultStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
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
}
