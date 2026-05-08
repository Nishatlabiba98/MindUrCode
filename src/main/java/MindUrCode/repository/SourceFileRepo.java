package MindUrCode.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import MindUrCode.model.SourceFile;

@Repository
public interface SourceFileRepo extends JpaRepository<SourceFile, UUID> {
    List<SourceFile> findByRepositoryId(UUID repositoryId);
}