package com.hcl.StockSmart.controller;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import com.hcl.StockSmart.entity.Inventory;
import com.hcl.StockSmart.service.InventoryService;

@RestController
@RequestMapping("/api/inventory")
@Tag(name = "Inventory", description = "Track and manage stock levels across all locations")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @Operation(summary = "Create inventory record", description = "Assigns an initial stock quantity for a product at a specified location")
    @ApiResponse(responseCode = "200", description = "Inventory record created successfully")
    @PostMapping
    public Inventory createInventory(
            @Parameter(description = "Product ID") @RequestParam Long productId,
            @Parameter(description = "Location ID") @RequestParam Long locationId,
            @Parameter(description = "Initial quantity") @RequestParam Integer quantity) {
        return inventoryService.createInventory(productId, locationId, quantity);
    }

    @Operation(summary = "Get all inventory records", description = "Returns the complete inventory list across all locations")
    @ApiResponse(responseCode = "200", description = "Inventory list returned")
    @GetMapping
    public List<Inventory> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    @Operation(summary = "Get inventory record by ID", description = "Returns a single inventory entry by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inventory record found"),
        @ApiResponse(responseCode = "404", description = "Inventory record not found")
    })
    @GetMapping("/{id}")
    public Inventory getInventoryById(@Parameter(description = "Inventory record ID") @PathVariable Long id) {
        return inventoryService.getInventoryById(id);
    }

    @Operation(summary = "Update inventory quantity", description = "Updates the stock quantity for an existing inventory record")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inventory quantity updated"),
        @ApiResponse(responseCode = "404", description = "Inventory record not found")
    })
    @PutMapping("/{id}")
    public Inventory updateInventory(
            @Parameter(description = "Inventory record ID") @PathVariable Long id,
            @Parameter(description = "New quantity") @RequestParam Integer quantity) {
        return inventoryService.updateInventory(id, quantity);
    }

    @Operation(summary = "Delete inventory record", description = "Removes an inventory record by ID")
    @ApiResponse(responseCode = "200", description = "Inventory record deleted")
    @DeleteMapping("/{id}")
    public String deleteInventory(@Parameter(description = "Inventory record ID") @PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return "Inventory deleted successfully";
    }
}
