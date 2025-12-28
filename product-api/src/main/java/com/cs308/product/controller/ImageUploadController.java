package com.cs308.product.controller;

import com.cs308.product.service.BlobStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
public class ImageUploadController {

    private final BlobStorageService blobStorageService;

    /**
     * Upload a single image to Azure Blob Storage.
     * Returns the URL of the uploaded image.
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        log.info("Received image upload request: {}", file.getOriginalFilename());

        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "File must be an image"));
        }

        // Check if blob storage is configured
        if (!blobStorageService.isConfigured()) {
            return ResponseEntity.status(503).body(Map.of("error", "Image storage is not configured"));
        }

        try {
            String url = blobStorageService.uploadImage(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            response.put("filename", file.getOriginalFilename());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to upload image: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }

    /**
     * Upload multiple images to Azure Blob Storage.
     * Returns a list of URLs for the uploaded images.
     */
    @PostMapping("/upload-multiple")
    public ResponseEntity<?> uploadMultipleImages(@RequestParam("files") MultipartFile[] files) {
        log.info("Received multiple image upload request: {} files", files.length);

        if (!blobStorageService.isConfigured()) {
            return ResponseEntity.status(503).body(Map.of("error", "Image storage is not configured"));
        }

        List<Map<String, String>> results = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                errors.add("Empty file skipped");
                continue;
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                errors.add("Non-image file skipped: " + file.getOriginalFilename());
                continue;
            }

            try {
                String url = blobStorageService.uploadImage(file);
                Map<String, String> result = new HashMap<>();
                result.put("url", url);
                result.put("filename", file.getOriginalFilename());
                results.add(result);
            } catch (Exception e) {
                errors.add("Failed to upload " + file.getOriginalFilename() + ": " + e.getMessage());
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("uploaded", results);
        response.put("errors", errors);
        return ResponseEntity.ok(response);
    }
}
