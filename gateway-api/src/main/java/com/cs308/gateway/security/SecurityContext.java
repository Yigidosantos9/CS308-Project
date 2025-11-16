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

    public static void setContext(SecurityContext context) {
        contextHolder.set(context);
    }

    public static SecurityContext getContext() {
        return contextHolder.get();
    }

    public static void clearContext() {
        contextHolder.remove();
    }

    public static boolean isAuthenticated() {
        return getContext() != null;
    }

    public static boolean hasRole(UserType role) {
        SecurityContext context = getContext();
        return context != null && context.getUserType() == role;
    }

    public static boolean hasAnyRole(UserType... roles) {
        SecurityContext context = getContext();
        if (context == null) {
            return false;
        }
        UserType userRole = context.getUserType();
        for (UserType role : roles) {
            if (userRole == role) {
                return true;
            }
        }
        return false;
    }
}

