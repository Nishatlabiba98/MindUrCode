package MindUrCode.model;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "repositories")
public class repository {

@Id
@GeneratedValue(strategy = GenerationType.UUID)
private UUID id;

@Column(name ="user_id", nullable = false)
private UUID userId;

@Column(nullable = false)
private String name;

@Column(name = "source_type")
private String sourceType;

@Column(name = "source_path")
private String sourcePath;

@Column(name = "added_at")
private LocalDateTime addedAt;



public repository() {

}



public repository(UUID userId, String name, String sourceType, String sourcePath) {
    this.userId = userId;
    this.name = name;
    this.sourceType = sourceType;
    this.sourcePath = sourcePath;
    this.addedAt = LocalDateTime.now();
}



public UUID getId() {
    return id;
}

public void setId(UUID id) {
    this.id = id;
}


public UUID getUserId() {
    return userId;
}

public void setUserId(UUID userId) {
    this.userId = userId;
}

public String getName() {
    return name;
}
public void setName(String name) {
    this.name = name;
}

public String getSourceType() {
    return sourceType;
}
public void setSourceType(String sourceType) {
    this.sourceType = sourceType;
}
public String getSourcePath() {   
    return sourcePath;
}

public void setSourcePath(String sourcePath) {
    this.sourcePath = sourcePath;
}
public LocalDateTime getAddedAt() {
    return addedAt;
}
public void setAddedAt(LocalDateTime addedAt) {
    this.addedAt = addedAt;
}
}
