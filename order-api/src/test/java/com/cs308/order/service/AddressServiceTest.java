package com.cs308.order.service;

import com.cs308.order.model.Address;
import com.cs308.order.model.AddressRequest;
import com.cs308.order.repository.AddressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AddressServiceTest {

    @Mock
    private AddressRepository addressRepository;

    @InjectMocks
    private AddressService addressService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testAddAddress() {
        Long userId = 1L;
        AddressRequest request = new AddressRequest("Home", "123 Main St", "City", "Country", "12345");
        Address savedAddress = new Address(1L, userId, "Home", "123 Main St", "City", "Country", "12345");

        when(addressRepository.save(any(Address.class))).thenReturn(savedAddress);

        Address result = addressService.addAddress(userId, request);

        assertNotNull(result);
        assertEquals("Home", result.getTitle());
        assertEquals(userId, result.getUserId());
        verify(addressRepository, times(1)).save(any(Address.class));
    }

    @Test
    void testGetAddressesByUserId() {
        Long userId = 1L;
        List<Address> addresses = Arrays.asList(
                new Address(1L, userId, "Home", "123 Main St", "City", "Country", "12345"),
                new Address(2L, userId, "Work", "456 Work St", "City", "Country", "67890"));

        when(addressRepository.findByUserId(userId)).thenReturn(addresses);

        List<Address> result = addressService.getAddressesByUserId(userId);

        assertEquals(2, result.size());
        verify(addressRepository, times(1)).findByUserId(userId);
    }

    @Test
    void testDeleteAddress() {
        Long addressId = 1L;

        doNothing().when(addressRepository).deleteById(addressId);

        addressService.deleteAddress(addressId);

        verify(addressRepository, times(1)).deleteById(addressId);
    }
}
