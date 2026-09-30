package com.hcl.StockSmart.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hcl.StockSmart.entity.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {
}