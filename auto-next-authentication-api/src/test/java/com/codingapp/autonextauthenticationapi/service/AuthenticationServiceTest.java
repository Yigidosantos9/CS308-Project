package com.codingapp.autonextauthenticationapi.service;

import com.codingapp.autonextauthenticationapi.domain.User;
import com.codingapp.autonextauthenticationapi.model.enums.UserStatus;
import com.codingapp.autonextauthenticationapi.model.enums.UserType;
import com.codingapp.autonextauthenticationapi.model.request.CreateUserRequest;
import com.codingapp.autonextauthenticationapi.model.request.LoginRequest;
import com.codingapp.autonextauthenticationapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthenticationService authenticationService;

    private CreateUserRequest createUserRequest;

    @BeforeEach
    void setUp() {
        createUserRequest = CreateUserRequest.builder()
                .email("test@example.com")
                .password("password")
                .firstName("John")
                .lastName("Doe")
                .phoneNumber("555-1234")
                .birthDate(LocalDate.of(1990, 1, 1))
                .build();
    }

    @Test
    void signUp_shouldThrowException_whenEmailExists() {
        when(userRepository.findByEmail(createUserRequest.getEmail()))
                .thenReturn(Optional.of(new User()));

        assertThatThrownBy(() -> authenticationService.signUp(createUserRequest))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("User already exists");

        verify(userRepository, never()).save(org.mockito.Mockito.any(User.class));
    }

    @Test
    void signUp_shouldSaveUser_whenEmailIsUnique() {
        when(userRepository.findByEmail(createUserRequest.getEmail()))
                .thenReturn(Optional.empty());

        authenticationService.signUp(createUserRequest);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getEmail()).isEqualTo(createUserRequest.getEmail());
        assertThat(savedUser.getSurname()).isEqualTo(createUserRequest.getLastName());
        assertThat(savedUser.getUserStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(savedUser.getUserType()).isEqualTo(UserType.USER);
    }

    @Test
    void login_shouldReturnSuccess_whenCredentialsValid() {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("login@example.com")
                .password("secret")
                .build();

        User user = User.builder()
                .email("login@example.com")
                .password("secret")
                .userStatus(UserStatus.ACTIVE)
                .build();

        when(userRepository.findByEmail(loginRequest.getEmail()))
                .thenReturn(Optional.of(user));

        String result = authenticationService.login(loginRequest);

        assertThat(result).isEqualTo("Login successful.");
    }

    @Test
    void login_shouldThrowException_whenUserNotFound() {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("missing@example.com")
                .password("secret")
                .build();

        when(userRepository.findByEmail(loginRequest.getEmail()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authenticationService.login(loginRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No user found");
    }

    @Test
    void login_shouldThrowException_whenPasswordDoesNotMatch() {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("login@example.com")
                .password("wrong")
                .build();

        User user = User.builder()
                .email("login@example.com")
                .password("secret")
                .userStatus(UserStatus.ACTIVE)
                .build();

        when(userRepository.findByEmail(loginRequest.getEmail()))
                .thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authenticationService.login(loginRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void login_shouldThrowException_whenUserNotActive() {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("login@example.com")
                .password("secret")
                .build();

        User user = User.builder()
                .email("login@example.com")
                .password("secret")
                .userStatus(UserStatus.INACTIVE)
                .build();

        when(userRepository.findByEmail(loginRequest.getEmail()))
                .thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authenticationService.login(loginRequest))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("User is not active");
    }
}
