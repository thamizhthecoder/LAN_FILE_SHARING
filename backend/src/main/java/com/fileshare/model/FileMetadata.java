package com.fileshare.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FileMetadata {
    private String id;
    private String originalFilename;
    private long size;
    private String contentType;
    private LocalDateTime uploadedAt;
    private LocalDateTime expiresAt;
    private String storedPath;
    private boolean isDownloaded;
    private java.util.List<String> downloadedBy = new java.util.ArrayList<>();
    private String sharingMode = "SINGLE";
    private boolean isPotentiallyDangerous;
}
