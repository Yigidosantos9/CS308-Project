package com.codingapp.autonextauthenticationapi.controller;

import com.codingapp.autonextauthenticationapi.model.request.CreateUserRequest;
import com.codingapp.autonextauthenticationapi.model.request.LoginRequest;
import com.codingapp.autonextauthenticationapi.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/membership")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/sign-up")
    public String signUp(@RequestBody CreateUserRequest createUserRequest) {

        return authenticationService.signUp(createUserRequest);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest loginRequest) {

        return authenticationService.login(loginRequest);
    }

}
