package com.projectshop.service;

import com.projectshop.dto.LeadRequest;
import com.projectshop.dto.LeadResponse;
import com.projectshop.entity.Lead;
import com.projectshop.entity.Project;
import com.projectshop.enums.InquiryType;
import com.projectshop.enums.LeadStatus;
import com.projectshop.repository.LeadRepository;
import com.projectshop.repository.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final ProjectRepository projectRepository;

    /**
     * Logs a new lead (called on WhatsApp click or contact form submit).
     */
    @Transactional
    public LeadResponse createLead(LeadRequest request) {
        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId())
                    .orElse(null); // lead is still valid even if project ID is wrong
        }

        Lead lead = Lead.builder()
                .project(project)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .message(request.getMessage())
                .inquiryType(request.getInquiryType())
                .status(LeadStatus.NEW)
                .build();

        return toResponse(leadRepository.save(lead));
    }

    /**
     * Returns all leads, with optional filtering by type or status.
     */
    @Transactional(readOnly = true)
    public List<LeadResponse> getLeads(InquiryType inquiryType, LeadStatus status) {
        List<Lead> leads;

        if (inquiryType != null) {
            leads = leadRepository.findByInquiryType(inquiryType);
        } else if (status != null) {
            leads = leadRepository.findByStatus(status);
        } else {
            leads = leadRepository.findAll();
        }

        return leads.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Updates lead status (admin action: mark as IN_PROGRESS or CLOSED).
     */
    @Transactional
    public LeadResponse updateLeadStatus(Long id, LeadStatus newStatus) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + id));
        lead.setStatus(newStatus);
        return toResponse(leadRepository.save(lead));
    }

    // ─── Mapper ────────────────────────────────────────────

    private LeadResponse toResponse(Lead l) {
        return LeadResponse.builder()
                .id(l.getId())
                .projectId(l.getProject() != null ? l.getProject().getId() : null)
                .projectTitle(l.getProject() != null ? l.getProject().getTitle() : "N/A")
                .customerName(l.getCustomerName())
                .customerEmail(l.getCustomerEmail())
                .customerPhone(l.getCustomerPhone())
                .message(l.getMessage())
                .inquiryType(l.getInquiryType())
                .status(l.getStatus())
                .createdAt(l.getCreatedAt())
                .build();
    }
}
