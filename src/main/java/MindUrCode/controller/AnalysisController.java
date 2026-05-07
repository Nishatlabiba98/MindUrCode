package MindUrCode.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    // TODO: wire in TestCoverageService once Mahala is done

    @PostMapping("/run")
    public String runTool(@RequestParam String repoId,
                          @RequestParam String toolType) {
        // TODO: route to correct service by toolType
        return "Tool run initiated for: " + toolType;
    }

    @GetMapping("/{runId}")
    public String getResults(@PathVariable String runId) {
        // TODO: fetch ToolResults by analysisRunId
        return "Results for run: " + runId;
    }

    @PatchMapping("/results/{id}/approve")
    public String approveResult(@PathVariable String id) {
        // TODO: update ToolResult status to APPROVED
        return "Approved: " + id;
    }

    @PatchMapping("/results/{id}/reject")
    public String rejectResult(@PathVariable String id) {
        // TODO: update ToolResult status to REJECTED
        return "Rejected: " + id;
    }
}
