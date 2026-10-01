package com.hcl.StockSmart.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hcl.StockSmart.dto.PurchaseOrderRequest;
import com.hcl.StockSmart.dto.ReceivePurchaseOrderRequest;
import com.hcl.StockSmart.entity.PurchaseOrder;
import com.hcl.StockSmart.service.PurchaseOrderService;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @GetMapping
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderService.getAllPurchaseOrders();
    }

    @GetMapping("/{id}")
    public PurchaseOrder getPurchaseOrderById(@PathVariable Long id) {
        return purchaseOrderService.getPurchaseOrderById(id);
    }

    @GetMapping("/supplier/{supplierId}")
    public List<PurchaseOrder> getPurchaseOrdersBySupplier(@PathVariable Long supplierId) {
        return purchaseOrderService.getPurchaseOrdersBySupplier(supplierId);
    }

    @PostMapping
    public PurchaseOrder createPurchaseOrder(@RequestBody PurchaseOrderRequest request) {
        return purchaseOrderService.createPurchaseOrder(request);
    }

    @PostMapping("/{id}/receive")
    public PurchaseOrder receivePurchaseOrder(
            @PathVariable Long id,
            @RequestBody(required = false) ReceivePurchaseOrderRequest receiveRequest) {
        return purchaseOrderService.receivePurchaseOrder(id, receiveRequest);
    }

    @PostMapping("/{id}/cancel")
    public PurchaseOrder cancelPurchaseOrder(@PathVariable Long id) {
        return purchaseOrderService.cancelPurchaseOrder(id);
    }
}
