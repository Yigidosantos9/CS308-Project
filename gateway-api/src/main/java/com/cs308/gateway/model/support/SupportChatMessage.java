package com.cs308.gateway.model.support;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportChatMessage {
    private Long id;
    private Long chatId;
    private Long senderId;
    private SupportSenderType senderType;
    private String content;
    private SupportChatAttachment attachment;
    private Instant createdAt;
}
