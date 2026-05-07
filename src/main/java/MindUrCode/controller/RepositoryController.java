package MindUrCode.controller;

import MindUrCode.model.Repository;
import MindUrCode.repository.RepositoryRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/repositories")
public class RepositoryController {

    private final RepositoryRepo repositoryRepo;

    public RepositoryController(RepositoryRepo repositoryRepo) {
        this.repositoryRepo = repositoryRepo;
    }

    // Submit a repo for analysis
    @PostMapping
    public ResponseEntity<Repository> submitRepo(@RequestBody Repository repository) {
        // TODO: hand off to RepoIngestionService once Joseph builds it
        Repository saved = repositoryRepo.save(repository);
        return ResponseEntity.ok(saved);
    }

    // Get all repos submitted by a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Repository>> getReposByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(repositoryRepo.findByUserId(userId));
    }

    // Get a single repo by ID
    @GetMapping("/{id}")
    public ResponseEntity<Repository> getRepo(@PathVariable UUID id) {
        return repositoryRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
