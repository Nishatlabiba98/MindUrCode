package MindUrCode.controller;

import MindUrCode.enums.ResultStatus;
import MindUrCode.model.ToolResult;
import MindUrCode.repository.ToolResultRepo;
import MindUrCode.service.TestCoverageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    private final TestCoverageService testCoverageService;
    private final ToolResultRepo toolResultRepo;

    public AnalysisController(TestCoverageService testCoverageService,
                              ToolResultRepo toolResultRepo) {
        this.testCoverageService = testCoverageService;
        this.toolResultRepo      = toolResultRepo;
    }

    @PostMapping("/run")
    public String runTool(@RequestParam String repoId,
                          @RequestParam String toolType) {
        // TODO: fetch SourceFiles by repoId, create AnalysisRun, route to correct service by toolType
        return "Tool run initiated for: " + toolType;
    }

    @GetMapping("/{runId}")
    public String getResults(@PathVariable String runId) {
        // TODO: fetch ToolResults by analysisRunId
        return "Results for run: " + runId;
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
