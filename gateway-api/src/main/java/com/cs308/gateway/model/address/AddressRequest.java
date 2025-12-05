package com.cs308.gateway.model.address;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {
    private String title;
    private String addressLine;
    private String city;
    private String country;
    private String zipCode;
}
