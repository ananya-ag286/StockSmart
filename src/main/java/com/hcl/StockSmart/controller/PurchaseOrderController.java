package com.hcl.StockSmart.controller;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import com.hcl.StockSmart.dto.PurchaseOrderRequest;
import com.hcl.StockSmart.dto.ReceivePurchaseOrderRequest;
import com.hcl.StockSmart.entity.PurchaseOrder;
import com.hcl.StockSmart.service.PurchaseOrderService;

@RestController
@RequestMapping("/api/purchase-orders")
@Tag(name = "Purchase Orders", description = "Manage supplier purchase orders and receive incoming stock into inventory")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @Operation(summary = "Get all purchase orders", description = "Returns a list of all purchase orders across all suppliers")
    @ApiResponse(responseCode = "200", description = "Purchase order list returned")
    @GetMapping
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderService.getAllPurchaseOrders();
    }

    @Operation(summary = "Get purchase order by ID", description = "Returns a single purchase order with its line items")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Purchase order found"),
        @ApiResponse(responseCode = "404", description = "Purchase order not found")
    })
    @GetMapping("/{id}")
    public PurchaseOrder getPurchaseOrderById(
            @Parameter(description = "Purchase order ID") @PathVariable Long id) {
        return purchaseOrderService.getPurchaseOrderById(id);
    }

    @Operation(summary = "Get purchase orders by supplier",
               description = "Returns all purchase orders placed with a specific supplier")
    @ApiResponse(responseCode = "200", description = "Purchase orders for supplier returned")
    @GetMapping("/supplier/{supplierId}")
    public List<PurchaseOrder> getPurchaseOrdersBySupplier(
            @Parameter(description = "Supplier ID") @PathVariable Long supplierId) {
        return purchaseOrderService.getPurchaseOrdersBySupplier(supplierId);
    }

    @Operation(summary = "Create a purchase order",
               description = "Places a new purchase order with one or more product line items")
    @ApiResponse(responseCode = "200", description = "Purchase order created successfully")
    @PostMapping
    public PurchaseOrder createPurchaseOrder(@RequestBody PurchaseOrderRequest request) {
        return purchaseOrderService.createPurchaseOrder(request);
    }

    @Operation(summary = "Receive a purchase order",
               description = "Marks the purchase order as received and adds the incoming stock to inventory")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Stock received and inventory updated"),
        @ApiResponse(responseCode = "404", description = "Purchase order not found")
    })
    @PostMapping("/{id}/receive")
    public PurchaseOrder receivePurchaseOrder(
            @Parameter(description = "Purchase order ID") @PathVariable Long id,
            @RequestBody(required = false) ReceivePurchaseOrderRequest receiveRequest) {
        return purchaseOrderService.receivePurchaseOrder(id, receiveRequest);
    }

    @Operation(summary = "Cancel a purchase order", description = "Cancels a pending purchase order")
    @ApiResponse(responseCode = "200", description = "Purchase order cancelled")
    @PostMapping("/{id}/cancel")
    public PurchaseOrder cancelPurchaseOrder(
            @Parameter(description = "Purchase order ID") @PathVariable Long id) {
        return purchaseOrderService.cancelPurchaseOrder(id);
    }
}
