package com.cs308.product.repo;

import com.cs308.product.model.Product;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class ProductRepository {
    private final Map<Long, Product> store = new ConcurrentHashMap<>();

    public Optional<Product> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    public List<Product> findAll() {
        return new ArrayList<>(store.values());
    }

    public List<Product> search(String q) {
        if (q == null || q.isBlank()) return findAll();
        String s = q.toLowerCase();
        return store.values().stream()
                .filter(p -> p.getName().toLowerCase().contains(s)
                        || (p.getDescription() != null && p.getDescription().toLowerCase().contains(s))
                        || p.getCategory().toLowerCase().contains(s))
                .collect(Collectors.toList());
    }

    public void saveAll(Collection<Product> products) {
        for (Product p : products) {
            store.put(p.getId(), p);
        }
    }

    public boolean isEmpty() { return store.isEmpty(); }
}
