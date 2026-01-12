package com.cs308.product.service;

import com.cs308.product.domain.Category;
import com.cs308.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * Get all categories ordered by name
     */
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    /**
     * Get all category names as a list of strings
     */
    public List<String> getAllCategoryNames() {
        return categoryRepository.findAll().stream()
                .map(Category::getName)
                .sorted()
                .toList();
    }

    /**
     * Create a new category
     */
    @Transactional
    public Category createCategory(String name) {
        String normalizedName = name.trim().toUpperCase().replace(" ", "_");

        if (categoryRepository.existsByName(normalizedName)) {
            throw new IllegalArgumentException("Category already exists: " + normalizedName);
        }

        Category category = Category.builder()
                .name(normalizedName)
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Created new category: {}", normalizedName);
        return saved;
    }

    /**
     * Delete a category by ID
     */
    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Category not found: " + id);
        }
        categoryRepository.deleteById(id);
        log.info("Deleted category: {}", id);
    }

    /**
     * Initialize default categories if none exist
     */
    @Transactional
    public void initializeDefaultCategories() {
        if (categoryRepository.count() == 0) {
            List<String> defaults = List.of(
                    "T_SHIRT", "SHIRT", "PANTS", "JEANS", "JACKET", "COAT",
                    "SWEATER", "HOODIE", "SHORTS", "DRESS", "SKIRT", "SUIT",
                    "BLAZER", "CARDIGAN", "POLO", "VEST", "UNDERWEAR", "SWIMWEAR");
            for (String name : defaults) {
                try {
                    createCategory(name);
                } catch (Exception e) {
                    log.warn("Could not create default category {}: {}", name, e.getMessage());
                }
            }
            log.info("Initialized {} default categories", defaults.size());
        }
    }
}
