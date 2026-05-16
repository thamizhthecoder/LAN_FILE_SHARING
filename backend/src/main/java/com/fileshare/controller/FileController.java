package com.fileshare.controller;

import com.fileshare.model.FileMetadata;
import com.fileshare.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/file")
public class FileController {

    @Autowired
    private FileService fileService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "sharingMode", defaultValue = "SINGLE") String sharingMode) {
        try {
            FileMetadata metadata = fileService.storeFile(file, sharingMode);
            
            // Notify via WebSocket that a new file is available
            messagingTemplate.convertAndSend("/topic/files", metadata);
            
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String id, jakarta.servlet.http.HttpServletRequest request) {
        try {
            FileMetadata metadata = fileService.getFileMetadata(id);
            if (metadata == null) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = fileService.getFilePath(id);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                // Get downloader IP
                String downloaderIp = request.getRemoteAddr();
                if (downloaderIp.equals("0:0:0:0:0:0:0:1")) downloaderIp = "127.0.0.1";
                metadata.getDownloadedBy().add(downloaderIp);

                // Mark as downloaded and notify
                metadata.setDownloaded(true);
                Map<String, String> statusMsg = new HashMap<>();
                statusMsg.put("id", id);
                statusMsg.put("status", "DOWNLOADED");
                statusMsg.put("downloadedBy", downloaderIp);
                messagingTemplate.convertAndSend("/topic/file-status", statusMsg);
                
                // Only auto-delete if mode is SINGLE
                if ("SINGLE".equalsIgnoreCase(metadata.getSharingMode())) {
                    new Thread(() -> {
                        try {
                            Thread.sleep(60000); // Wait 1 minute for download to finish
                            fileService.deleteFile(id);
                            Map<String, String> delMsg = new HashMap<>();
                            delMsg.put("id", id);
                            delMsg.put("status", "DELETED");
                            messagingTemplate.convertAndSend("/topic/file-status", delMsg);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }).start();
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(metadata.getContentType() != null ? metadata.getContentType() : "application/octet-stream"))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getOriginalFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFileDetails(@PathVariable String id) {
        FileMetadata metadata = fileService.getFileMetadata(id);
        if (metadata != null) {
            return ResponseEntity.ok(metadata);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/all")
    public ResponseEntity<Collection<FileMetadata>> getAllFiles() {
        return ResponseEntity.ok(fileService.getAllFiles());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable String id) {
        fileService.deleteFile(id);
        Map<String, String> statusMsg = new HashMap<>();
        statusMsg.put("id", id);
        statusMsg.put("status", "DELETED");
        messagingTemplate.convertAndSend("/topic/file-status", statusMsg);
        return ResponseEntity.ok().build();
    }
}
