package com.cs308.product.controller;

import com.cs308.product.domain.Rating;
import com.cs308.product.model.AddRatingRequest;
import com.cs308.product.service.RatingService;
import com.cs308.product.web.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RatingController.class)
@Import(GlobalExceptionHandler.class)
class RatingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RatingService ratingService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void addRatingReturnsCreatedRating() throws Exception {
        AddRatingRequest request = new AddRatingRequest();
        request.setProductId(1L);
        request.setUserId(100L);
        request.setScore(5);

        Rating rating = new Rating();
        rating.setId(10L);
        rating.setScore(5);
        rating.setUserId(100L);

        when(ratingService.addRating(eq(1L), eq(5), eq(100L))).thenReturn(rating);

        mockMvc.perform(post("/ratings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.score").value(5));

        verify(ratingService).addRating(eq(1L), eq(5), eq(100L));
    }
}
