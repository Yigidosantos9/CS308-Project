package com.cs308.gateway.model.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    private Long id;
    private Long productId;
    private Product product;
    private Integer quantity;
    private Double unitPrice;
    private Double price; // Total price for this line item
}
