package com.hcl.StockSmart.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hcl.StockSmart.dto.SupplierProductRequest;
import com.hcl.StockSmart.entity.SupplierProduct;
import com.hcl.StockSmart.service.SupplierProductService;

@RestController
@RequestMapping("/api")
public class SupplierProductController {

    private final SupplierProductService supplierProductService;

    public SupplierProductController(SupplierProductService supplierProductService) {
        this.supplierProductService = supplierProductService;
    }

    @GetMapping("/suppliers/{supplierId}/products")
    public List<SupplierProduct> getProductsBySupplier(@PathVariable Long supplierId) {
        return supplierProductService.getProductsBySupplier(supplierId);
    }

    @PostMapping("/suppliers/{supplierId}/products")
    public SupplierProduct mapProductToSupplier(
            @PathVariable Long supplierId,
            @RequestBody SupplierProductRequest request) {
        return supplierProductService.mapProductToSupplier(supplierId, request);
    }

    @PutMapping("/suppliers/{supplierId}/products/{productId}")
    public SupplierProduct updateSupplierProduct(
            @PathVariable Long supplierId,
            @PathVariable Long productId,
            @RequestBody SupplierProductRequest request) {
        return supplierProductService.updateSupplierProduct(supplierId, productId, request);
    }

    @DeleteMapping("/suppliers/{supplierId}/products/{productId}")
    public String removeProductFromSupplier(
            @PathVariable Long supplierId,
            @PathVariable Long productId) {
        supplierProductService.removeProductFromSupplier(supplierId, productId);
        return "Product removed from supplier successfully";
    }

    @GetMapping("/products/{productId}/suppliers")
    public List<SupplierProduct> getSuppliersByProduct(@PathVariable Long productId) {
        return supplierProductService.getSuppliersByProduct(productId);
    }
}
