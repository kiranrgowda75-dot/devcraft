package com.projectshop.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SiteSettingsResponse {
    private String heroTitle;
    private String heroHighlight;
    private String heroDescription;
    private String heroImageUrl;
    private LocalDateTime updatedAt;
}
