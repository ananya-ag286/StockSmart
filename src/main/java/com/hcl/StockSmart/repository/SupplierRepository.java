package com.hcl.StockSmart.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hcl.StockSmart.entity.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
}