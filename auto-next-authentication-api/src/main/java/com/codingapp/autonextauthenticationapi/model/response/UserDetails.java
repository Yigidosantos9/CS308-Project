package com.codingapp.autonextauthenticationapi.model.response;

import com.codingapp.autonextauthenticationapi.model.enums.UserType;
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
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private java.time.LocalDate birthDate;
}
