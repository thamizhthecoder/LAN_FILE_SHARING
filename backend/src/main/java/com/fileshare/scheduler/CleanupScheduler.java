package com.fileshare.scheduler;

import com.fileshare.model.FileMetadata;
import com.fileshare.service.FileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Slf4j
public class CleanupScheduler {

    @Autowired
    private FileService fileService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Run every minute
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredFiles() {
        LocalDateTime now = LocalDateTime.now();
        log.debug("Running cleanup scheduler at {}", now);

        for (FileMetadata metadata : fileService.getAllFiles()) {
            if (now.isAfter(metadata.getExpiresAt())) {
                log.info("File {} has expired. Deleting...", metadata.getId());
                fileService.deleteFile(metadata.getId());
                java.util.Map<String, String> statusMsg = new java.util.HashMap<>();
                statusMsg.put("id", metadata.getId());
                statusMsg.put("status", "EXPIRED");
                messagingTemplate.convertAndSend("/topic/file-status", statusMsg);
            }
        }
    }
}
