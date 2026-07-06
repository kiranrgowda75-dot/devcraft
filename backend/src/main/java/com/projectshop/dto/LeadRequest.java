package com.projectshop.dto;

import com.projectshop.enums.InquiryType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LeadRequest {

    // Project ID — optional (contact form may not reference a specific project)
    private Long projectId;

    @Size(max = 150, message = "Name must be 150 characters or fewer")
    private String customerName;

    @Email(message = "Must be a valid email address")
    @Size(max = 254, message = "Email must be 254 characters or fewer")
    private String customerEmail;

    @Size(max = 30, message = "Phone must be 30 characters or fewer")
    private String customerPhone;

    @Size(max = 2000, message = "Message must be 2000 characters or fewer")
    private String message;

    @NotNull(message = "Inquiry type is required")
    private InquiryType inquiryType;
}
