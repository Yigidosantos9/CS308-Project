package com.cs308.product.service;

import com.cs308.product.domain.Product;
import com.cs308.product.domain.Rating;
import com.cs308.product.repository.ProductRepository;
import com.cs308.product.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Rating addRating(Long productId, Integer score, Long userId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        Rating rating = Rating.builder()
                .product(product)
                .score(score)
                .userId(userId)
                .build();

        return ratingRepository.save(rating);
    }

    public Double getAverageRating(Long productId) {
        List<Rating> ratings = ratingRepository.findByProductId(productId);
        if (ratings.isEmpty()) {
            return 0.0;
        }
        return ratings.stream()
                .mapToInt(Rating::getScore)
                .average()
                .orElse(0.0);
    }
}
