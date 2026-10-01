package com.hcl.StockSmart.dto;

import java.util.Map;

public class ReceivePurchaseOrderRequest {

    private Long locationId;
    private Map<Long, Integer> itemReceivedQuantities; // itemId or productId -> receivedQty

    public ReceivePurchaseOrderRequest() {
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public Map<Long, Integer> getItemReceivedQuantities() {
        return itemReceivedQuantities;
    }

    public void setItemReceivedQuantities(Map<Long, Integer> itemReceivedQuantities) {
        this.itemReceivedQuantities = itemReceivedQuantities;
    }
}
