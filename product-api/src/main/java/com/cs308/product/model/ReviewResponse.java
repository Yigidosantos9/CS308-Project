package com.cs308.product.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long productId;
    private Long userId;
    private String userName; // Optional: populated by gateway
    private Integer rating;
    private String comment;
    private boolean approved;
    private Instant createdAt;
}
