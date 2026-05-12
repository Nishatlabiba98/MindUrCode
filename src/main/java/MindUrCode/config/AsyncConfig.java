package MindUrCode.config;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AsyncConfig {

    /**
     * Shared pool used by every analysis service to run per-method Ollama
     * calls concurrently. 16 daemon workers is well above the Ollama server's
     * NUM_PARALLEL ceiling (4 by default), so threads cycle quickly while
     * Ollama drains the queue.
     */
    @Bean
    public ExecutorService analysisExecutor() {
        AtomicInteger seq = new AtomicInteger(1);
        return Executors.newFixedThreadPool(16, r -> {
            Thread t = new Thread(r, "analysis-worker-" + seq.getAndIncrement());
            t.setDaemon(true);
            return t;
        });
    }
}
