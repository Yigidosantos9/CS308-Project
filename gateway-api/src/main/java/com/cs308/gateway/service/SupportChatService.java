package com.cs308.gateway.service;

import com.cs308.gateway.model.support.SupportChatAttachment;
import com.cs308.gateway.model.support.SupportChatMessage;
import com.cs308.gateway.model.support.SupportChatSession;
import com.cs308.gateway.model.support.SupportChatStatus;
import com.cs308.gateway.model.support.SupportSenderType;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class SupportChatService {
    private final AtomicLong chatIdSequence = new AtomicLong(1);
    private final AtomicLong messageIdSequence = new AtomicLong(1);
    private final AtomicLong fileIdSequence = new AtomicLong(1);
    private final ConcurrentMap<Long, SupportChatSession> sessions = new ConcurrentHashMap<>();
    private final ConcurrentMap<Long, Long> activeChatsByCustomer = new ConcurrentHashMap<>();
    private final ConcurrentMap<Long, StoredFile> storedFiles = new ConcurrentHashMap<>();

    public SupportChatSession startChat(Long customerId, Object initialRequest) {
        long chatId = chatIdSequence.getAndIncrement();
        if (customerId != null) {
            Long existingChatId = activeChatsByCustomer.get(customerId);
            if (existingChatId != null) {
                SupportChatSession existingSession = sessions.get(existingChatId);
                if (existingSession != null && existingSession.getStatus() != SupportChatStatus.CLOSED) {
                    existingSession.setStatus(SupportChatStatus.CLOSED);
                }
            }
            activeChatsByCustomer.put(customerId, chatId);
        }
        SupportChatSession session = SupportChatSession.builder()
                .id(chatId)
                .customerId(customerId)
                .status(SupportChatStatus.QUEUED)
                .createdAt(Instant.now())
                .initialRequest(initialRequest)
                .messages(new CopyOnWriteArrayList<>())
                .build();
        sessions.put(chatId, session);
        return session;
    }

    public SupportChatSession getSession(Long chatId) {
        return sessions.get(chatId);
    }

    public SupportChatSession getActiveChat(Long customerId) {
        if (customerId == null) {
            return null;
        }
        Long chatId = activeChatsByCustomer.get(customerId);
        if (chatId == null) {
            return null;
        }
        return sessions.get(chatId);
    }

    public SupportChatSession closeChat(Long chatId) {
        SupportChatSession session = sessions.get(chatId);
        if (session == null) {
            return null;
        }
        session.setStatus(SupportChatStatus.CLOSED);
        if (session.getCustomerId() != null) {
            activeChatsByCustomer.remove(session.getCustomerId(), chatId);
        }
        return session;
    }

    public SupportChatMessage addAttachmentMessage(Long chatId, Long senderId, SupportSenderType senderType, String filename, String contentType, byte[] bytes) {
        SupportChatSession session = sessions.get(chatId);
        if (session == null) {
            return null;
        }
        if (session.getStatus() == SupportChatStatus.CLOSED) {
            return null;
        }

        SupportChatAttachment attachment = SupportChatAttachment.builder()
                .id(fileIdSequence.getAndIncrement())
                .chatId(chatId)
                .filename(filename)
                .contentType(contentType)
                .size(bytes != null ? bytes.length : 0)
                .build();

        storedFiles.put(attachment.getId(), new StoredFile(attachment, bytes));

        SupportChatMessage message = SupportChatMessage.builder()
                .id(messageIdSequence.getAndIncrement())
                .chatId(chatId)
                .senderId(senderId)
                .senderType(senderType)
                .content(null)
                .attachment(attachment)
                .createdAt(Instant.now())
                .build();

        if (session.getMessages() == null) {
            session.setMessages(new CopyOnWriteArrayList<>());
        }
        session.getMessages().add(message);

        if (senderType == SupportSenderType.AGENT) {
            if (session.getAgentId() == null) {
                session.setAgentId(senderId);
            }
            if (session.getStatus() == SupportChatStatus.QUEUED) {
                session.setStatus(SupportChatStatus.ACTIVE);
            }
        }

        return message;
    }

    public StoredFile getStoredFile(Long fileId) {
        return storedFiles.get(fileId);
    }

    public SupportChatMessage addMessage(Long chatId, Long senderId, SupportSenderType senderType, String content) {
        SupportChatSession session = sessions.get(chatId);
        if (session == null) {
            return null;
        }
        if (session.getStatus() == SupportChatStatus.CLOSED) {
            return null;
        }

        SupportChatMessage message = SupportChatMessage.builder()
                .id(messageIdSequence.getAndIncrement())
                .chatId(chatId)
                .senderId(senderId)
                .senderType(senderType)
                .content(content)
                .createdAt(Instant.now())
                .build();

        if (session.getMessages() == null) {
            session.setMessages(new CopyOnWriteArrayList<>());
        }
        session.getMessages().add(message);

        if (senderType == SupportSenderType.AGENT) {
            if (session.getAgentId() == null) {
                session.setAgentId(senderId);
            }
            if (session.getStatus() == SupportChatStatus.QUEUED) {
                session.setStatus(SupportChatStatus.ACTIVE);
            }
        }

        return message;
    }

    public List<SupportChatMessage> getMessages(Long chatId, Long afterId) {
        SupportChatSession session = sessions.get(chatId);
        if (session == null || session.getMessages() == null) {
            return null;
        }

        long sinceId = afterId != null ? afterId : 0L;
        return session.getMessages().stream()
                .filter(message -> message.getId() > sinceId)
                .collect(Collectors.toList());
    }

    public List<SupportChatSession> getQueuedSessions() {
        return sessions.values().stream()
                .filter(session -> session.getStatus() == SupportChatStatus.QUEUED)
                .sorted(Comparator.comparing(SupportChatSession::getCreatedAt))
                .collect(Collectors.toList());
    }

    public List<SupportChatSession> getQueueForAgent(Long agentId) {
        return sessions.values().stream()
                .filter(session -> session.getStatus() == SupportChatStatus.QUEUED
                        || (session.getStatus() == SupportChatStatus.ACTIVE
                        && agentId != null
                        && agentId.equals(session.getAgentId()))
                        || (session.getStatus() == SupportChatStatus.CLOSED
                        && agentId != null
                        && agentId.equals(session.getAgentId())))
                .sorted(Comparator
                        .comparing((SupportChatSession session) -> session.getStatus() == SupportChatStatus.QUEUED ? 0
                                : session.getStatus() == SupportChatStatus.ACTIVE ? 1 : 2)
                        .thenComparing(SupportChatSession::getCreatedAt))
                .collect(Collectors.toList());
    }

    public static class StoredFile {
        private final SupportChatAttachment attachment;
        private final byte[] bytes;

        public StoredFile(SupportChatAttachment attachment, byte[] bytes) {
            this.attachment = attachment;
            this.bytes = bytes;
        }

        public SupportChatAttachment getAttachment() {
            return attachment;
        }

        public byte[] getBytes() {
            return bytes;
        }
    }

    public SupportChatSession claimChat(Long chatId, Long agentId) {
        SupportChatSession session = sessions.get(chatId);
        if (session == null) {
            return null;
        }
        if (session.getStatus() == SupportChatStatus.CLOSED) {
            return session;
        }
        if (session.getAgentId() != null && !session.getAgentId().equals(agentId)) {
            return session;
        }
        session.setAgentId(agentId);
        if (session.getStatus() == SupportChatStatus.QUEUED) {
            session.setStatus(SupportChatStatus.ACTIVE);
        }
        return session;
    }
}
