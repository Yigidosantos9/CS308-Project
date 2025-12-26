package com.cs308.gateway.service;

import com.cs308.gateway.model.support.SupportChatSession;
import com.cs308.gateway.model.support.SupportChatStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class SupportChatService {
    private final AtomicLong chatIdSequence = new AtomicLong(1);
    private final ConcurrentMap<Long, SupportChatSession> sessions = new ConcurrentHashMap<>();

    public SupportChatSession startChat(Long customerId, Object initialRequest) {
        long chatId = chatIdSequence.getAndIncrement();
        SupportChatSession session = SupportChatSession.builder()
                .id(chatId)
                .customerId(customerId)
                .status(SupportChatStatus.QUEUED)
                .createdAt(Instant.now())
                .initialRequest(initialRequest)
                .build();
        sessions.put(chatId, session);
        return session;
    }
}
