package com.cs308.gateway.security;

import com.cs308.gateway.model.auth.enums.UserType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.lang.reflect.Method;

@Slf4j
@Component
public class RoleAuthorizationInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        Method method = handlerMethod.getMethod();
        Class<?> controllerClass = handlerMethod.getBeanType();

        // Check class-level annotation
        RequiresRole classAnnotation = controllerClass.getAnnotation(RequiresRole.class);
        RequiresRole methodAnnotation = method.getAnnotation(RequiresRole.class);

        // Method annotation overrides class annotation
        RequiresRole annotation = methodAnnotation != null ? methodAnnotation : classAnnotation;

        if (annotation == null) {
            return true; // No role requirement
        }

        // Check if user is authenticated
        if (!SecurityContext.isAuthenticated()) {
            log.warn("Unauthenticated access attempt to: {}", request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Authentication required\"}");
            return false;
        }

        UserType[] requiredRoles = annotation.value();
        boolean requireAll = annotation.requireAll();

        SecurityContext context = SecurityContext.getContext();
        UserType userRole = context.getUserType();

        if (requireAll) {
            // User must have ALL roles
            for (UserType role : requiredRoles) {
                if (userRole != role) {
                    log.warn("Access denied for user {} with role {} to: {}", 
                            context.getUserId(), userRole, request.getRequestURI());
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\"error\":\"Insufficient permissions\"}");
                    return false;
                }
            }
        } else {
            // User must have ANY role
            boolean hasRequiredRole = false;
            for (UserType role : requiredRoles) {
                if (userRole == role) {
                    hasRequiredRole = true;
                    break;
                }
            }
            
            if (!hasRequiredRole) {
                log.warn("Access denied for user {} with role {} to: {}", 
                        context.getUserId(), userRole, request.getRequestURI());
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\":\"Insufficient permissions\"}");
                return false;
            }
        }

        return true;
    }
}

