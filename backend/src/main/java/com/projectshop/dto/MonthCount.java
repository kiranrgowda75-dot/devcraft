package com.projectshop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthCount {
    private String month;   // e.g. "Jan 2026"
    private long projects;
    private long leads;
}
