package MindUrCode.repository;

import MindUrCode.model.Method;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MethodRepo extends JpaRepository<Method, UUID> {

    // Get every method that belongs to a specific source file
    List<Method> findBySourceFileId(UUID sourceFileId);

    // Look up a method by its content hash to detect duplicates
    Optional<Method> findByCodeHash(String codeHash);
}
