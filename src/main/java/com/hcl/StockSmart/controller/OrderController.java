package com.hcl.StockSmart.controller;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import com.hcl.StockSmart.dto.OrderRequest;
import com.hcl.StockSmart.dto.StockCheckResult;
import com.hcl.StockSmart.entity.Order;
import com.hcl.StockSmart.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Create and manage customer orders with inventory validation and auto-deduction")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "Create a new order", description = "Places a new customer order with the specified items")
    @ApiResponse(responseCode = "200", description = "Order created successfully")
    @PostMapping
    public Order createOrder(@RequestBody OrderRequest request) {
        return orderService.createOrder(request);
    }

    @Operation(summary = "Get all orders", description = "Returns a list of all customer orders")
    @ApiResponse(responseCode = "200", description = "Order list returned")
    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @Operation(summary = "Get order by ID", description = "Returns a single order with its line items")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Order found"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @GetMapping("/{id}")
    public Order getOrderById(@Parameter(description = "Order ID") @PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @Operation(summary = "Check stock availability for an order",
               description = "Validates whether sufficient inventory is available to fulfill the specified order")
    @ApiResponse(responseCode = "200", description = "Stock check results returned per item")
    @GetMapping("/{id}/check-stock")
    public List<StockCheckResult> checkStockAvailability(
            @Parameter(description = "Order ID") @PathVariable Long id) {
        return orderService.checkStockAvailability(id);
    }

    @Operation(summary = "Process an order",
               description = "Processes the order: validates stock, deducts inventory, and marks order as processed")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Order processed and inventory updated"),
        @ApiResponse(responseCode = "400", description = "Insufficient stock to fulfill the order")
    })
    @PostMapping("/{id}/process")
    public Order processOrder(@Parameter(description = "Order ID") @PathVariable Long id) {
        return orderService.processOrder(id);
    }

    @Operation(summary = "Cancel an order",
               description = "Cancels a pending order and restores inventory where applicable")
    @ApiResponse(responseCode = "200", description = "Order cancelled and inventory restored")
    @PostMapping("/{id}/cancel")
    public Order cancelOrder(@Parameter(description = "Order ID") @PathVariable Long id) {
        return orderService.cancelOrder(id);
    }

    @Operation(summary = "Update order status", description = "Manually sets the status of an existing order")
    @ApiResponse(responseCode = "200", description = "Order status updated")
    @PutMapping("/{id}/status")
    public Order updateOrderStatus(
            @Parameter(description = "Order ID") @PathVariable Long id,
            @Parameter(description = "New status value (e.g. PENDING, PROCESSED, CANCELLED)") @RequestParam String status) {
        return orderService.updateOrderStatus(id, status);
    }

    @Operation(summary = "Delete an order", description = "Permanently removes an order record")
    @ApiResponse(responseCode = "200", description = "Order deleted successfully")
    @DeleteMapping("/{id}")
    public String deleteOrder(@Parameter(description = "Order ID") @PathVariable Long id) {
        orderService.deleteOrder(id);
        return "Order deleted successfully";
    }
}
