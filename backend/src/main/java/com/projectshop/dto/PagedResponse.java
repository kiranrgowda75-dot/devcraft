package com.projectshop.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Generic wrapper for paginated list endpoints (projects, etc).
 * Keeps the shape consistent across public and admin APIs.
 */
@Data
@Builder
public class PagedResponse<T> {
    private List<T> items;
    private int page;          // 0-indexed
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
}
