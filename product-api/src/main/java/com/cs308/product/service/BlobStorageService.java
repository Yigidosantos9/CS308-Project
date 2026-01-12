package com.cs308.product.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class BlobStorageService {

    @Value("${azure.storage.connection-string:}")
    private String connectionString;

    @Value("${azure.storage.container-name:container}")
    private String containerName;

    @Value("${image.upload.local-path:uploads}")
    private String localUploadPath;

    @Value("${server.port:9001}")
    private String serverPort;

    private BlobContainerClient containerClient;
    private boolean useLocalStorage = false;

    @PostConstruct
    public void init() {
        if (connectionString != null && !connectionString.isEmpty()) {
            try {
                BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                        .connectionString(connectionString)
                        .buildClient();
                containerClient = blobServiceClient.getBlobContainerClient(containerName);
                log.info("Azure Blob Storage initialized with container: {}", containerName);
            } catch (Exception e) {
                log.warn("Azure Blob Storage not configured, using local storage: {}", e.getMessage());
                useLocalStorage = true;
            }
        } else {
            log.info("Azure Blob Storage not configured, using local file storage");
            useLocalStorage = true;
        }

        // Ensure local upload directory exists
        if (useLocalStorage) {
            try {
                Path uploadDir = Paths.get(localUploadPath);
                if (!Files.exists(uploadDir)) {
                    Files.createDirectories(uploadDir);
                    log.info("Created local upload directory: {}", uploadDir.toAbsolutePath());
                }
            } catch (IOException e) {
                log.error("Failed to create local upload directory", e);
            }
        }
    }

    /**
     * Uploads an image. Uses Azure Blob Storage if configured, otherwise local file
     * storage.
     */
    public String uploadImage(MultipartFile file) throws IOException {
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;

        if (useLocalStorage) {
            return uploadToLocalStorage(file, uniqueFilename);
        } else {
            return uploadToAzureBlob(file, uniqueFilename);
        }
    }

    private String uploadToLocalStorage(MultipartFile file, String filename) throws IOException {
        Path targetPath = Paths.get(localUploadPath, filename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        log.info("Saved image to local storage: {}", targetPath);
        // Return relative URL path that will be served by ImageUploadController
        return "/images/" + filename;
    }

    private String uploadToAzureBlob(MultipartFile file, String blobName) throws IOException {
        if (containerClient == null) {
            throw new IllegalStateException("Azure Blob Storage is not configured");
        }
        BlobClient blobClient = containerClient.getBlobClient(blobName);
        blobClient.upload(file.getInputStream(), file.getSize(), true);
        String url = blobClient.getBlobUrl();
        log.info("Uploaded image to Azure Blob Storage: {}", url);
        return url;
    }

    /**
     * Check if storage is configured (always true now with local fallback)
     */
    public boolean isConfigured() {
        return true; // Always configured with local fallback
    }

    /**
     * Get local file path for serving images
     */
    public Path getLocalImagePath(String filename) {
        return Paths.get(localUploadPath, filename);
    }

    public boolean isUsingLocalStorage() {
        return useLocalStorage;
    }
}
