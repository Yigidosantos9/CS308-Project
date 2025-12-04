package com.cs308.product.model;

import lombok.Data;

@Data
public class ProductFilterRequest {

    // ?q=...
    private String q;

    // ?category=...
    private String category;

    // ?gender=...
    private String gender;

    // ?color=...
    private String color;

    // ?description=...
    private String description;

    // ?sort=priceAsc vs. — default: relevance
    private String sort = "relevance";
}