package com.cs308.gateway.security;

import com.cs308.gateway.model.auth.enums.UserType;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresRole {
    UserType[] value();
    boolean requireAll() default false; // If true, user must have ALL roles, otherwise ANY role
}

