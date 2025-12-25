package com.codingapp.autonextauthenticationapi.configuration;

import com.codingapp.autonextauthenticationapi.domain.User;
import com.codingapp.autonextauthenticationapi.model.enums.UserStatus;
import com.codingapp.autonextauthenticationapi.model.enums.UserType;
import com.codingapp.autonextauthenticationapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            String email = "pm@ecommerce.com";
            if (userRepository.findByEmail(email).isEmpty()) {
                log.info("Seeding Product Manager user: {}", email);
                User pmUser = User.builder()
                        .email(email)
                        .password(passwordEncoder.encode("password"))
                        .firstName("Product")
                        .surname("Manager")
                        .phoneNumber("1234567890")
                        .birthDate(LocalDate.of(1990, 1, 1))
                        .userType(UserType.PRODUCT_MANAGER)
                        .userStatus(UserStatus.ACTIVE)
                        .build();

                userRepository.save(pmUser);
                log.info("Product Manager user created successfully.");
            } else {
                log.info("Product Manager user already exists.");
            }
        };
    }
}
