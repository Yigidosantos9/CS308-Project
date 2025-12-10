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
    public ResponseEntity<Address> addAddress(@RequestBody AddressRequest request,
                                              @RequestParam(required = false) Long userId) {
        Long actualUserId = SecurityContext.getContext().getUserId() != null
                ? SecurityContext.getContext().getUserId()
                : userId;
        log.info("BFF: Add address request received - userId: {}", actualUserId);

        try {
            if (actualUserId == null) {
                return ResponseEntity.badRequest().build();
            }
            Address address = orderClient.addAddress(actualUserId, request);
            return ResponseEntity.ok(address);
        } catch (RuntimeException e) {
            log.error("Error processing add address request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Address>> getAddresses(@RequestParam(required = false) Long userId) {
        Long actualUserId = SecurityContext.getContext().getUserId() != null
                ? SecurityContext.getContext().getUserId()
                : userId;
        log.info("BFF: Get addresses request received - userId: {}", actualUserId);

        try {
            if (actualUserId == null) {
                return ResponseEntity.badRequest().build();
            }
            List<Address> addresses = orderClient.getAddresses(actualUserId);
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
