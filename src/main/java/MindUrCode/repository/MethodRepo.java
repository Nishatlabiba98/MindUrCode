package MindUrCode.repository;

import MindUrCode.model.Method;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MethodRepo extends JpaRepository<Method, UUID> {

    List<Method> findBySourceFileId(UUID sourceFileId);

    Optional<Method> findByCodeHash(String codeHash);
}
