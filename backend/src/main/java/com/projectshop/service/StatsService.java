package com.projectshop.service;

import com.projectshop.dto.AdminStatsResponse;
import com.projectshop.dto.CategoryCount;
import com.projectshop.dto.LeadResponse;
import com.projectshop.dto.MonthCount;
import com.projectshop.entity.Lead;
import com.projectshop.enums.LeadStatus;
import com.projectshop.enums.ProjectStatus;
import com.projectshop.repository.LeadRepository;
import com.projectshop.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private static final int TREND_MONTHS = 6;

    private final ProjectRepository projectRepository;
    private final LeadRepository leadRepository;

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        long total = projectRepository.count();
        long active = projectRepository.countByStatus(ProjectStatus.ACTIVE);
        long draft = projectRepository.countByStatus(ProjectStatus.DRAFT);
        long totalLeads = leadRepository.count();
        long newLeads = leadRepository.countByStatus(LeadStatus.NEW);

        // Average / total catalog value are computed by the database (aggregate
        // queries) instead of loading every project row into the JVM to sum manually.
        BigDecimal rawAvg = projectRepository.findAveragePrice();
        BigDecimal avgPrice = rawAvg == null
                ? BigDecimal.ZERO
                : rawAvg.setScale(2, RoundingMode.HALF_UP);

        BigDecimal rawCatalogValue = projectRepository.sumPriceByStatus(ProjectStatus.ACTIVE);
        BigDecimal catalogValue = rawCatalogValue == null
                ? BigDecimal.ZERO
                : rawCatalogValue.setScale(2, RoundingMode.HALF_UP);

        return AdminStatsResponse.builder()
                .totalProjects(total)
                .activeProjects(active)
                .draftProjects(draft)
                .totalLeads(totalLeads)
                .newLeads(newLeads)
                .averagePrice(avgPrice)
                .catalogValue(catalogValue)
                .projectsByCategory(getProjectsByCategory())
                .leadsByStatus(getLeadsByStatus())
                .leadsByInquiryType(getLeadsByInquiryType())
                .monthlyTrend(getMonthlyTrend())
                .recentLeads(getRecentLeads())
                .build();
    }

    // ─── Breakdown queries ──────────────────────────────────

    private List<CategoryCount> getProjectsByCategory() {
        return projectRepository.countGroupedByCategory().stream()
                .map(row -> CategoryCount.builder()
                        .category(row[0] != null ? (String) row[0] : "Uncategorized")
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());
    }

    private Map<String, Long> getLeadsByStatus() {
        // Seed every enum value with 0 so the chart always renders all segments,
        // even before any leads exist in a given status.
        Map<String, Long> result = new LinkedHashMap<>();
        for (LeadStatus status : LeadStatus.values()) {
            result.put(status.name(), 0L);
        }
        for (Object[] row : leadRepository.countGroupedByStatus()) {
            result.put(((LeadStatus) row[0]).name(), (Long) row[1]);
        }
        return result;
    }

    private Map<String, Long> getLeadsByInquiryType() {
        Map<String, Long> result = new LinkedHashMap<>();
        for (var type : com.projectshop.enums.InquiryType.values()) {
            result.put(type.name(), 0L);
        }
        for (Object[] row : leadRepository.countGroupedByInquiryType()) {
            result.put(((com.projectshop.enums.InquiryType) row[0]).name(), (Long) row[1]);
        }
        return result;
    }

    /**
     * Buckets project- and lead-creation timestamps by calendar month for the
     * trailing {@value #TREND_MONTHS} months (oldest first). Bucketing happens
     * in Java rather than via a DB-specific date_trunc() so the same code path
     * works against both the H2 (dev) and PostgreSQL (prod) profiles.
     */
    private List<MonthCount> getMonthlyTrend() {
        YearMonth currentMonth = YearMonth.from(LocalDateTime.now());

        // Pre-seed the trailing window so months with zero activity still show up.
        Map<YearMonth, long[]> buckets = new LinkedHashMap<>(); // [projects, leads]
        for (int i = TREND_MONTHS - 1; i >= 0; i--) {
            buckets.put(currentMonth.minusMonths(i), new long[]{0L, 0L});
        }

        for (LocalDateTime ts : projectRepository.findAllCreatedTimestamps()) {
            YearMonth ym = YearMonth.from(ts);
            long[] bucket = buckets.get(ym);
            if (bucket != null) {
                bucket[0]++;
            }
        }

        for (LocalDateTime ts : leadRepository.findAllCreatedTimestamps()) {
            YearMonth ym = YearMonth.from(ts);
            long[] bucket = buckets.get(ym);
            if (bucket != null) {
                bucket[1]++;
            }
        }

        return buckets.entrySet().stream()
                .map(e -> MonthCount.builder()
                        .month(e.getKey().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                                + " " + e.getKey().getYear())
                        .projects(e.getValue()[0])
                        .leads(e.getValue()[1])
                        .build())
                .collect(Collectors.toList());
    }

    private List<LeadResponse> getRecentLeads() {
        return leadRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(this::toLeadResponse)
                .collect(Collectors.toList());
    }

    private LeadResponse toLeadResponse(Lead l) {
        return LeadResponse.builder()
                .id(l.getId())
                .projectId(l.getProject() != null ? l.getProject().getId() : null)
                .projectTitle(l.getProject() != null ? l.getProject().getTitle() : "N/A")
                .customerName(l.getCustomerName())
                .customerEmail(l.getCustomerEmail())
                .customerPhone(l.getCustomerPhone())
                .message(l.getMessage())
                .inquiryType(l.getInquiryType())
                .status(l.getStatus())
                .createdAt(l.getCreatedAt())
                .build();
    }
}
