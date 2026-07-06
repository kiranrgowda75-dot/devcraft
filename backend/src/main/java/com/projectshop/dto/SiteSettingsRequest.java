package com.projectshop.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SiteSettingsRequest {

    @NotBlank(message = "Hero title is required")
    private String heroTitle;

    private String heroHighlight;

    @NotBlank(message = "Hero description is required")
    private String heroDescription;

    @NotBlank(message = "Hero image URL is required")
    private String heroImageUrl;
}
