package com.projectshop.controller;

import com.projectshop.dto.CategoryResponse;
import com.projectshop.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Public endpoint — no authentication required.
 * Powers the category filter on the storefront.
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class PublicCategoryController {

    private final CategoryService categoryService;

    /**
     * GET /api/categories
     * Returns all categories, alphabetically.
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> listCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}
