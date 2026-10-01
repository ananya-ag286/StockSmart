package com.hcl.StockSmart.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hcl.StockSmart.dto.OrderRequest;
import com.hcl.StockSmart.dto.StockCheckResult;
import com.hcl.StockSmart.entity.Order;
import com.hcl.StockSmart.service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public Order createOrder(@RequestBody OrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @GetMapping("/{id}/check-stock")
    public List<StockCheckResult> checkStockAvailability(@PathVariable Long id) {
        return orderService.checkStockAvailability(id);
    }

    @PostMapping("/{id}/process")
    public Order processOrder(@PathVariable Long id) {
        return orderService.processOrder(id);
    }

    @PostMapping("/{id}/cancel")
    public Order cancelOrder(@PathVariable Long id) {
        return orderService.cancelOrder(id);
    }

    @PutMapping("/{id}/status")
    public Order updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return orderService.updateOrderStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public String deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return "Order deleted successfully";
    }
}
