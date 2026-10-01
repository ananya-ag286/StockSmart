package com.hcl.StockSmart.dto;

public class LocationInventoryReportDto {

    private Long locationId;
    private String locationName;
    private String locationType;
    private Integer totalItemsCount;
    private Integer totalQuantity;
    private Double totalValue;

    public LocationInventoryReportDto() {
    }

    public LocationInventoryReportDto(Long locationId, String locationName, String locationType, Integer totalItemsCount, Integer totalQuantity, Double totalValue) {
        this.locationId = locationId;
        this.locationName = locationName;
        this.locationType = locationType;
        this.totalItemsCount = totalItemsCount;
        this.totalQuantity = totalQuantity;
        this.totalValue = totalValue;
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

    public String getLocationType() {
        return locationType;
    }

    public void setLocationType(String locationType) {
        this.locationType = locationType;
    }

    public Integer getTotalItemsCount() {
        return totalItemsCount;
    }

    public void setTotalItemsCount(Integer totalItemsCount) {
        this.totalItemsCount = totalItemsCount;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public Double getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(Double totalValue) {
        this.totalValue = totalValue;
    }
}
