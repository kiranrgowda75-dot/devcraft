package com.projectshop.repository;

import com.projectshop.entity.Project;
import com.projectshop.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {

    // Public: only ACTIVE projects
    List<Project> findByStatus(ProjectStatus status);

    // Public: ACTIVE projects filtered by category (case-insensitive)
    List<Project> findByStatusAndCategoryIgnoreCase(ProjectStatus status, String category);

    // Admin: all projects filtered by category
    List<Project> findByCategoryIgnoreCase(String category);

    // Category management: count how many projects reference a category name
    // (used to block/warn on delete, and to show usage counts in the admin UI)
    long countByCategoryIgnoreCase(String category);

    // Dashboard stats: count without loading full entities (and their collections) into memory
    long countByStatus(ProjectStatus status);

    // Dashboard stats: let the DB compute the average instead of pulling every row into the JVM
    @Query("SELECT AVG(p.price) FROM Project p")
    BigDecimal findAveragePrice();

    // Dashboard stats: sum of price across ACTIVE projects (approximate "catalog value")
    @Query("SELECT SUM(p.price) FROM Project p WHERE p.status = :status")
    BigDecimal sumPriceByStatus(ProjectStatus status);

    // Dashboard analytics: project count grouped by category (portable across H2/Postgres)
    @Query("SELECT p.category, COUNT(p) FROM Project p GROUP BY p.category ORDER BY COUNT(p) DESC")
    List<Object[]> countGroupedByCategory();

    // Dashboard analytics: lightweight scalar fetch used to bucket projects by creation month in Java
    // (avoids DB-specific date-truncation functions so it works on both H2 dev and Postgres prod)
    @Query("SELECT p.createdAt FROM Project p")
    List<LocalDateTime> findAllCreatedTimestamps();
}
