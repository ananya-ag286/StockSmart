package com.hcl.StockSmart.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hcl.StockSmart.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}