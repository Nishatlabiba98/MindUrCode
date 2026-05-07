package MindUrCode.model;

import MindUrCode.enums.ResultStatus;
import MindUrCode.enums.ToolType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "tool_result")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToolResult {

    @Id
    private UUID id;

    @Column(name = "method_id", nullable = false)
    private UUID methodId;

    @Column(name = "analysis_run_id")
    private UUID analysisRunId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tool_type", nullable = false)
    private ToolType toolType;

    @Column(name = "ai_suggestion", columnDefinition = "TEXT")
    private String aiSuggestion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResultStatus status;

    @Column(name = "created_at")
    private Timestamp createdAt;
}
