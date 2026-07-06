package com.projectshop.service;

import com.projectshop.dto.CategoryRequest;
import com.projectshop.dto.CategoryResponse;
import com.projectshop.entity.Category;
import com.projectshop.exception.CategoryInUseException;
import com.projectshop.exception.DuplicateCategoryException;
import com.projectshop.repository.CategoryRepository;
import com.projectshop.repository.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProjectRepository projectRepository;

    /**
     * Returns all categories, alphabetically, with a live count of how many
     * projects currently use each one.
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new category. Names are trimmed and must be unique,
     * case-insensitively, so "Web App" and "web app" can't both exist.
     */
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String name = request.getName().trim();

        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateCategoryException(name);
        }

        Category category = Category.builder().name(name).build();
        return toResponse(categoryRepository.save(category));
    }

    /**
     * Deletes a category by ID — but only if no project currently
     * references it. If projects are still assigned to it, deletion is
     * blocked with a clear message instead of silently orphaning data.
     */
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));

        long projectsUsingIt = projectRepository.countByCategoryIgnoreCase(category.getName());
        if (projectsUsingIt > 0) {
            throw new CategoryInUseException(category.getName(), projectsUsingIt);
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(Category category) {
        long projectCount = projectRepository.countByCategoryIgnoreCase(category.getName());
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .projectCount(projectCount)
                .createdAt(category.getCreatedAt())
                .build();
    }
}
