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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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

        // 1 query: every method ID in this repo (joins methods → source_files).
        List<UUID> methodIds = methodRepo.findIdsByRepositoryId(repoId);
        if (methodIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        // 1 query: every ToolResult for those methods + this tool, ordered
        // newest-first. We then keep the first result per method ID.
        List<ToolResult> all = toolResultRepo
                .findByMethodIdInAndToolTypeOrderByCreatedAtDesc(methodIds, toolType);

        Set<UUID> seen = new HashSet<>();
        List<ToolResult> latest = all.stream()
                .filter(r -> seen.add(r.getMethodId()))  // dedupe by method, keep newest
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

    // Sets a previously-approved or previously-rejected result back to PENDING.
    // Powers the "Undo" button on findings in the Approved / Rejected tabs.
    @PatchMapping("/results/{id}/pending")
    public ResponseEntity<ToolResult> undoResult(@PathVariable UUID id) {
        return toolResultRepo.findById(id)
                .map(result -> {
                    result.setStatus(ResultStatus.PENDING);
                    return ResponseEntity.ok(toolResultRepo.save(result));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
