package com.projectshop.repository;

import com.projectshop.entity.Lead;
import com.projectshop.enums.InquiryType;
import com.projectshop.enums.LeadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    // Filter by inquiry type (WHATSAPP_CLICK / CONTACT_FORM)
    List<Lead> findByInquiryType(InquiryType inquiryType);

    // Filter by lead status (NEW / IN_PROGRESS / CLOSED)
    List<Lead> findByStatus(LeadStatus status);

    // Filter by project
    List<Lead> findByProjectId(Long projectId);

    // Count by status (for dashboard stats)
    long countByStatus(LeadStatus status);

    // Dashboard analytics: recent activity feed
    List<Lead> findTop5ByOrderByCreatedAtDesc();

    // Dashboard analytics: lead count grouped by status / inquiry type
    @Query("SELECT l.status, COUNT(l) FROM Lead l GROUP BY l.status")
    List<Object[]> countGroupedByStatus();

    @Query("SELECT l.inquiryType, COUNT(l) FROM Lead l GROUP BY l.inquiryType")
    List<Object[]> countGroupedByInquiryType();

    // Dashboard analytics: lightweight scalar fetch used to bucket leads by creation month in Java
    @Query("SELECT l.createdAt FROM Lead l")
    List<LocalDateTime> findAllCreatedTimestamps();
}
