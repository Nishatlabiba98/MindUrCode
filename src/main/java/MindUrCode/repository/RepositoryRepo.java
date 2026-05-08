package MindUrCode.repository;

import MindUrCode.model.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Repository
public interface RepositoryRepo extends JpaRepository<Repository, UUID> {

    List<Repository> findByUserId(UUID userId);
}
