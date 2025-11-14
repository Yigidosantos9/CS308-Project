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

    public void saveAll(Collection<Product> products) {
        for (Product p : products) {
            store.put(p.getId(), p);
        }
    }

    public boolean isEmpty() {
        return store.isEmpty();
    }

    /**
     * Basit arama + filtre + sıralama
     */
    public List<Product> search(
            String q,
            String category,
            String gender,
            String color,
            String sort // priceAsc, priceDesc, ratingDesc vs.
    ) {
        return store.values().stream()
                .filter(p -> {
                    if (q == null || q.isBlank()) return true;
                    String s = q.toLowerCase();
                    return (p.getName() != null && p.getName().toLowerCase().contains(s))
                            || (p.getDescription() != null && p.getDescription().toLowerCase().contains(s))
                            || (p.getBrand() != null && p.getBrand().toLowerCase().contains(s));
                })
                .filter(p -> category == null || category.isBlank()
                        || (p.getCategory() != null && p.getCategory().equalsIgnoreCase(category)))
                .filter(p -> gender == null || gender.isBlank()
                        || (p.getGender() != null && p.getGender().equalsIgnoreCase(gender)))
                .filter(p -> color == null || color.isBlank()
                        || (p.getColor() != null && p.getColor().equalsIgnoreCase(color)))
                .sorted(getComparator(sort))
                .collect(Collectors.toList());
    }

    private Comparator<Product> getComparator(String sort) {
        if ("priceAsc".equalsIgnoreCase(sort)) {
            return Comparator.comparing(Product::getPriceCents,
                    Comparator.nullsLast(Long::compareTo));
        } else if ("priceDesc".equalsIgnoreCase(sort)) {
            return Comparator.comparing(Product::getPriceCents,
                    Comparator.nullsLast(Long::compareTo)).reversed();
        } else if ("ratingDesc".equalsIgnoreCase(sort)) {
            return Comparator.comparingDouble(
                    p -> Optional.ofNullable(p.getRating()).orElse(0.0)
            ).reversed();
        }
        // default: sıralama yok (orijinal sırayı koru)
        return (p1, p2) -> 0;
    }
}