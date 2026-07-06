package com.projectshop.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminStatsResponse {
    // ─── Headline numbers ──────────────────────────────
    private long totalProjects;
    private long activeProjects;
    private long draftProjects;
    private long totalLeads;
    private long newLeads;
    private BigDecimal averagePrice;
    private BigDecimal catalogValue; // sum of price across ACTIVE projects

    // ─── Breakdowns ─────────────────────────────────────
    private List<CategoryCount> projectsByCategory;
    private Map<String, Long> leadsByStatus;
    private Map<String, Long> leadsByInquiryType;

    // ─── Trends (last 6 months, oldest first) ──────────
    private List<MonthCount> monthlyTrend;

    // ─── Recent activity ────────────────────────────────
    private List<LeadResponse> recentLeads;
}
