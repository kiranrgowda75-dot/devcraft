package com.projectshop.repository.spec;

import com.projectshop.entity.Project;
import com.projectshop.enums.ProjectStatus;
import org.springframework.data.jpa.domain.Specification;

/**
 * Dynamic WHERE-clause building blocks for Project queries — combined with
 * Specification.where(...).and(...) so the public and admin endpoints can
 * share the same filtering logic (status is simply omitted for admin "all").
 *
 * Search intentionally matches title / shortDesc / description / category
 * only (not the techStack @ElementCollection) — joining that collection
 * would multiply rows and break Page's count query.
 */
public final class ProjectSpecifications {

    private ProjectSpecifications() {
    }

    public static Specification<Project> hasStatus(ProjectStatus status) {
        return (root, query, cb) -> status == null
                ? cb.conjunction()
                : cb.equal(root.get("status"), status);
    }

    public static Specification<Project> hasCategory(String category) {
        return (root, query, cb) -> (category == null || category.isBlank())
                ? cb.conjunction()
                : cb.equal(cb.lower(root.get("category")), category.toLowerCase());
    }

    public static Specification<Project> matchesSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }
            String like = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), like),
                    cb.like(cb.lower(root.get("shortDesc")), like),
                    cb.like(cb.lower(root.get("description")), like),
                    cb.like(cb.lower(root.get("category")), like)
            );
        };
    }
}
