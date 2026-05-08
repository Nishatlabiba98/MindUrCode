package MindUrCode.controller;

import MindUrCode.enums.ResultStatus;
import MindUrCode.enums.ToolType;
import MindUrCode.model.AnalysisRun;
import MindUrCode.model.Method;
import MindUrCode.model.Repository;
import MindUrCode.model.SourceFile;
import MindUrCode.model.ToolResult;
import MindUrCode.repository.AnalysisRunRepo;
import MindUrCode.repository.MethodRepo;
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
import java.util.stream.Collectors;

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
    private final RepositoryRepo repositoryRepo;
    private final AnalysisRunRepo analysisRunRepo;
    private final MethodRepo methodRepo;

    public AnalysisController(TestCoverageService testCoverageService,
                              ClarityService clarityService,
                              DocumentationService documentationService,
                              RefactoringService refactoringService,
                              SimplificationService simplificationService,
                              ToolResultRepo toolResultRepo,
                              SourceFileRepo sourceFileRepo,
                              RepositoryRepo repositoryRepo,
                              AnalysisRunRepo analysisRunRepo,
                              MethodRepo methodRepo) {
        this.testCoverageService   = testCoverageService;
        this.clarityService        = clarityService;
        this.documentationService  = documentationService;
        this.refactoringService    = refactoringService;
        this.simplificationService = simplificationService;
        this.toolResultRepo        = toolResultRepo;
        this.sourceFileRepo        = sourceFileRepo;
        this.repositoryRepo        = repositoryRepo;
        this.analysisRunRepo       = analysisRunRepo;
        this.methodRepo            = methodRepo;
    }

    @PostMapping("/run")
    public ResponseEntity<List<ToolResult>> runTool(@RequestParam UUID repoId,
                                                    @RequestParam ToolType toolType) {
        Repository repo = repositoryRepo.findById(repoId)
                .orElseThrow(() -> new IllegalArgumentException("Repo not found: " + repoId));

        List<SourceFile> sourceFiles = sourceFileRepo.findByRepositoryId(repoId);

        AnalysisRun run = new AnalysisRun();
        run.setRepository(repo);
        run.setStatus("RUNNING");
        run.setStartedAt(LocalDateTime.now());
        analysisRunRepo.save(run);

        List<ToolResult> results = switch (toolType) {
            case COVERAGE       -> testCoverageService.analyzeCoverage(sourceFiles, run.getId());
            case CLARITY        -> clarityService.analyzeClarity(sourceFiles, run.getId());
            case DOCUMENTATION  -> documentationService.analyzeDocumentation(sourceFiles, run.getId());
            case REFACTORING    -> refactoringService.analyzeRefactoring(sourceFiles, run.getId());
            case SIMPLIFICATION -> simplificationService.analyzeSimplification(sourceFiles, run.getId());
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

    @GetMapping("/results/latest")
    public ResponseEntity<List<ToolResult>> getLatestResults(
            @RequestParam UUID repoId,
            @RequestParam ToolType toolType) {

        List<SourceFile> files = sourceFileRepo.findByRepositoryId(repoId);

        List<UUID> methodIds = files.stream()
                .flatMap(sf -> methodRepo.findBySourceFileId(sf.getId()).stream())
                .map(Method::getId)
                .collect(Collectors.toList());

        List<ToolResult> latest = methodIds.stream()
                .flatMap(mid -> toolResultRepo.findByMethodId(mid).stream()
                        .filter(r -> r.getToolType() == toolType)
                        .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                        .limit(1))
                .collect(Collectors.toList());

        return ResponseEntity.ok(latest);
    }

    @GetMapping("/methods/{methodId}")
    public ResponseEntity<Method> getMethod(@PathVariable UUID methodId) {
        return methodRepo.findById(methodId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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
