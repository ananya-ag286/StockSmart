package com.hcl.StockSmart.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hcl.StockSmart.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByBarcode(String barcode);
    Optional<Product> findByRfidTag(String rfidTag);
}