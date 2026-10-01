package com.hcl.StockSmart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hcl.StockSmart.entity.PurchaseOrder;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    List<PurchaseOrder> findBySupplierId(Long supplierId);

    List<PurchaseOrder> findByStatus(String status);

    Optional<PurchaseOrder> findByPurchaseOrderNumber(String purchaseOrderNumber);

    long countByStatus(String status);
}
