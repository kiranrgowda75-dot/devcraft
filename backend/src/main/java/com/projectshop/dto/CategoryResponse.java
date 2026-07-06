package com.projectshop.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private String name;

    // How many projects currently reference this category.
    // Lets the admin UI warn before a delete would be blocked.
    private long projectCount;

    private LocalDateTime createdAt;
}
