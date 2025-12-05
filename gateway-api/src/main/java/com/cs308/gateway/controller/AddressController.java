package com.cs308.gateway.controller;

import com.cs308.gateway.client.OrderClient;
import com.cs308.gateway.model.address.Address;
import com.cs308.gateway.model.address.AddressRequest;
import com.cs308.gateway.security.SecurityContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final OrderClient orderClient;

    @PostMapping
    public ResponseEntity<Address> addAddress(@RequestBody AddressRequest request) {
        Long userId = SecurityContext.getContext().getUserId();
        log.info("BFF: Add address request received - userId: {}", userId);

        try {
            Address address = orderClient.addAddress(userId, request);
            return ResponseEntity.ok(address);
        } catch (RuntimeException e) {
            log.error("Error processing add address request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Address>> getAddresses() {
        Long userId = SecurityContext.getContext().getUserId();
        log.info("BFF: Get addresses request received - userId: {}", userId);

        try {
            List<Address> addresses = orderClient.getAddresses(userId);
            return ResponseEntity.ok(addresses);
        } catch (RuntimeException e) {
            log.error("Error processing get addresses request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long addressId) {
        log.info("BFF: Delete address request received - addressId: {}", addressId);

        try {
            orderClient.deleteAddress(addressId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error processing delete address request", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
