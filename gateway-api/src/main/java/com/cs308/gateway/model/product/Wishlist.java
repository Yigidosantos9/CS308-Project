package com.cs308.gateway.model.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wishlist {
    private Long id;
    private Long userId;
    @Builder.Default
    private List<WishlistItem> items = new ArrayList<>();
    private LocalDateTime createdAt;
}
