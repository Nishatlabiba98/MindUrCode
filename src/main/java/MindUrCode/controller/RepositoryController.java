package MindUrCode.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import MindUrCode.model.AnalysisRun;
import MindUrCode.model.Repository;
import MindUrCode.repository.RepositoryRepo;
import MindUrCode.service.RepoIngestionService;

@RestController
@RequestMapping("/api/repositories")
public class RepositoryController {

    private final RepositoryRepo repositoryRepo;
    private final RepoIngestionService repoIngestionService;

    public RepositoryController(RepositoryRepo repositoryRepo,
                                RepoIngestionService repoIngestionService) {
        this.repositoryRepo       = repositoryRepo;
        this.repoIngestionService = repoIngestionService;
    }

    // Submit a repo for ingestion and analysis
    @PostMapping
    public ResponseEntity<AnalysisRun> submitRepo(@RequestParam String name,
                                                  @RequestParam String sourcePath,
                                                  @RequestParam UUID userId) {
        AnalysisRun run = repoIngestionService.ingestRepository(sourcePath, name, userId);
        return ResponseEntity.ok(run);
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

    // Delete a repo and all its associated data
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRepo(@PathVariable UUID id) {
        repoIngestionService.deleteRepository(id);
        return ResponseEntity.noContent().build();
    }
}
