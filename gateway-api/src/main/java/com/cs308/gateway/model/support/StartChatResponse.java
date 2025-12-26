package com.cs308.gateway.model.support;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StartChatResponse {
    private Long chatId;
    private SupportChatStatus status;
}
