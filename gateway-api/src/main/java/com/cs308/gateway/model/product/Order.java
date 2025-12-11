package com.cs308.gateway.model.product;

import com.cs308.gateway.model.product.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    private Long id;
    private Long userId;
    private OrderStatus status;
    private Double totalPrice;
    private String buyerName;
    private String buyerAddress;
    private String paymentMethod;
    private String invoiceNumber;

    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    private LocalDateTime orderDate;
}
