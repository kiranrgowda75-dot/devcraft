package com.projectshop.dto;

import com.projectshop.enums.ProjectStatus;
import lombok.Data;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProjectRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @Size(max = 300)
    private String shortDesc;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    private String category;
    private List<String> techStack;
    private String thumbnailUrl;
    private List<String> screenshotUrls;
    private String demoVideoUrl;
    private Boolean featured;
    private ProjectStatus status;
}
