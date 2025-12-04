package com.cs308.gateway.security;

import com.cs308.gateway.model.auth.enums.UserType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SecurityContext {
    private Long userId;
    private String email;
    private UserType userType;
    private String token;

    private static final ThreadLocal<SecurityContext> contextHolder = new ThreadLocal<>();

    public static SecurityContext getContext() {
        SecurityContext ctx = contextHolder.get();
        if (ctx == null) {
            ctx = SecurityContext.builder().build();
            contextHolder.set(ctx);
        }
        return ctx;
    }

    public static void setContext(SecurityContext context) {
        contextHolder.set(context);
    }

    public static void clearContext() {
        contextHolder.remove();
    }

    public static boolean isAuthenticated() {
        return getContext().getUserId() != null;
    }
}
