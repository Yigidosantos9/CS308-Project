package com.cs308.order.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "address")
@Getter
@Setter
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title; // e.g., "Home", "Work"

    @Column(nullable = false)
    private String addressLine;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private String zipCode;

    public Address() {
    }

    public Address(Long id, Long userId, String title, String addressLine, String city, String country,
            String zipCode) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.addressLine = addressLine;
        this.city = city;
        this.country = country;
        this.zipCode = zipCode;
    }

    public static AddressBuilder builder() {
        return new AddressBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public static class AddressBuilder {
        private Long id;
        private Long userId;
        private String title;
        private String addressLine;
        private String city;
        private String country;
        private String zipCode;

        AddressBuilder() {
        }

        public AddressBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public AddressBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public AddressBuilder title(String title) {
            this.title = title;
            return this;
        }

        public AddressBuilder addressLine(String addressLine) {
            this.addressLine = addressLine;
            return this;
        }

        public AddressBuilder city(String city) {
            this.city = city;
            return this;
        }

        public AddressBuilder country(String country) {
            this.country = country;
            return this;
        }

        public AddressBuilder zipCode(String zipCode) {
            this.zipCode = zipCode;
            return this;
        }

        public Address build() {
            return new Address(id, userId, title, addressLine, city, country, zipCode);
        }
    }
}
