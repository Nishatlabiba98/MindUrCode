package MindUrCode.repository;

import MindUrCode.enums.ResultStatus;
import MindUrCode.enums.ToolType;
import MindUrCode.model.ToolResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface ToolResultRepo extends JpaRepository<ToolResult, UUID> {

    List<ToolResult> findByMethodId(UUID methodId);

    void deleteByMethodId(UUID methodId);

    List<ToolResult> findByStatus(ResultStatus status);

    // Get all results produced during a specific analysis run
    List<ToolResult> findByAnalysisRunId(UUID analysisRunId);

    // Bulk fetch all ToolResults for the given method IDs + tool type, ordered
    // most-recent first. Replaces the per-method loop in getLatestResults.
    // Java-side de-dup picks the first (most recent) per method.
    List<ToolResult> findByMethodIdInAndToolTypeOrderByCreatedAtDesc(
            Collection<UUID> methodIds, ToolType toolType);
}
