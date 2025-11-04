package com.codingapp.autonextauthenticationapi.service;

import com.codingapp.autonextauthenticationapi.domain.User;
import com.codingapp.autonextauthenticationapi.model.enums.UserStatus;
import com.codingapp.autonextauthenticationapi.model.enums.UserType;
import com.codingapp.autonextauthenticationapi.model.request.CreateUserRequest;
import com.codingapp.autonextauthenticationapi.model.request.LoginRequest;
import com.codingapp.autonextauthenticationapi.model.response.LoginResponse;
import com.codingapp.autonextauthenticationapi.model.response.UserDetails;
import com.codingapp.autonextauthenticationapi.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.time.LocalDate;
import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TokenService tokenService;

    @InjectMocks
    private AuthenticationService authenticationService;

    private CreateUserRequest createUserRequest;
    private Key testSecretKey;

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

        testSecretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        ReflectionTestUtils.setField(authenticationService, "secretKey", testSecretKey);
    }

    @Test
    void signUp_shouldThrowException_whenEmailExists() {
        // given
        when(userRepository.findByEmail(createUserRequest.getEmail()))
                .thenReturn(Optional.of(new User()));

        // when & then
        assertThatThrownBy(() -> authenticationService.signUp(createUserRequest))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("User already exists");

        verify(userRepository, never()).save(org.mockito.Mockito.any(User.class));
    }

    @Test
    void signUp_shouldSaveUser_whenEmailIsUnique() {
        // given
        when(userRepository.findByEmail(createUserRequest.getEmail()))
                .thenReturn(Optional.empty());

        // when
        authenticationService.signUp(createUserRequest);

        // then
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getEmail()).isEqualTo(createUserRequest.getEmail());
        assertThat(savedUser.getSurname()).isEqualTo(createUserRequest.getLastName());
        assertThat(savedUser.getUserStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(savedUser.getUserType()).isEqualTo(UserType.CUSTOMER);
    }

    @Test
    void login_shouldReturnLoginResponse_whenCredentialsValid() {
        // given
        LoginRequest loginRequest = LoginRequest.builder()
                .email("login@example.com")
                .password("secret")
                .build();

        User user = User.builder()
                .id(123L)
                .email("login@example.com")
                .password("secret")
                .userStatus(UserStatus.ACTIVE)
                .build();

        LoginResponse mockLoginResponse = new LoginResponse();

        when(userRepository.findByEmail(loginRequest.getEmail()))
                .thenReturn(Optional.of(user));
        when(tokenService.createToken(user)).thenReturn(mockLoginResponse);

        // when
        LoginResponse result = authenticationService.login(loginRequest);

        // then
        assertThat(result).isEqualTo(mockLoginResponse);
        verify(tokenService).createToken(user);
    }

    @Test
    void login_shouldThrowException_whenUserNotFound() {
        // given
        LoginRequest loginRequest = LoginRequest.builder()
                .email("missing@example.com")
                .password("secret")
                .build();

        when(userRepository.findByEmail(loginRequest.getEmail()))
                .thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> authenticationService.login(loginRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No user found");
    }

    @Test
    void login_shouldThrowException_whenPasswordDoesNotMatch() {
        // given
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

        // when & then
        assertThatThrownBy(() -> authenticationService.login(loginRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void login_shouldThrowException_whenUserNotActive() {
        // given
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

        // when & then
        assertThatThrownBy(() -> authenticationService.login(loginRequest))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("User is not active");
    }


    private String createTestToken(String userId, String email, UserType role, Key key, long expirationMs) {
        return Jwts.builder()
                .setSubject(userId)
                .claim("email", email)
                .claim("role", role.name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    @Test
    void verifyToken_shouldReturnUserDetails_whenTokenIsValid() {
        // given
        String userId = "user-123";
        String email = "test@example.com";
        UserType role = UserType.CUSTOMER;
        String validToken = createTestToken(userId, email, role, testSecretKey, 60000);

        // when
        UserDetails userDetails = authenticationService.verifyToken(validToken);

        // then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUserId()).isEqualTo(userId);
        assertThat(userDetails.getEmail()).isEqualTo(email);
        assertThat(userDetails.getUserType()).isEqualTo(role);
    }

    @Test
    void verifyToken_shouldThrowException_whenTokenIsExpired() {
        // given
        String expiredToken = createTestToken("user-123", "test@example.com", UserType.CUSTOMER, testSecretKey, -1000);

        // when & then
        assertThatThrownBy(() -> authenticationService.verifyToken(expiredToken))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Token is expired");
    }

    @Test
    void verifyToken_shouldThrowException_whenSignatureIsInvalid() {
        // given
        Key wrongKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        String invalidSignatureToken = createTestToken("user-123", "test@example.com", UserType.CUSTOMER, wrongKey, 60000);

        // when & then
        assertThatThrownBy(() -> authenticationService.verifyToken(invalidSignatureToken))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid Signature");
    }

    @Test
    void verifyToken_shouldThrowException_whenRoleIsInvalid() {
        // given
        String tokenWithInvalidRole = Jwts.builder()
                .setSubject("user-123")
                .claim("email", "test@example.com")
                .claim("role", "INVALID_ROLE_STRING")
                .setExpiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(testSecretKey)
                .compact();

        // when & then
        assertThatThrownBy(() -> authenticationService.verifyToken(tokenWithInvalidRole))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("JWT Claims are null");
    }
}