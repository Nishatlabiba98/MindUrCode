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
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // The method this suggestion was generated for
    @Column(name = "method_id", nullable = false)
    private UUID methodId;

    // The analysis run this result belongs to (set when controller wires in AnalysisRun)
    @Column(name = "analysis_run_id")
    private UUID analysisRunId;

    // Which tool produced this result
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ToolType toolType;

    // The AI's suggestion text
    @Column(columnDefinition = "TEXT", nullable = false)
    private String aiSuggestion;

    // Whether the developer has approved or rejected this suggestion
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResultStatus status;

    // When this result was created
    @Column(name = "created_at")
    private Timestamp createdAt;
}
