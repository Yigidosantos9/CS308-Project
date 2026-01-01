package com.cs308.gateway.model.support;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportChatAttachment {
    private Long id;
    private Long chatId;
    private String filename;
    private String contentType;
    private long size;
}
