package MindUrCode.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import MindUrCode.model.AnalysisRun;

@Repository
public interface AnalysisRunRepo extends JpaRepository<AnalysisRun, UUID> {
    List<AnalysisRun> findByRepositoryId(UUID repositoryId);
}