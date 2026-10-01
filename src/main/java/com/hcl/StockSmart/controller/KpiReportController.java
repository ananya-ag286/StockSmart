package com.hcl.StockSmart.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hcl.StockSmart.dto.LocationInventoryReportDto;
import com.hcl.StockSmart.dto.LowStockReportDto;
import com.hcl.StockSmart.dto.SummaryReportDto;
import com.hcl.StockSmart.service.KpiReportService;

@RestController
@RequestMapping("/api/reports")
public class KpiReportController {

    private final KpiReportService kpiReportService;

    public KpiReportController(KpiReportService kpiReportService) {
        this.kpiReportService = kpiReportService;
    }

    @GetMapping("/summary")
    public SummaryReportDto getSummaryReport() {
        return kpiReportService.getSummaryReport();
    }

    @GetMapping("/low-stock")
    public List<LowStockReportDto> getLowStockReport() {
        return kpiReportService.getLowStockReport();
    }

    @GetMapping("/by-location")
    public List<LocationInventoryReportDto> getLocationInventoryReport() {
        return kpiReportService.getLocationInventoryReport();
    }
}
