package com.cs308.gateway.model.support;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupportMessageRequest {
    private String content;
    private SupportSenderType senderType;
}
