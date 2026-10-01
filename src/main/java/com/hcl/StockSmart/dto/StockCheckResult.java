package com.hcl.StockSmart.dto;

public class StockCheckResult {

    private Long productId;
    private String productName;
    private Integer requestedQuantity;
    private Integer availableQuantity;
    private boolean available;

    public StockCheckResult() {
    }

    public StockCheckResult(Long productId, String productName, Integer requestedQuantity, Integer availableQuantity, boolean available) {
        this.productId = productId;
        this.productName = productName;
        this.requestedQuantity = requestedQuantity;
        this.availableQuantity = availableQuantity;
        this.available = available;
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

    public Integer getRequestedQuantity() {
        return requestedQuantity;
    }

    public void setRequestedQuantity(Integer requestedQuantity) {
        this.requestedQuantity = requestedQuantity;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
