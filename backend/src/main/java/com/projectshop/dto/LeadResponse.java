package com.projectshop.dto;

import com.projectshop.enums.InquiryType;
import com.projectshop.enums.LeadStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LeadResponse {
    private Long id;
    private Long projectId;
    private String projectTitle;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String message;
    private InquiryType inquiryType;
    private LeadStatus status;
    private LocalDateTime createdAt;
}
