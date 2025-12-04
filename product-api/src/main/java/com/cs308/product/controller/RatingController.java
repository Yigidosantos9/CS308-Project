package com.cs308.product.controller;

import com.cs308.product.domain.Rating;
import com.cs308.product.model.AddRatingRequest;
import com.cs308.product.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    public ResponseEntity<Rating> addRating(@Valid @RequestBody AddRatingRequest request) {
        Rating rating = ratingService.addRating(request.getProductId(), request.getScore(), request.getUserId());
        return new ResponseEntity<>(rating, HttpStatus.CREATED);
    }
}
