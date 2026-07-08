package com.projectshop.dto;

import com.projectshop.enums.ProjectStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProjectResponse {
    private Long id;
    private String title;
    private String description;
    private String shortDesc;
    private BigDecimal price;
    private String category;
    private List<String> techStack;
    private String thumbnailUrl;
    private List<String> screenshotUrls;
    private String demoVideoUrl;
    private Boolean featured;
    private ProjectStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
