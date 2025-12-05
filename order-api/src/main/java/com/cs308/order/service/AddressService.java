package com.cs308.order.service;

import com.cs308.order.model.Address;
import com.cs308.order.model.AddressRequest;
import com.cs308.order.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public Address addAddress(Long userId, AddressRequest request) {
        Address address = Address.builder()
                .userId(userId)
                .title(request.getTitle())
                .addressLine(request.getAddressLine())
                .city(request.getCity())
                .country(request.getCountry())
                .zipCode(request.getZipCode())
                .build();
        return addressRepository.save(address);
    }

    public List<Address> getAddressesByUserId(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    public void deleteAddress(Long addressId) {
        addressRepository.deleteById(addressId);
    }
}
