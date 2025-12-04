package com.cs308.product.repository;

import com.cs308.product.domain.Product;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Repository
public class ProductRepository {

    private final Map<Long, Product> store = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(0);

    public Optional<Product> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    public List<Product> findAll() {
        return new ArrayList<>(store.values());
    }

    public Product save(Product product) {
        if (product.getId() == null) {
            product.setId(idGenerator.incrementAndGet());
        } else {
            idGenerator.accumulateAndGet(product.getId(), Math::max);
        }

        store.put(product.getId(), product);
        return product;
    }

    public void saveAll(Collection<Product> products) {
        for (Product p : products) {
            save(p);
        }
    }

    public boolean isEmpty() {
        return store.isEmpty();
    }

    public boolean deleteById(Long id) {
        return store.remove(id) != null;
    }

    /**
     * Basit arama + filtre + sıralama
     */
    public List<Product> search(
            String q,
            String category,
            String gender,
            String color,
            String description,
            String sort // priceAsc, priceDesc, ratingDesc vs.
    ) {
        return store.values().stream()
                .filter(p -> {
                    if (q == null || q.isBlank())
                        return true;
                    String s = q.toLowerCase();
                    return (p.getName() != null && p.getName().toLowerCase().contains(s))
                            || (p.getDescription() != null && p.getDescription().toLowerCase().contains(s))
                            || (p.getBrand() != null && p.getBrand().toLowerCase().contains(s));
                })
                .filter(p -> category == null || category.isBlank())
                .filter(p -> gender == null || gender.isBlank())
                .filter(p -> color == null || color.isBlank())
                .filter(p -> {
                    if (description == null || description.isBlank())
                        return true;
                    return p.getDescription() != null
                            && p.getDescription().toLowerCase().contains(description.toLowerCase());
                })
                .sorted(getComparator(sort))
                .collect(Collectors.toList());
    }

    private Comparator<Product> getComparator(String sort) {
        if ("priceAsc".equalsIgnoreCase(sort)) {
            return Comparator.comparing(Product::getPrice,
                    Comparator.nullsLast(Double::compareTo));
        } else if ("priceDesc".equalsIgnoreCase(sort)) {
            return Comparator.comparing(Product::getPrice,
                    Comparator.nullsLast(Double::compareTo)).reversed();
        }
        return (p1, p2) -> 0;
    }
}
