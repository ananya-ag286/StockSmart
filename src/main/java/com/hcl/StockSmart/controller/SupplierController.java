package com.hcl.StockSmart.controller;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import com.hcl.StockSmart.entity.Supplier;
import com.hcl.StockSmart.service.SupplierService;

@RestController
@RequestMapping("/api/suppliers")
@Tag(name = "Suppliers", description = "Manage supplier profiles and their contact information")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @Operation(summary = "Create a new supplier", description = "Registers a new supplier in the system")
    @ApiResponse(responseCode = "200", description = "Supplier created successfully")
    @PostMapping
    public Supplier createSupplier(@RequestBody Supplier supplier) {
        return supplierService.createSupplier(supplier);
    }

    @Operation(summary = "Get all suppliers", description = "Returns a list of all registered suppliers")
    @ApiResponse(responseCode = "200", description = "Supplier list returned")
    @GetMapping
    public List<Supplier> getAllSuppliers() {
        return supplierService.getAllSuppliers();
    }

    @Operation(summary = "Get supplier by ID", description = "Returns a single supplier record by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Supplier found"),
        @ApiResponse(responseCode = "404", description = "Supplier not found")
    })
    @GetMapping("/{id}")
    public Supplier getSupplierById(@Parameter(description = "Supplier ID") @PathVariable Long id) {
        return supplierService.getSupplierById(id);
    }

    @Operation(summary = "Update a supplier", description = "Updates the details of an existing supplier")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Supplier updated successfully"),
        @ApiResponse(responseCode = "404", description = "Supplier not found")
    })
    @PutMapping("/{id}")
    public Supplier updateSupplier(
            @Parameter(description = "Supplier ID") @PathVariable Long id,
            @RequestBody Supplier supplier) {
        return supplierService.updateSupplier(id, supplier);
    }

    @Operation(summary = "Delete a supplier", description = "Removes a supplier record by ID")
    @ApiResponse(responseCode = "200", description = "Supplier deleted successfully")
    @DeleteMapping("/{id}")
    public String deleteSupplier(@Parameter(description = "Supplier ID") @PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return "Supplier deleted successfully";
    }
}
