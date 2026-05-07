package MindUrCode.service;

import MindUrCode.model.MethodEntity;
import MindUrCode.model.SourceFile;
import MindUrCode.model.ToolResult;
import MindUrCode.enums.ResultStatus;
import MindUrCode.enums.ToolType;
import MindUrCode.repository.Method;
import MindUrCode.repository.ToolResult;
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
    private final Method methodRepo;
    private final ToolResult toolResultRepo;

    @Autowired
    public TestCoverageService(OllamaService ollamaService,
                               Method methodRepo,
                               ToolResult toolResultRepo) {
        this.ollamaService  = ollamaService;
        this.methodRepo     = methodRepo;
        this.toolResultRepo = toolResultRepo;
    }

    // Main entry point — finds untested methods in each file and asks AI for suggestions
    public List<ToolResult> analyzeCoverage(List<SourceFile> sourceFiles) {
        List<ToolResult> allResults = new ArrayList<>();

        for (SourceFile file : sourceFiles) {
            List<MethodEntity> methods = methodRepo.findBySourceFileId(file.getId());
            List<MethodEntity> untestedMethods = findUntested(methods);

            for (MethodEntity method : untestedMethods) {
                String prompt       = buildPrompt(method);
                String aiSuggestion = ollamaService.analyze(prompt);
                ToolResult result   = saveResult(method, aiSuggestion);
                allResults.add(result);
            }
        }

        return allResults;
    }

    // Filters methods down to those lacking test coverage
    public List<MethodEntity> findUntested(List<MethodEntity> methods) {
        List<MethodEntity> untested = new ArrayList<>();

        for (MethodEntity method : methods) {
            // Skip methods that are themselves tests
            if (method.getMethodName().toLowerCase().startsWith("test")) {
                continue;
            }
            // Skip methods inside test classes
            String rawCode = method.getRawCode();
            if (rawCode != null && rawCode.contains("@Test")) {
                continue;
            }
            // Skip methods already analyzed for coverage
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

    // Builds the prompt sent to the AI model
    private String buildPrompt(MethodEntity method) {
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

    // Saves the AI's suggestion as a ToolResult in the database
    private ToolResult saveResult(MethodEntity method, String aiSuggestion) {
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
