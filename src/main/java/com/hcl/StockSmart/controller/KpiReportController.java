package com.hcl.StockSmart.controller;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hcl.StockSmart.dto.LocationInventoryReportDto;
import com.hcl.StockSmart.dto.LowStockReportDto;
import com.hcl.StockSmart.dto.SummaryReportDto;
import com.hcl.StockSmart.service.KpiReportService;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Inventory analytics: summary KPIs, low-stock alerts, and location-wise stock distribution")
public class KpiReportController {

    private final KpiReportService kpiReportService;

    public KpiReportController(KpiReportService kpiReportService) {
        this.kpiReportService = kpiReportService;
    }

    @Operation(summary = "Get summary report",
               description = "Returns high-level KPIs: total products, inventory value, order counts, active locations, and low-stock alerts")
    @ApiResponse(responseCode = "200", description = "Summary report returned")
    @GetMapping("/summary")
    public SummaryReportDto getSummaryReport() {
        return kpiReportService.getSummaryReport();
    }

    @Operation(summary = "Get low-stock report",
               description = "Returns all products whose current stock has fallen below their configured reorder level")
    @ApiResponse(responseCode = "200", description = "Low-stock product list returned")
    @GetMapping("/low-stock")
    public List<LowStockReportDto> getLowStockReport() {
        return kpiReportService.getLowStockReport();
    }

    @Operation(summary = "Get location inventory report",
               description = "Returns stock distribution across all locations with item counts, quantities, and valuations")
    @ApiResponse(responseCode = "200", description = "Location inventory report returned")
    @GetMapping("/by-location")
    public List<LocationInventoryReportDto> getLocationInventoryReport() {
        return kpiReportService.getLocationInventoryReport();
    }
}
