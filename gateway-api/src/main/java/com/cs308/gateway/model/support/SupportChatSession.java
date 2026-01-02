package com.cs308.gateway.model.support;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportChatSession {
    private Long id;
    private Long customerId;
    private Long agentId;
    private SupportChatStatus status;
    private Instant createdAt;
    private Object initialRequest;
    private List<SupportChatMessage> messages;
}
