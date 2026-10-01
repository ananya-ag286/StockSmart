package com.hcl.StockSmart.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hcl.StockSmart.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    long countByStatus(String status);
}
