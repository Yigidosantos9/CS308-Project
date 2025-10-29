package com.codingapp.autonextauthenticationapi.service;

import com.codingapp.autonextauthenticationapi.model.request.CreateUserRequest;
import com.codingapp.autonextauthenticationapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class AuthenticationService {

    private final UserRepository userRepository;

    public String signUp(CreateUserRequest createUserRequest) {

        return "";
    }

}
