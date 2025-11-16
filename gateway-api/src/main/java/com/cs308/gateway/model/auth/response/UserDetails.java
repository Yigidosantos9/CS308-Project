package com.cs308.gateway.model.auth.response;

import com.cs308.gateway.model.auth.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDetails {

    private String userId;
    private String email;
    private UserType userType;
}

