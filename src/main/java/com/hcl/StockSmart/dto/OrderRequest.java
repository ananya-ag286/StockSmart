package com.hcl.StockSmart.dto;

import java.util.List;

public class OrderRequest {

    private Long locationId;
    private List<OrderItemRequest> items;

    public OrderRequest() {
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
