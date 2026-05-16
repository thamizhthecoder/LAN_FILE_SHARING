package com.fileshare.service;

import com.fileshare.model.FileMetadata;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class FileService {

    @Value("${file.upload-dir:temp-uploads}")
    private String uploadDir;

    @Value("${file.expiration-minutes:30}")
    private int expirationMinutes;

    private Path fileStorageLocation;
    private final Map<String, FileMetadata> fileStore = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("Initialized upload directory at: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public FileMetadata storeFile(MultipartFile file, String sharingMode) {
        String originalFilename = StringUtils
                .cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown_file");
        String id = UUID.randomUUID().toString();

        try {
            if (originalFilename.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFilename);
            }

            Path targetLocation = this.fileStorageLocation.resolve(id);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            boolean isDangerous = originalFilename.toLowerCase().matches(".*\\.(exe|bat|cmd|sh|vbs|msi|apk|jar|ps1)$");

            FileMetadata metadata = new FileMetadata();
            metadata.setId(id);
            metadata.setOriginalFilename(originalFilename);
            metadata.setSize(file.getSize());
            metadata.setContentType(file.getContentType());
            metadata.setUploadedAt(LocalDateTime.now());
            metadata.setExpiresAt(LocalDateTime.now().plusMinutes(expirationMinutes));
            metadata.setStoredPath(targetLocation.toString());
            metadata.setDownloaded(false);
            metadata.setSharingMode(sharingMode);
            metadata.setPotentiallyDangerous(isDangerous);

            fileStore.put(id, metadata);
            return metadata;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFilename + ". Please try again!", ex);
        }
    }

    public FileMetadata getFileMetadata(String id) {
        return fileStore.get(id);
    }

    public Path getFilePath(String id) {
        FileMetadata metadata = getFileMetadata(id);
        if (metadata != null) {
            return Paths.get(metadata.getStoredPath());
        }
        return null;
    }

    public void deleteFile(String id) {
        FileMetadata metadata = fileStore.remove(id);
        if (metadata != null) {
            try {
                Path filePath = Paths.get(metadata.getStoredPath());
                Files.deleteIfExists(filePath);
                log.info("Deleted file: {}", id);
            } catch (IOException e) {
                log.error("Error deleting file: {}", id, e);
            }
        }
    }

    public Collection<FileMetadata> getAllFiles() {
        return fileStore.values();
    }
}
