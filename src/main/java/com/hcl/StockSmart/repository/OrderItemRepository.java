package com.hcl.StockSmart.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hcl.StockSmart.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
