package MindUrCode.repository;

import MindUrCode.enums.ResultStatus;
import MindUrCode.model.ToolResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ToolResultRepo extends JpaRepository<ToolResult, UUID> {

    List<ToolResult> findByMethodId(UUID methodId);

    List<ToolResult> findByStatus(ResultStatus status);
}
