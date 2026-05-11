package MindUrCode.service;


import MindUrCode.model.AnalysisRun;
import MindUrCode.model.Method;
import MindUrCode.model.Repository;
import MindUrCode.model.SourceFile;
import MindUrCode.repository.AnalysisRunRepo;
import MindUrCode.repository.MethodRepo;
import MindUrCode.repository.SourceFileRepo;
import MindUrCode.repository.RepositoryRepo;
import MindUrCode.repository.ToolResultRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class RepoIngestionService {

    private final SourceFileRepo sourceFileRepo;
    private final AnalysisRunRepo analysisRunRepo;
    private final RepositoryRepo repositoryRepo;
    private final JavaParserService javaParserService;
    private final MethodRepo methodRepo;
    private final ToolResultRepo toolResultRepo;

    public RepoIngestionService(SourceFileRepo sourceFileRepo,
                                 AnalysisRunRepo analysisRunRepo,
                                 RepositoryRepo repositoryRepo,
                                 JavaParserService javaParserService,
                                 MethodRepo methodRepo,
                                 ToolResultRepo toolResultRepo) {
        this.sourceFileRepo    = sourceFileRepo;
        this.analysisRunRepo   = analysisRunRepo;
        this.repositoryRepo    = repositoryRepo;
        this.javaParserService = javaParserService;
        this.methodRepo        = methodRepo;
        this.toolResultRepo    = toolResultRepo;
    }

    public AnalysisRun ingestRepository(String sourcePath, String name, UUID userId) {

        Repository repo = new Repository();
        repo.setUserId(userId);
        repo.setName(name);
        repo.setSourcePath(sourcePath);
        repo.setSourceType(sourcePath.startsWith("http") ? "GIT_URL" : "LOCAL_PATH");
        repo.setAddedAt(LocalDateTime.now());
        repositoryRepo.save(repo);

        AnalysisRun run = new AnalysisRun();
        run.setRepository(repo);
        run.setStatus("RUNNING");
        run.setStartedAt(LocalDateTime.now());
        analysisRunRepo.save(run);

        try {
            // If it's a GitHub URL, clone it first
            Path rootPath;
            if (sourcePath.startsWith("http")) {
                Path tempDir = Files.createTempDirectory("mindurcode-clone-");
                org.eclipse.jgit.api.Git.cloneRepository()
                        .setURI(sourcePath)
                        .setDirectory(tempDir.toFile())
                        .call();
                rootPath = tempDir;
            } else {
                rootPath = Paths.get(sourcePath);
            }
            List<SourceFile> files = walkJavaFiles(rootPath, repo);
            sourceFileRepo.saveAll(files);

            List<Method> allMethods = new ArrayList<>();
            for (SourceFile sf : files) {
                try {
                    List<Method> methods = javaParserService.extractMethods(new File(sf.getFilePath()), sf);
                    allMethods.addAll(methods);
                } catch (Exception ignored) {}
            }
            methodRepo.saveAll(allMethods);

            run.setStatus("COMPLETED");
            run.setCompletedAt(LocalDateTime.now());
            analysisRunRepo.save(run);

        } catch (Exception e) {
            run.setStatus("FAILED");
            analysisRunRepo.save(run);
        }

        return run;
    }

    // ── DELETE REPOSITORY ─────────────────────────
    // Deletes a repo and all its child data in FK-safe order:
    // tool_results → methods → source_files → analysis_runs → repository
    @Transactional
    public void deleteRepository(UUID repoId) {
        List<SourceFile> files = sourceFileRepo.findByRepositoryId(repoId);
        for (SourceFile file : files) {
            List<Method> methods = methodRepo.findBySourceFileId(file.getId());
            for (Method method : methods) {
                toolResultRepo.deleteByMethodId(method.getId());
            }
            methodRepo.deleteAll(methods);
        }
        sourceFileRepo.deleteAll(files);
        List<AnalysisRun> runs = analysisRunRepo.findByRepositoryId(repoId);
        analysisRunRepo.deleteAll(runs);
        repositoryRepo.deleteById(repoId);
    }

    // ── WALK FILES ────────────────────────────────
    // Goes through every .java file in the folder
    private List<SourceFile> walkJavaFiles(Path root, 
                                            Repository repo) throws IOException {
        List<SourceFile> sourceFiles = new ArrayList<>();
        Files.walkFileTree(root, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
                if (file.toString().endsWith(".java")) {
                    SourceFile sf = new SourceFile();
                    sf.setFilePath(file.toString());
                    sf.setFileType("JAVA");
                    sf.setRepository(repo);
                    sourceFiles.add(sf);
                }
                return FileVisitResult.CONTINUE;
            }
        });
        return sourceFiles;
    }
}
