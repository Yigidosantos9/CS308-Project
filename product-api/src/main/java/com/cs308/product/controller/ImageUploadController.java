package com.cs308.product.controller;

import com.cs308.product.service.BlobStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
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
     * Upload a single image.
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
     * Upload multiple images.
     * Returns a list of URLs for the uploaded images.
     */
    @PostMapping("/upload-multiple")
    public ResponseEntity<?> uploadMultipleImages(@RequestParam("files") MultipartFile[] files) {
        log.info("Received multiple image upload request: {} files", files.length);

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

    /**
     * Serve locally stored images.
     * This endpoint is only used when Azure Blob Storage is not configured.
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            if (!blobStorageService.isUsingLocalStorage()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = blobStorageService.getLocalImagePath(filename);
            if (!Files.exists(filePath)) {
                log.warn("Image not found: {}", filename);
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                    .body(resource);
        } catch (Exception e) {
            log.error("Error serving image {}: {}", filename, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
