package com.projectshop.controller;

import com.projectshop.dto.LeadRequest;
import com.projectshop.dto.LeadResponse;
import com.projectshop.service.LeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public endpoint — no authentication required.
 * Called by the frontend when:
 *   1. A visitor clicks "Buy Now via WhatsApp" → inquiryType = WHATSAPP_CLICK
 *   2. A visitor submits the Contact form       → inquiryType = CONTACT_FORM
 */
@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    /**
     * POST /api/leads
     * Body: { projectId?, customerName?, customerEmail?, customerPhone?, message?, inquiryType }
     */
    @PostMapping
    public ResponseEntity<LeadResponse> createLead(@Valid @RequestBody LeadRequest request) {
        LeadResponse response = leadService.createLead(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
