package com.codingapp.autonextauthenticationapi.service;

import com.codingapp.autonextauthenticationapi.domain.User;
import com.codingapp.autonextauthenticationapi.model.enums.UserStatus;
import com.codingapp.autonextauthenticationapi.model.enums.UserType;
import com.codingapp.autonextauthenticationapi.model.request.CreateUserRequest;
import com.codingapp.autonextauthenticationapi.model.request.LoginRequest;
import com.codingapp.autonextauthenticationapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class AuthenticationService {

    private final UserRepository userRepository;

    public String signUp(CreateUserRequest createUserRequest) {

        userRepository.findByEmail(createUserRequest.getEmail())
                .ifPresent(user -> {
                    throw new IllegalStateException("User already exists with email: " + createUserRequest.getEmail());
                });

        User user = User.builder()
                .email(createUserRequest.getEmail())
                .password(createUserRequest.getPassword())
                .firstName(createUserRequest.getFirstName())
                .surname(createUserRequest.getLastName())
                .phoneNumber(createUserRequest.getPhoneNumber())
                .birthDate(createUserRequest.getBirthDate())
                .userType(UserType.USER)
                .userStatus(UserStatus.ACTIVE)
                .build();

        userRepository.save(user);

        return "User signed up successfully.";
    }

    public String login(LoginRequest loginRequest) {

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No user found with email: " + loginRequest.getEmail()));

        if (!user.getPassword().equals(loginRequest.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials provided.");
        }

        if (!UserStatus.ACTIVE.equals(user.getUserStatus())) {
            throw new IllegalStateException("User is not active.");
        }

        return "Login successful.";
    }

}
