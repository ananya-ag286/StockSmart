package com.hcl.StockSmart.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hcl.StockSmart.entity.PurchaseOrderItem;

public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {

    List<PurchaseOrderItem> findByPurchaseOrderId(Long purchaseOrderId);
}
