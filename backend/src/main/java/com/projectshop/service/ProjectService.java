package com.projectshop.service;

import com.projectshop.dto.PagedResponse;
import com.projectshop.dto.ProjectRequest;
import com.projectshop.dto.ProjectResponse;
import com.projectshop.entity.Project;
import com.projectshop.enums.ProjectStatus;
import com.projectshop.repository.ProjectRepository;
import com.projectshop.repository.spec.ProjectSpecifications;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    private static final int MAX_PAGE_SIZE = 100;

    // ─── Public ────────────────────────────────────────────

    /**
     * Returns a page of ACTIVE projects, optionally filtered by category
     * and/or a free-text search term, sorted per {@code sort}.
     */
    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> getPublicProjects(
            String category, String search, Boolean featured, String sort, Integer page, Integer size) {

        Specification<Project> spec = Specification
                .where(ProjectSpecifications.hasStatus(ProjectStatus.ACTIVE))
                .and(ProjectSpecifications.hasCategory(blankToNull(category)))
                .and(ProjectSpecifications.matchesSearch(blankToNull(search)))
                .and(ProjectSpecifications.isFeatured(featured));

        Pageable pageable = buildPageable(page, size, sort);
        Page<Project> result = projectRepository.findAll(spec, pageable);

        return toPagedResponse(result);
    }

    /**
     * Returns a single ACTIVE project by ID, or throws if not found / not active.
     */
    @Transactional(readOnly = true)
    public ProjectResponse getPublicProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + id));

        if (project.getStatus() != ProjectStatus.ACTIVE) {
            throw new EntityNotFoundException("Project not available");
        }
        return toResponse(project);
    }

    // ─── Admin ─────────────────────────────────────────────

    /**
     * Returns a page of ALL projects (drafts + active), optionally filtered
     * by category, status, and/or a free-text search term.
     */
    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> getAllProjectsAdmin(
            String category, ProjectStatus status, String search, String sort, Integer page, Integer size) {

        Specification<Project> spec = Specification
                .where(ProjectSpecifications.hasStatus(status))
                .and(ProjectSpecifications.hasCategory(blankToNull(category)))
                .and(ProjectSpecifications.matchesSearch(blankToNull(search)));

        Pageable pageable = buildPageable(page, size, sort);
        Page<Project> result = projectRepository.findAll(spec, pageable);

        return toPagedResponse(result);
    }

    /**
     * Returns a single project by ID for Admin (active or draft).
     */
    @Transactional(readOnly = true)
    public ProjectResponse getProjectByIdAdmin(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + id));
        return toResponse(project);
    }

    /**
     * Creates a new project.
     */
    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .shortDesc(request.getShortDesc())
                .price(request.getPrice())
                .category(request.getCategory())
                .techStack(request.getTechStack())
                .thumbnailUrl(request.getThumbnailUrl())
                .screenshotUrls(request.getScreenshotUrls())
                .demoVideoUrl(request.getDemoVideoUrl())
                .featured(request.getFeatured() != null ? request.getFeatured() : false)
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.DRAFT)
                .build();

        return toResponse(projectRepository.save(project));
    }

    /**
     * Updates an existing project.
     */
    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + id));

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setShortDesc(request.getShortDesc());
        project.setPrice(request.getPrice());
        project.setCategory(request.getCategory());
        project.setTechStack(request.getTechStack());
        project.setThumbnailUrl(request.getThumbnailUrl());
        project.setScreenshotUrls(request.getScreenshotUrls());
        project.setDemoVideoUrl(request.getDemoVideoUrl());
        if (request.getFeatured() != null) {
            project.setFeatured(request.getFeatured());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }

        return toResponse(projectRepository.save(project));
    }

    /**
     * Deletes a project by ID.
     */
    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new EntityNotFoundException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
    }

    /**
     * Toggles a project between DRAFT and ACTIVE.
     */
    @Transactional
    public ProjectResponse toggleStatus(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + id));

        project.setStatus(project.getStatus() == ProjectStatus.ACTIVE
                ? ProjectStatus.DRAFT
                : ProjectStatus.ACTIVE);

        return toResponse(projectRepository.save(project));
    }

    // ─── Pagination / sorting helpers ──────────────────────

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    /**
     * Builds a Pageable from raw query params. Page defaults to 0, size
     * defaults to 12 and is capped at {@link #MAX_PAGE_SIZE} to prevent a
     * caller from requesting the entire table in one shot.
     */
    private Pageable buildPageable(Integer page, Integer size, String sort) {
        int safePage = (page == null || page < 0) ? 0 : page;
        int safeSize = (size == null || size <= 0) ? 12 : Math.min(size, MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize, buildSort(sort));
    }

    private Sort buildSort(String sort) {
        if (sort == null) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        return switch (sort) {
            case "price-asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price-desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "title-asc" -> Sort.by(Sort.Direction.ASC, "title");
            case "title-desc" -> Sort.by(Sort.Direction.DESC, "title");
            case "oldest" -> Sort.by(Sort.Direction.ASC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt"); // "newest" and unknown values
        };
    }

    private PagedResponse<ProjectResponse> toPagedResponse(Page<Project> page) {
        List<ProjectResponse> items = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PagedResponse.<ProjectResponse>builder()
                .items(items)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    // ─── Mapper ────────────────────────────────────────────

    private ProjectResponse toResponse(Project p) {
        return ProjectResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .shortDesc(p.getShortDesc())
                .price(p.getPrice())
                .category(p.getCategory())
                .techStack(p.getTechStack())
                .thumbnailUrl(p.getThumbnailUrl())
                .screenshotUrls(p.getScreenshotUrls())
                .demoVideoUrl(p.getDemoVideoUrl())
                .featured(p.getFeatured())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
