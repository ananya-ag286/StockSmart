package com.hcl.StockSmart.dto;

public class SummaryReportDto {

    private long totalProducts;
    private long totalInventoryQuantity;
    private long totalLocations;
    private long totalSuppliers;
    private long lowStockProductsCount;
    private double totalInventoryValue;
    private long totalOrders;
    private long processedOrders;
    private long pendingPurchaseOrdersCount;

    public SummaryReportDto() {
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalInventoryQuantity() {
        return totalInventoryQuantity;
    }

    public void setTotalInventoryQuantity(long totalInventoryQuantity) {
        this.totalInventoryQuantity = totalInventoryQuantity;
    }

    public long getTotalLocations() {
        return totalLocations;
    }

    public void setTotalLocations(long totalLocations) {
        this.totalLocations = totalLocations;
    }

    public long getTotalSuppliers() {
        return totalSuppliers;
    }

    public void setTotalSuppliers(long totalSuppliers) {
        this.totalSuppliers = totalSuppliers;
    }

    public long getLowStockProductsCount() {
        return lowStockProductsCount;
    }

    public void setLowStockProductsCount(long lowStockProductsCount) {
        this.lowStockProductsCount = lowStockProductsCount;
    }

    public double getTotalInventoryValue() {
        return totalInventoryValue;
    }

    public void setTotalInventoryValue(double totalInventoryValue) {
        this.totalInventoryValue = totalInventoryValue;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getProcessedOrders() {
        return processedOrders;
    }

    public void setProcessedOrders(long processedOrders) {
        this.processedOrders = processedOrders;
    }

    public long getPendingPurchaseOrdersCount() {
        return pendingPurchaseOrdersCount;
    }

    public void setPendingPurchaseOrdersCount(long pendingPurchaseOrdersCount) {
        this.pendingPurchaseOrdersCount = pendingPurchaseOrdersCount;
    }
}
