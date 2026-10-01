package com.hcl.StockSmart.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PurchaseOrderRequest {

    private Long supplierId;
    private Long receiveLocationId;
    private LocalDateTime expectedDate;
    private List<PurchaseOrderItemRequest> items;

    public PurchaseOrderRequest() {
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public Long getReceiveLocationId() {
        return receiveLocationId;
    }

    public void setReceiveLocationId(Long receiveLocationId) {
        this.receiveLocationId = receiveLocationId;
    }

    public LocalDateTime getExpectedDate() {
        return expectedDate;
    }

    public void setExpectedDate(LocalDateTime expectedDate) {
        this.expectedDate = expectedDate;
    }

    public List<PurchaseOrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<PurchaseOrderItemRequest> items) {
        this.items = items;
    }
}
