package MindUrCode.repository;

import MindUrCode.enums.ResultStatus;
import MindUrCode.model.ToolResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ToolResultRepo extends JpaRepository<ToolResult, UUID> {

    // Get all AI suggestions ever generated for a specific method
    List<ToolResult> findByMethodId(UUID methodId);

    // Get all results with a given status (PENDING, APPROVED, REJECTED)
    List<ToolResult> findByStatus(ResultStatus status);

    // Get all results produced during a specific analysis run
    List<ToolResult> findByAnalysisRunId(UUID analysisRunId);
}
