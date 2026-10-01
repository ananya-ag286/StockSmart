package com.hcl.StockSmart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hcl.StockSmart.entity.SupplierProduct;

public interface SupplierProductRepository extends JpaRepository<SupplierProduct, Long> {

    List<SupplierProduct> findBySupplierId(Long supplierId);

    List<SupplierProduct> findByProductId(Long productId);

    Optional<SupplierProduct> findBySupplierIdAndProductId(Long supplierId, Long productId);

    boolean existsBySupplierIdAndProductId(Long supplierId, Long productId);

    void deleteBySupplierIdAndProductId(Long supplierId, Long productId);
}
