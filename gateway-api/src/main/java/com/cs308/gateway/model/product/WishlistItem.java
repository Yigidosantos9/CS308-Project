package com.cs308.gateway.model.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItem {
    private Long id;
    private Product product;
    private String size;
    private LocalDateTime addedAt;
}
