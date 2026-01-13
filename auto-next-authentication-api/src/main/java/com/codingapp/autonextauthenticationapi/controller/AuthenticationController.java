package com.codingapp.autonextauthenticationapi.controller;

import com.codingapp.autonextauthenticationapi.model.request.CreateUserRequest;
import com.codingapp.autonextauthenticationapi.model.request.LoginRequest;
import com.codingapp.autonextauthenticationapi.model.request.VerifyTokenRequest;
import com.codingapp.autonextauthenticationapi.model.response.LoginResponse;
import com.codingapp.autonextauthenticationapi.model.response.UserDetails;
import com.codingapp.autonextauthenticationapi.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public LoginResponse login(@RequestBody LoginRequest loginRequest) {

        return authenticationService.login(loginRequest);
    }

    @PostMapping("/verify-token")
    public UserDetails verifyToken(@RequestBody VerifyTokenRequest request) {

        return authenticationService.verifyToken(request.getToken());
    }

    @GetMapping("/users/{userId}")
    public UserDetails getUserById(@PathVariable Long userId) {
        return authenticationService.getUserById(userId);
    }

    @PutMapping("/users/{userId}/tax-id")
    public UserDetails updateTaxId(@PathVariable Long userId, @RequestParam String taxId) {
        return authenticationService.updateUser(userId, taxId);
    }

}
