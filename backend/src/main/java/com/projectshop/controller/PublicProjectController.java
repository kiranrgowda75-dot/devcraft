package com.projectshop.controller;

import com.projectshop.dto.PagedResponse;
import com.projectshop.dto.ProjectResponse;
import com.projectshop.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public endpoints — no authentication required.
 * Only ACTIVE (published) projects are visible here.
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class PublicProjectController {

    private final ProjectService projectService;

    /**
     * GET /api/projects
     * GET /api/projects?category=Web+App&search=react&sort=price-asc&page=0&size=12
     *
     * Returns a page of published projects, optionally filtered by category
     * and/or search term, and sorted per {@code sort} (newest | oldest |
     * price-asc | price-desc | title-asc | title-desc — default: newest).
     */
    @GetMapping
    public ResponseEntity<PagedResponse<ProjectResponse>> listProjects(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(projectService.getPublicProjects(category, search, sort, page, size));
    }

    /**
     * GET /api/projects/{id}
     *
     * Returns a single published project by ID.
     * Returns 404 if not found or not active.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getPublicProjectById(id));
    }
}
