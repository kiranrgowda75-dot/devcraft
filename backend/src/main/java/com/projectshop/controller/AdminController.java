package com.projectshop.controller;

import com.projectshop.dto.*;
import com.projectshop.enums.InquiryType;
import com.projectshop.enums.LeadStatus;
import com.projectshop.enums.ProjectStatus;
import com.projectshop.security.JwtUtil;
import com.projectshop.service.CategoryService;
import com.projectshop.service.LeadService;
import com.projectshop.service.ProjectService;
import com.projectshop.service.SiteSettingsService;
import com.projectshop.service.StatsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin endpoints — all routes under /api/admin/** are protected by JWT.
 * Security rule is enforced at the SecurityConfig level.
 *
 * Exception: POST /api/admin/login is explicitly permitted in SecurityConfig.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ProjectService projectService;
    private final CategoryService categoryService;
    private final LeadService leadService;
    private final StatsService statsService;
    private final SiteSettingsService siteSettingsService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    // ─── Auth ──────────────────────────────────────────────

    /**
     * POST /api/admin/login
     * Body: { "username": "admin", "password": "yourpassword" }
     * Returns: JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(), request.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new LoginResponse(
                token,
                request.getUsername(),
                jwtUtil.getExpirationMs()));
    }

    // ─── Dashboard Stats ───────────────────────────────────

    /**
     * GET /api/admin/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(statsService.getStats());
    }

    // ─── Projects CRUD ─────────────────────────────────────

    /**
     * GET /api/admin/projects
     * GET /api/admin/projects?category=Web+App&status=ACTIVE&search=react&sort=title-asc&page=0&size=10
     */
    @GetMapping("/projects")
    public ResponseEntity<PagedResponse<ProjectResponse>> listAllProjects(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(
                projectService.getAllProjectsAdmin(category, status, search, sort, page, size));
    }

    /**
     * GET /api/admin/projects/{id}
     */
    @GetMapping("/projects/{id}")
    public ResponseEntity<ProjectResponse> getProjectByIdAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectByIdAdmin(id));
    }

    /**
     * POST /api/admin/projects
     */
    @PostMapping("/projects")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.createProject(request));
    }

    /**
     * PUT /api/admin/projects/{id}
     */
    @PutMapping("/projects/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    /**
     * DELETE /api/admin/projects/{id}
     */
    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/admin/projects/{id}/toggle-status
     * Flips DRAFT ↔ ACTIVE
     */
    @PatchMapping("/projects/{id}/toggle-status")
    public ResponseEntity<ProjectResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.toggleStatus(id));
    }

    // ─── Categories ─────────────────────────────────────────

    /**
     * GET /api/admin/categories
     * Returns all categories with a live project-usage count each,
     * so the admin UI can warn before a delete would be blocked.
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> listCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    /**
     * POST /api/admin/categories
     * Body: { "name": "Game" }
     * Rejects duplicate names (case-insensitive) with a 409.
     */
    @PostMapping("/categories")
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.createCategory(request));
    }

    /**
     * DELETE /api/admin/categories/{id}
     * Blocked with a 409 if any project still uses this category.
     */
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Site Settings (homepage content) ──────────────────

    /**
     * GET /api/admin/settings
     * Returns current homepage hero content, prefilled for the edit form.
     */
    @GetMapping("/settings")
    public ResponseEntity<SiteSettingsResponse> getSettings() {
        return ResponseEntity.ok(siteSettingsService.getSettings());
    }

    /**
     * PUT /api/admin/settings
     * Body: { heroTitle, heroHighlight, heroDescription, heroImageUrl }
     */
    @PutMapping("/settings")
    public ResponseEntity<SiteSettingsResponse> updateSettings(
            @Valid @RequestBody SiteSettingsRequest request) {
        return ResponseEntity.ok(siteSettingsService.updateSettings(request));
    }

    // ─── Leads ─────────────────────────────────────────────

    /**
     * GET /api/admin/leads
     * GET /api/admin/leads?inquiryType=WHATSAPP_CLICK
     * GET /api/admin/leads?status=NEW
     */
    @GetMapping("/leads")
    public ResponseEntity<List<LeadResponse>> listLeads(
            @RequestParam(required = false) InquiryType inquiryType,
            @RequestParam(required = false) LeadStatus status) {
        return ResponseEntity.ok(leadService.getLeads(inquiryType, status));
    }

    /**
     * PATCH /api/admin/leads/{id}/status
     * Body: { "status": "IN_PROGRESS" }
     */
    @PatchMapping("/leads/{id}/status")
    public ResponseEntity<LeadResponse> updateLeadStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        LeadStatus newStatus = LeadStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(leadService.updateLeadStatus(id, newStatus));
    }
}
