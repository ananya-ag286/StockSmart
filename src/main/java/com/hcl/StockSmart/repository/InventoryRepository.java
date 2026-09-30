package com.hcl.StockSmart.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hcl.StockSmart.entity.Inventory;
import com.hcl.StockSmart.entity.Location;
import com.hcl.StockSmart.entity.Product;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductAndLocation(
            Product product,
            Location location
    );
}