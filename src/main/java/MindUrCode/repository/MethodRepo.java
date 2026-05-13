package MindUrCode.repository;

import MindUrCode.model.Method;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MethodRepo extends JpaRepository<Method, UUID> {

    List<Method> findBySourceFileId(UUID sourceFileId);

    Optional<Method> findByCodeHash(String codeHash);

    // Returns every method ID belonging to the given repo, in a single SQL
    // query (joins methods → source_files). Replaces the N+1 loop in
    // AnalysisController.getLatestResults.
    @Query("SELECT m.id FROM Method m WHERE m.sourceFile.id IN " +
           "(SELECT sf.id FROM SourceFile sf WHERE sf.repository.id = :repoId)")
    List<UUID> findIdsByRepositoryId(@Param("repoId") UUID repoId);
}
