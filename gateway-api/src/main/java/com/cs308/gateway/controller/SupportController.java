package com.cs308.gateway.controller;

import com.cs308.gateway.model.support.StartChatResponse;
import com.cs308.gateway.model.support.SupportChatMessage;
import com.cs308.gateway.model.support.SupportChatSession;
import com.cs308.gateway.model.support.SupportChatStatus;
import com.cs308.gateway.model.support.SupportMessageRequest;
import com.cs308.gateway.model.support.SupportSenderType;
import com.cs308.gateway.model.auth.enums.UserType;
import com.cs308.gateway.security.SecurityContext;
import com.cs308.gateway.service.SupportChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportChatService supportChatService;
    private static final long MAX_FILE_BYTES = 5 * 1024 * 1024;

    // Anyone (guests or customers) can initiate chat
    @PostMapping("/chat/start")
    public ResponseEntity<?> startChat(
            @AuthenticationPrincipal SecurityContext securityContext,
            @RequestBody(required = false) Object chatRequest) {
        Long userId = (securityContext != null) ? securityContext.getUserId() : null;
        if (userId == null && chatRequest instanceof Map<?, ?> requestMap) {
            Object rawCustomerId = requestMap.get("customerId");
            if (rawCustomerId == null) {
                rawCustomerId = requestMap.get("userId");
            }
            if (rawCustomerId instanceof Number) {
                userId = ((Number) rawCustomerId).longValue();
            } else if (rawCustomerId instanceof String) {
                try {
                    userId = Long.parseLong((String) rawCustomerId);
                } catch (NumberFormatException ignored) {
                }
            }
        }
        log.info("BFF: Start chat request - userId: {}", userId);
        SupportChatSession session = supportChatService.startChat(userId, chatRequest);
        StartChatResponse response = new StartChatResponse(session.getId(), session.getStatus());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/chat/active")
    public ResponseEntity<?> getActiveChat(
            @AuthenticationPrincipal SecurityContext securityContext,
            @RequestParam(required = false) Long customerId) {
        Long userId = (securityContext != null) ? securityContext.getUserId() : customerId;
        if (userId == null) {
            return ResponseEntity.noContent().build();
        }
        SupportChatSession session = supportChatService.getActiveChat(userId);
        if (session == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(Map.of("chatId", session.getId(), "status", session.getStatus()));
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<?> getChat(
            @AuthenticationPrincipal SecurityContext securityContext,
            @PathVariable Long chatId) {
        SupportChatSession session = supportChatService.getSession(chatId);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chat not found"));
        }
        if (!isAuthorizedForSession(securityContext, session)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chat not found"));
        }
        return ResponseEntity.ok(Map.of("chatId", session.getId(), "status", session.getStatus()));
    }

    // Customers or guests can send messages
    @PostMapping("/chat/{chatId}/message")
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal SecurityContext securityContext,
            @PathVariable Long chatId,
            @RequestBody SupportMessageRequest messageRequest) {
        log.info("BFF: Send message request - chatId: {}", chatId);
        if (messageRequest == null || messageRequest.getContent() == null || messageRequest.getContent().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message content is required"));
        }

        SupportChatSession session = supportChatService.getSession(chatId);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chat not found"));
        }
        if (!isAuthorizedForSession(securityContext, session)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chat not found"));
        }
        if (session.getStatus() == SupportChatStatus.CLOSED) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Chat is closed"));
        }

        Long senderId = securityContext != null ? securityContext.getUserId() : null;
        SupportSenderType senderType = messageRequest.getSenderType();
        if (senderType == null) {
            senderType = senderId != null ? SupportSenderType.CUSTOMER : SupportSenderType.GUEST;
        }

        SupportChatMessage message = supportChatService.addMessage(chatId, senderId, senderType, messageRequest.getContent());
        return ResponseEntity.ok(message);
    }

    @PostMapping(value = "/chat/{chatId}/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<?>> uploadFile(
            @AuthenticationPrincipal SecurityContext securityContext,
            @PathVariable Long chatId,
            @RequestPart("file") FilePart file) {
        if (file == null) {
            return Mono.just(ResponseEntity.badRequest().body(Map.of("error", "File is required")));
        }
        SupportChatSession session = supportChatService.getSession(chatId);
        if (session == null) {
            return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chat not found")));
        }
        if (!isAuthorizedForSession(securityContext, session)) {
            return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chat not found")));
        }
        if (session.getStatus() == SupportChatStatus.CLOSED) {
            return Mono.just(ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Chat is closed")));
        }

        Long senderId = securityContext != null ? securityContext.getUserId() : null;
        SupportSenderType senderType = senderId != null ? SupportSenderType.CUSTOMER : SupportSenderType.GUEST;
        return DataBufferUtils.join(file.content())
                .map(dataBuffer -> {
                    byte[] bytes = new byte[dataBuffer.readableByteCount()];
                    dataBuffer.read(bytes);
                    DataBufferUtils.release(dataBuffer);
                    return bytes;
                })
                .map(bytes -> {
                    if (bytes.length == 0) {
                        return ResponseEntity.badRequest().body(Map.of("error", "File is required"));
                    }
                    if (bytes.length > MAX_FILE_BYTES) {
                        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                                .body(Map.of("error", "File too large (max 5MB)"));
                    }
                    SupportChatMessage message = supportChatService.addAttachmentMessage(
                            chatId,
                            senderId,
                            senderType,
                            file.filename(),
                            file.headers().getContentType() != null ? file.headers().getContentType().toString() : null,
                            bytes
                    );
                    if (message == null) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Upload failed"));
                    }
                    return ResponseEntity.ok(message);
                });
    }

    @GetMapping("/chat/{chatId}/file/{fileId}")
    public ResponseEntity<Resource> downloadFile(
            @AuthenticationPrincipal SecurityContext securityContext,
            @PathVariable Long chatId,
            @PathVariable Long fileId) {
        SupportChatService.StoredFile storedFile = supportChatService.getStoredFile(fileId);
        if (storedFile == null || storedFile.getAttachment() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        if (!chatId.equals(storedFile.getAttachment().getChatId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        SupportChatSession session = supportChatService.getSession(chatId);
        if (session == null || !isAuthorizedForSession(securityContext, session)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        String contentType = storedFile.getAttachment().getContentType();
        MediaType mediaType = (contentType != null) ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM;
        Resource resource = new ByteArrayResource(storedFile.getBytes());
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header("Content-Disposition", "attachment; filename=\"" + storedFile.getAttachment().getFilename() + "\"")
                .body(resource);
    }

    @PostMapping("/chat/{chatId}/close")
    public ResponseEntity<?> closeChat(
            @AuthenticationPrincipal SecurityContext securityContext,
            @PathVariable Long chatId) {
        log.info("BFF: Close chat request - chatId: {}", chatId);
        SupportChatSession session = supportChatService.getSession(chatId);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chat not found"));
        }
        if (!isAuthorizedForSession(securityContext, session)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chat not found"));
        }
        SupportChatSession closed = supportChatService.closeChat(chatId);
        if (closed == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chat not found"));
        }
        return ResponseEntity.ok(Map.of("chatId", chatId, "status", closed.getStatus()));
    }

    @GetMapping("/chat/{chatId}/messages")
    public ResponseEntity<?> getMessages(
            @AuthenticationPrincipal SecurityContext securityContext,
            @PathVariable Long chatId,
            @RequestParam(required = false) Long afterId) {
        log.info("BFF: Get messages request - chatId: {}", chatId);
        SupportChatSession session = supportChatService.getSession(chatId);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chat not found"));
        }
        if (!isAuthorizedForSession(securityContext, session)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chat not found"));
        }
        List<SupportChatMessage> messages = supportChatService.getMessages(chatId, afterId);
        return ResponseEntity.ok(messages);
    }

    // Support Agents can view chat queue
    @GetMapping("/chat/queue")
    public ResponseEntity<?> getChatQueue(
            @AuthenticationPrincipal SecurityContext securityContext,
            @RequestParam(required = false) Long agentId) {
        Long resolvedAgentId = securityContext != null ? securityContext.getUserId() : agentId;
        log.info("BFF: Get chat queue request (Support Agent) - agentId: {}", resolvedAgentId);
        List<SupportChatSession> queuedSessions = supportChatService.getQueueForAgent(resolvedAgentId);
        long queuedPosition = 1;
        List<Map<String, Object>> response = new java.util.ArrayList<>();
        for (SupportChatSession session : queuedSessions) {
            Integer queuePosition = null;
            if (session.getStatus() == SupportChatStatus.QUEUED) {
                queuePosition = (int) queuedPosition++;
            }
            Map<String, Object> entry = new java.util.HashMap<>();
            entry.put("chatId", session.getId());
            entry.put("customerId", session.getCustomerId());
            entry.put("agentId", session.getAgentId());
            entry.put("status", session.getStatus());
            entry.put("createdAt", session.getCreatedAt());
            entry.put("queuePosition", queuePosition);
            response.add(entry);
        }
        return ResponseEntity.ok(response);
    }

    // Support Agents can claim a chat
    @PostMapping("/chat/{chatId}/claim")
    public ResponseEntity<?> claimChat(
            @AuthenticationPrincipal SecurityContext securityContext,
            @PathVariable Long chatId) {
        if (securityContext == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        Long agentId = securityContext.getUserId();
        log.info("BFF: Claim chat request - chatId: {}, agentId: {}", chatId, agentId);
        SupportChatSession session = supportChatService.claimChat(chatId, agentId);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Chat not found"));
        }
        if (session.getStatus() == SupportChatStatus.CLOSED) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Chat is closed"));
        }
        if (session.getAgentId() != null && !session.getAgentId().equals(agentId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Chat already claimed"));
        }
        return ResponseEntity.ok(Map.of(
                "chatId", session.getId(),
                "status", session.getStatus(),
                "agentId", session.getAgentId()
        ));
    }

    // Support Agents can view customer details (if logged in)
    @GetMapping("/chat/{chatId}/customer")
    public ResponseEntity<?> getCustomerDetails(@PathVariable Long chatId) {
        log.info("BFF: Get customer details request - chatId: {}", chatId);
        // TODO: Implement get customer details
        return ResponseEntity.ok().build();
    }

    private boolean isAuthorizedForSession(SecurityContext securityContext, SupportChatSession session) {
        if (session == null) {
            return false;
        }
        if (securityContext != null && securityContext.getUserType() == UserType.SUPPORT_AGENT) {
            return true;
        }
        Long userId = securityContext != null ? securityContext.getUserId() : null;
        if (userId == null) {
            return session.getCustomerId() == null;
        }
        return userId.equals(session.getCustomerId());
    }
}
