package com.cs308.gateway.model.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Revenue statistics for Sales Manager dashboard
 * Cost is calculated as 50% of revenue (as per project requirements)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueStats {

    // Summary totals
    private Double totalRevenue;
    private Double totalCost;
    private Double totalProfit;
    private Integer orderCount;

    // Daily breakdown for chart
    private List<DailyRevenue> dailyData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenue {
        private String date; // Format: YYYY-MM-DD
        private Double revenue;
        private Double cost; // 50% of revenue
        private Double profit; // revenue - cost
        private Integer orderCount;
    }
}
