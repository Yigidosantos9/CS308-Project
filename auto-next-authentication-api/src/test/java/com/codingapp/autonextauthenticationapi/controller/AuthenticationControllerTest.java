package com.codingapp.autonextauthenticationapi.controller;

import com.codingapp.autonextauthenticationapi.model.enums.UserType;
import com.codingapp.autonextauthenticationapi.model.request.CreateUserRequest;
import com.codingapp.autonextauthenticationapi.model.request.LoginRequest;
import com.codingapp.autonextauthenticationapi.model.response.LoginResponse;
import com.codingapp.autonextauthenticationapi.model.response.UserDetails;
import com.codingapp.autonextauthenticationapi.service.AuthenticationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthenticationController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthenticationControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private AuthenticationService authenticationService;

        @Test
        void signUp_shouldReturnSuccessMessage() throws Exception {
                // given
                CreateUserRequest request = CreateUserRequest.builder()
                                .email("test@example.com")
                                .password("password")
                                .firstName("John")
                                .lastName("Doe")
                                .phoneNumber("555-1234")
                                .birthDate(LocalDate.of(1990, 1, 1))
                                .build();
                String successMessage = "User signed up successfully.";

                when(authenticationService.signUp(any(CreateUserRequest.class)))
                                .thenReturn(successMessage);

                // when & then
                mockMvc.perform(post("/membership/sign-up")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(content().string(successMessage));

                verify(authenticationService).signUp(any(CreateUserRequest.class));
        }

        @Test
        void login_shouldReturnLoginResponse() throws Exception {
                // given
                LoginRequest request = LoginRequest.builder()
                                .email("test@example.com")
                                .password("password")
                                .build();

                LoginResponse mockResponse = new LoginResponse();
                mockResponse.setToken("mock.jwt.token");

                when(authenticationService.login(any(LoginRequest.class)))
                                .thenReturn(mockResponse);

                // when & then
                mockMvc.perform(post("/membership/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.token", is("mock.jwt.token")));

                verify(authenticationService).login(any(LoginRequest.class));
        }

        @Test
        void verifyToken_shouldReturnUserDetails() throws Exception {
                // given
                String mockToken = "ey.mock.token.string";

                UserDetails mockUserDetails = new UserDetails();
                mockUserDetails.setUserId("user-123");
                mockUserDetails.setEmail("user@example.com");
                mockUserDetails.setUserType(UserType.CUSTOMER);

                when(authenticationService.verifyToken(mockToken))
                                .thenReturn(mockUserDetails);

                // when & then
                // when & then
                mockMvc.perform(post("/membership/verify-token")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"token\":\"" + mockToken + "\"}"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.userId", is("user-123")))
                                .andExpect(jsonPath("$.email", is("user@example.com")));

                verify(authenticationService).verifyToken(mockToken);
        }
}