package com.hcl.StockSmart.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "supplier_products",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"supplier_id", "product_id"})
    }
)
public class SupplierProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "supplier_price", nullable = false)
    private Double supplierPrice;

    @Column(name = "lead_time_days", nullable = false)
    private Integer leadTimeDays;

    @Column(name = "minimum_order_quantity", nullable = false)
    private Integer minimumOrderQuantity;

    @Column(nullable = false)
    private String status = "ACTIVE";

    public SupplierProduct() {
    }

    public SupplierProduct(Supplier supplier, Product product, Double supplierPrice, Integer leadTimeDays, Integer minimumOrderQuantity) {
        this.supplier = supplier;
        this.product = product;
        this.supplierPrice = supplierPrice;
        this.leadTimeDays = leadTimeDays;
        this.minimumOrderQuantity = minimumOrderQuantity;
        this.status = "ACTIVE";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
