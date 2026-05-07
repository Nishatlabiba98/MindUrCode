package MindUrCode.controller;

import MindUrCode.model.AnalysisRun;
import MindUrCode.model.Repository;
import MindUrCode.repository.RepositoryRepo;
import MindUrCode.service.RepoIngestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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
    public ResponseEntity<AnalysisRun> submitRepo(@RequestParam String sourcePath,
                                                  @RequestParam String name) {
        AnalysisRun run = repoIngestionService.ingestRepository(sourcePath, name);
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
}
