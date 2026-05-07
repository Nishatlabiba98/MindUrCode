package MindUrCode.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "method")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Method {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "source_file_id", nullable = false)
    private SourceFile sourceFile;

    @Column(nullable = false)
    private String methodName;

    private int lineStart;
    private int lineEnd;

    @Column(columnDefinition = "TEXT")
    private String rawCode;

    private String codeHash;
}
