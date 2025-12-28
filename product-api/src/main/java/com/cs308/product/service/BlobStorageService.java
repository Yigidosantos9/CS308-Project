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
import java.util.UUID;

@Slf4j
@Service
public class BlobStorageService {

    @Value("${azure.storage.connection-string:}")
    private String connectionString;

    @Value("${azure.storage.container-name:container}")
    private String containerName;

    private BlobContainerClient containerClient;

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
                log.warn("Azure Blob Storage not configured: {}", e.getMessage());
            }
        } else {
            log.warn("Azure Blob Storage connection string not configured");
        }
    }

    /**
     * Uploads an image to Azure Blob Storage.
     * 
     * @param file The multipart file to upload
     * @return The URL of the uploaded image
     * @throws IOException if upload fails
     */
    public String uploadImage(MultipartFile file) throws IOException {
        if (containerClient == null) {
            throw new IllegalStateException("Azure Blob Storage is not configured");
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String blobName = UUID.randomUUID().toString() + extension;

        // Upload to blob storage
        BlobClient blobClient = containerClient.getBlobClient(blobName);
        blobClient.upload(file.getInputStream(), file.getSize(), true);

        String url = blobClient.getBlobUrl();
        log.info("Uploaded image to Azure Blob Storage: {}", url);

        return url;
    }

    /**
     * Check if blob storage is configured
     */
    public boolean isConfigured() {
        return containerClient != null;
    }
}
