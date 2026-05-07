package MindUrCode.controller;

import MindUrCode.enums.ResultStatus;
import MindUrCode.enums.ToolType;
import MindUrCode.model.AnalysisRun;
import MindUrCode.model.Repository;
import MindUrCode.model.SourceFile;
import MindUrCode.model.ToolResult;
import MindUrCode.repository.AnalysisRunRepo;
import MindUrCode.repository.RepositoryRepo;
import MindUrCode.repository.SourceFileRepo;
import MindUrCode.repository.ToolResultRepo;
import MindUrCode.service.ClarityService;
import MindUrCode.service.DocumentationService;
import MindUrCode.service.RefactoringService;
import MindUrCode.service.SimplificationService;
import MindUrCode.service.TestCoverageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
    private final AnalysisRunRepo analysisRunRepo;
    private final RepositoryRepo repositoryRepo;

    public AnalysisController(TestCoverageService testCoverageService,
                              ClarityService clarityService,
                              DocumentationService documentationService,
                              RefactoringService refactoringService,
                              SimplificationService simplificationService,
                              ToolResultRepo toolResultRepo,
                              SourceFileRepo sourceFileRepo,
                              AnalysisRunRepo analysisRunRepo,
                              RepositoryRepo repositoryRepo) {
        this.testCoverageService   = testCoverageService;
        this.clarityService        = clarityService;
        this.documentationService  = documentationService;
        this.refactoringService    = refactoringService;
        this.simplificationService = simplificationService;
        this.toolResultRepo        = toolResultRepo;
        this.sourceFileRepo        = sourceFileRepo;
        this.analysisRunRepo       = analysisRunRepo;
        this.repositoryRepo        = repositoryRepo;
    }

    @PostMapping("/run")
    public ResponseEntity<List<ToolResult>> runTool(@RequestParam UUID repoId,
                                                    @RequestParam ToolType toolType) {
        List<SourceFile> sourceFiles = sourceFileRepo.findByRepositoryId(repoId);

        Repository repo = repositoryRepo.findById(repoId).orElseThrow();
        AnalysisRun run = AnalysisRun.builder()
                .repository(repo)
                .status("RUNNING")
                .startedAt(LocalDateTime.now())
                .build();
        analysisRunRepo.save(run);

        UUID runId = run.getId();

        List<ToolResult> results = switch (toolType) {
            case COVERAGE       -> testCoverageService.analyzeCoverage(sourceFiles, runId);
            case CLARITY        -> clarityService.analyzeClarity(sourceFiles, runId);
            case DOCUMENTATION  -> documentationService.analyzeDocumentation(sourceFiles, runId);
            case REFACTORING    -> refactoringService.analyzeRefactoring(sourceFiles, runId);
            case SIMPLIFICATION -> simplificationService.analyzeSimplification(sourceFiles, runId);
        };

        run.setStatus("COMPLETED");
        run.setCompletedAt(LocalDateTime.now());
        analysisRunRepo.save(run);

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
