package com.hcl.StockSmart.dto;

public class LowStockReportDto {

    private Long productId;
    private String productName;
    private String sku;
    private Integer reorderLevel;
    private Integer currentStock;
    private String status;

    // Location Fields
    private Long locationId;
    private String locationName;

    // Supplier Procurement Fields
    private Long supplierId;
    private String supplierName;
    private Double supplierPrice;
    private Integer leadTimeDays;
    private Integer minimumOrderQuantity;

    public LowStockReportDto() {
    }

    public LowStockReportDto(Long productId, String productName, String sku, Integer reorderLevel, Integer currentStock, String status) {
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.reorderLevel = reorderLevel;
        this.currentStock = currentStock;
        this.status = status;
    }

    public LowStockReportDto(Long productId, String productName, String sku, Integer reorderLevel, Integer currentStock, String status, Long locationId, String locationName) {
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.reorderLevel = reorderLevel;
        this.currentStock = currentStock;
        this.status = status;
        this.locationId = locationId;
        this.locationName = locationName;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
    }

    public Integer getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public Double getSupplierPrice() {
        return supplierPrice;
    }

    public void setSupplierPrice(Double supplierPrice) {
        this.supplierPrice = supplierPrice;
    }

    public Integer getLeadTimeDays() {
        return leadTimeDays;
    }

    public void setLeadTimeDays(Integer leadTimeDays) {
        this.leadTimeDays = leadTimeDays;
    }

    public Integer getMinimumOrderQuantity() {
        return minimumOrderQuantity;
    }

    public void setMinimumOrderQuantity(Integer minimumOrderQuantity) {
        this.minimumOrderQuantity = minimumOrderQuantity;
    }
}

