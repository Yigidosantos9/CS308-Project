package com.codingapp.autonextauthenticationapi.controller;

import com.codingapp.autonextauthenticationapi.model.request.CreateUserRequest;
import com.codingapp.autonextauthenticationapi.model.request.LoginRequest;
import com.codingapp.autonextauthenticationapi.service.AuthenticationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthenticationController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationService authenticationService;

    @Test
    void signUp_shouldReturnSuccessMessage() throws Exception {
        CreateUserRequest request = CreateUserRequest.builder()
                .email("test@example.com")
                .password("password")
                .firstName("John")
                .lastName("Doe")
                .phoneNumber("555-1234")
                .birthDate(LocalDate.of(1990, 1, 1))
                .build();

        when(authenticationService.signUp(any(CreateUserRequest.class)))
                .thenReturn("User signed up successfully.");

        mockMvc.perform(post("/membership/sign-up")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("User signed up successfully."));

        verify(authenticationService).signUp(any(CreateUserRequest.class));
    }

    @Test
    void login_shouldReturnSuccessMessage() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("test@example.com")
                .password("password")
                .build();

        when(authenticationService.login(any(LoginRequest.class)))
                .thenReturn("Login successful.");

        mockMvc.perform(post("/membership/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Login successful."));

        verify(authenticationService).login(any(LoginRequest.class));
    }
}
