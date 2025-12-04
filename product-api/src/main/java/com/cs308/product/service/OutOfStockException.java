package com.cs308.product.service;

public class OutOfStockException extends RuntimeException {

    public OutOfStockException(Long productId) {
        super("Product " + productId + " is out of stock");
    }

    public OutOfStockException(String message) {
        super(message);
    }
}


