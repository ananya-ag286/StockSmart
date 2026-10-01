package com.hcl.StockSmart.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "purchase_order_number", unique = true, nullable = false)
    private String purchaseOrderNumber;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(nullable = false)
    private String status; // DRAFT, ORDERED, RECEIVED, PARTIALLY_RECEIVED, CANCELLED

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @Column(name = "expected_date")
    private LocalDateTime expectedDate;

    @Column(name = "received_date")
    private LocalDateTime receivedDate;

    @ManyToOne
    @JoinColumn(name = "receive_location_id")
    private Location receiveLocation;

    @Column(name = "total_amount")
    private Double totalAmount;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<PurchaseOrderItem> items = new ArrayList<>();

    public PurchaseOrder() {
        this.orderDate = LocalDateTime.now();
        this.status = "ORDERED";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPurchaseOrderNumber() {
        return purchaseOrderNumber;
    }

    public void setPurchaseOrderNumber(String purchaseOrderNumber) {
        this.purchaseOrderNumber = purchaseOrderNumber;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDateTime getExpectedDate() {
        return expectedDate;
    }

    public void setExpectedDate(LocalDateTime expectedDate) {
        this.expectedDate = expectedDate;
    }

    public LocalDateTime getReceivedDate() {
        return receivedDate;
    }

    public void setReceivedDate(LocalDateTime receivedDate) {
        this.receivedDate = receivedDate;
    }

    public Location getReceiveLocation() {
        return receiveLocation;
    }

    public void setReceiveLocation(Location receiveLocation) {
        this.receiveLocation = receiveLocation;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<PurchaseOrderItem> getItems() {
        return items;
    }

    public void setItems(List<PurchaseOrderItem> items) {
        this.items = items;
    }

    public void addItem(PurchaseOrderItem item) {
        items.add(item);
        item.setPurchaseOrder(this);
    }
}
