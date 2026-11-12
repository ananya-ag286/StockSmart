package com.hcl.StockSmart.controller;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import com.hcl.StockSmart.dto.SupplierProductRequest;
import com.hcl.StockSmart.entity.SupplierProduct;
import com.hcl.StockSmart.service.SupplierProductService;

@RestController
@RequestMapping("/api")
@Tag(name = "Supplier Products", description = "Manage product-supplier associations including pricing and lead times")
public class SupplierProductController {

    private final SupplierProductService supplierProductService;

    public SupplierProductController(SupplierProductService supplierProductService) {
        this.supplierProductService = supplierProductService;
    }

    @Operation(summary = "Get products for a supplier",
               description = "Returns all products associated with a specific supplier")
    @ApiResponse(responseCode = "200", description = "Product list for supplier returned")
    @GetMapping("/suppliers/{supplierId}/products")
    public List<SupplierProduct> getProductsBySupplier(
            @Parameter(description = "Supplier ID") @PathVariable Long supplierId) {
        return supplierProductService.getProductsBySupplier(supplierId);
    }

    @Operation(summary = "Link a product to a supplier",
               description = "Creates a supplier-product association with pricing and lead time details")
    @ApiResponse(responseCode = "200", description = "Product linked to supplier successfully")
    @PostMapping("/suppliers/{supplierId}/products")
    public SupplierProduct mapProductToSupplier(
            @Parameter(description = "Supplier ID") @PathVariable Long supplierId,
            @RequestBody SupplierProductRequest request) {
        return supplierProductService.mapProductToSupplier(supplierId, request);
    }

    @Operation(summary = "Update a supplier-product association",
               description = "Updates pricing, lead time, or minimum order quantity for a supplier-product link")
    @ApiResponse(responseCode = "200", description = "Supplier-product association updated")
    @PutMapping("/suppliers/{supplierId}/products/{productId}")
    public SupplierProduct updateSupplierProduct(
            @Parameter(description = "Supplier ID") @PathVariable Long supplierId,
            @Parameter(description = "Product ID") @PathVariable Long productId,
            @RequestBody SupplierProductRequest request) {
        return supplierProductService.updateSupplierProduct(supplierId, productId, request);
    }

    @Operation(summary = "Remove a product from a supplier",
               description = "Deletes the association between a supplier and a specific product")
    @ApiResponse(responseCode = "200", description = "Product removed from supplier")
    @DeleteMapping("/suppliers/{supplierId}/products/{productId}")
    public String removeProductFromSupplier(
            @Parameter(description = "Supplier ID") @PathVariable Long supplierId,
            @Parameter(description = "Product ID") @PathVariable Long productId) {
        supplierProductService.removeProductFromSupplier(supplierId, productId);
        return "Product removed from supplier successfully";
    }

    @Operation(summary = "Get suppliers for a product",
               description = "Returns all suppliers that carry a specific product")
    @ApiResponse(responseCode = "200", description = "Supplier list for product returned")
    @GetMapping("/products/{productId}/suppliers")
    public List<SupplierProduct> getSuppliersByProduct(
            @Parameter(description = "Product ID") @PathVariable Long productId) {
        return supplierProductService.getSuppliersByProduct(productId);
    }
}
