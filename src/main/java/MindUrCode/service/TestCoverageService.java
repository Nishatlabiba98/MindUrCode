package MindUrCode.service;

import MindUrCode.model.Method;
import MindUrCode.model.SourceFile;
import MindUrCode.model.ToolResult;
import MindUrCode.enums.ResultStatus;
import MindUrCode.enums.ToolType;
import MindUrCode.repository.MethodRepository;
import MindUrCode.repository.ToolResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TestCoverageService {

    private final OllamaService ollamaService;
    private final MethodRepository methodRepo;
    private final ToolResultRepository toolResultRepo;

    @Autowired
    public TestCoverageService(OllamaService ollamaService,
                               MethodRepository methodRepo,
                               ToolResultRepository toolResultRepo) {
        this.ollamaService  = ollamaService;
        this.methodRepo     = methodRepo;
        this.toolResultRepo = toolResultRepo;
    }

    public List<ToolResult> analyzeCoverage(List<SourceFile> sourceFiles) {
        List<ToolResult> allResults = new ArrayList<>();

        for (SourceFile file : sourceFiles) {
            List<Method> methods = methodRepo.findBySourceFileId(file.getId());
            List<Method> untestedMethods = findUntested(methods);

            for (Method method : untestedMethods) {
                String prompt       = buildPrompt(method);
                String aiSuggestion = ollamaService.analyze(prompt);
                ToolResult result   = saveResult(method, aiSuggestion);
                allResults.add(result);
            }
        }

        return allResults;
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
            boolean alreadyAnalyzed = toolResultRepo
                    .findByMethodId(method.getId())
                    .stream()
                    .anyMatch(r -> r.getToolType() == ToolType.COVERAGE);
            if (alreadyAnalyzed) {
                continue;
            }

            untested.add(method);
        }

        return untested;
    }

    private String buildPrompt(Method method) {
        return String.format(
                "You are a Java testing expert reviewing code for the MindUrCode project.\n\n" +
                "The following Java method has no unit test coverage:\n\n" +
                "Method name: %s\n" +
                "Source lines: %d to %d\n\n" +
                "Raw code:\n%s\n\n" +
                "Please do the following:\n" +
                "1. Identify which branches or paths in this method have no tests.\n" +
                "2. Suggest specific JUnit 5 test cases that would cover the missing paths.\n" +
                "3. Include edge cases such as null inputs, empty lists, and boundary values.\n" +
                "4. Keep each test case name descriptive (e.g., methodName_condition_expectedResult).\n" +
                "Respond in plain English. Do not change the original code.",
                method.getMethodName(),
                method.getLineStart(),
                method.getLineEnd(),
                method.getRawCode()
        );
    }

    private ToolResult saveResult(Method method, String aiSuggestion) {
        ToolResult result = new ToolResult();
        result.setId(UUID.randomUUID());
        result.setMethodId(method.getId());
        result.setToolType(ToolType.COVERAGE);
        result.setAiSuggestion(aiSuggestion);
        result.setStatus(ResultStatus.PENDING);
        result.setCreatedAt(new Timestamp(Instant.now().toEpochMilli()));
        return toolResultRepo.save(result);
    }
}
