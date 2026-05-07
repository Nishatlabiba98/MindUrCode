package MindUrCode.controller;

import MindUrCode.enums.ResultStatus;
import MindUrCode.enums.ToolType;
import MindUrCode.model.SourceFile;
import MindUrCode.model.ToolResult;
import MindUrCode.repository.SourceFileRepo;
import MindUrCode.repository.ToolResultRepo;
import MindUrCode.service.ClarityService;
import MindUrCode.service.DocumentationService;
import MindUrCode.service.RefactoringService;
import MindUrCode.service.SimplificationService;
import MindUrCode.service.TestCoverageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    private final TestCoverageService testCoverageService;
    private final ClarityService clarityService;
    private final DocumentationService documentationService;
    private final RefactoringService refactoringService;
    private final SimplificationService simplificationService;
    private final ToolResultRepo toolResultRepo;
    private final SourceFileRepo sourceFileRepo;

    public AnalysisController(TestCoverageService testCoverageService,
                              ClarityService clarityService,
                              DocumentationService documentationService,
                              RefactoringService refactoringService,
                              SimplificationService simplificationService,
                              ToolResultRepo toolResultRepo,
                              SourceFileRepo sourceFileRepo) {
        this.testCoverageService   = testCoverageService;
        this.clarityService        = clarityService;
        this.documentationService  = documentationService;
        this.refactoringService    = refactoringService;
        this.simplificationService = simplificationService;
        this.toolResultRepo        = toolResultRepo;
        this.sourceFileRepo        = sourceFileRepo;
    }

    @PostMapping("/run")
    public ResponseEntity<List<ToolResult>> runTool(@RequestParam UUID repoId,
                                                    @RequestParam ToolType toolType) {
        List<SourceFile> sourceFiles = sourceFileRepo.findByRepositoryId(repoId);

        List<ToolResult> results = switch (toolType) {
            case COVERAGE      -> testCoverageService.analyzeCoverage(sourceFiles);
            case CLARITY       -> clarityService.analyzeClarity(sourceFiles);
            case DOCUMENTATION -> documentationService.analyzeDocumentation(sourceFiles);
            case REFACTORING   -> refactoringService.analyzeRefactoring(sourceFiles);
            case SIMPLIFICATION -> simplificationService.analyzeSimplification(sourceFiles);
        };

        return ResponseEntity.ok(results);
    }

    @GetMapping("/{runId}")
    public ResponseEntity<List<ToolResult>> getResults(@PathVariable UUID runId) {
        return ResponseEntity.ok(toolResultRepo.findByAnalysisRunId(runId));
    }

    @PatchMapping("/results/{id}/approve")
    public ResponseEntity<ToolResult> approveResult(@PathVariable UUID id) {
        return toolResultRepo.findById(id)
                .map(result -> {
                    result.setStatus(ResultStatus.APPROVED);
                    return ResponseEntity.ok(toolResultRepo.save(result));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/results/{id}/reject")
    public ResponseEntity<ToolResult> rejectResult(@PathVariable UUID id) {
        return toolResultRepo.findById(id)
                .map(result -> {
                    result.setStatus(ResultStatus.REJECTED);
                    return ResponseEntity.ok(toolResultRepo.save(result));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
