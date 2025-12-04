package com.cs308.gateway.controller;

import com.cs308.gateway.model.auth.enums.UserType;
import com.cs308.gateway.security.SecurityContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController {

    // Anyone (guests or customers) can initiate chat
    @PostMapping("/chat/start")
    public ResponseEntity<?> startChat(
            @AuthenticationPrincipal SecurityContext securityContext,
            @RequestBody Object chatRequest) {
        Long userId = (securityContext != null) ? securityContext.getUserId() : null;
        log.info("BFF: Start chat request - userId: {}", userId);
        // TODO: Implement start chat
        return ResponseEntity.ok().build();
    }

    // Customers or guests can send messages
    @PostMapping("/chat/{chatId}/message")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long chatId,
            @RequestBody Object messageRequest) {
        log.info("BFF: Send message request - chatId: {}", chatId);
        // TODO: Implement send message
        return ResponseEntity.ok().build();
    }

    // Support Agents can view chat queue
    @GetMapping("/chat/queue")
    public ResponseEntity<?> getChatQueue() {
        log.info("BFF: Get chat queue request (Support Agent)");
        // TODO: Implement get chat queue
        return ResponseEntity.ok().build();
    }

    // Support Agents can claim a chat
    @PostMapping("/chat/{chatId}/claim")
    public ResponseEntity<?> claimChat(
            @AuthenticationPrincipal SecurityContext securityContext,
            @PathVariable Long chatId) {
        Long agentId = securityContext.getUserId();
        log.info("BFF: Claim chat request - chatId: {}, agentId: {}", chatId, agentId);
        // TODO: Implement claim chat
        return ResponseEntity.ok().build();
    }

    // Support Agents can view customer details (if logged in)
    @GetMapping("/chat/{chatId}/customer")
    public ResponseEntity<?> getCustomerDetails(@PathVariable Long chatId) {
        log.info("BFF: Get customer details request - chatId: {}", chatId);
        // TODO: Implement get customer details
        return ResponseEntity.ok().build();
    }
}
