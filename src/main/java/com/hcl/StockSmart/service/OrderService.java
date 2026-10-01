package com.hcl.StockSmart.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.hcl.StockSmart.dto.OrderItemRequest;
import com.hcl.StockSmart.dto.OrderRequest;
import com.hcl.StockSmart.dto.StockCheckResult;
import com.hcl.StockSmart.entity.Inventory;
import com.hcl.StockSmart.entity.Location;
import com.hcl.StockSmart.entity.Order;
import com.hcl.StockSmart.entity.OrderItem;
import com.hcl.StockSmart.entity.Product;
import com.hcl.StockSmart.repository.InventoryRepository;
import com.hcl.StockSmart.repository.LocationRepository;
import com.hcl.StockSmart.repository.OrderRepository;
import com.hcl.StockSmart.repository.ProductRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final InventoryRepository inventoryRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            LocationRepository locationRepository,
            InventoryRepository inventoryRepository) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.locationRepository = locationRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public Order createOrder(OrderRequest request) {
        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        Order order = new Order();
        order.setLocation(location);
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        double totalAmount = 0.0;

        if (request.getItems() != null) {
            for (OrderItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemReq.getProductId()));

                OrderItem item = new OrderItem();
                item.setProduct(product);
                item.setQuantity(itemReq.getQuantity());

                double unitPrice = product.getPrice() != null ? product.getPrice() : 0.0;
                item.setPrice(unitPrice);

                totalAmount += unitPrice * itemReq.getQuantity();
                order.addItem(item);
            }
        }

        order.setTotalAmount(totalAmount);
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    public List<StockCheckResult> checkStockAvailability(Long orderId) {
        Order order = getOrderById(orderId);
        List<StockCheckResult> results = new ArrayList<>();

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            Inventory inventory = inventoryRepository.findByProductAndLocation(product, order.getLocation())
                    .orElse(null);

            int availableQuantity = inventory != null ? inventory.getQuantity() : 0;
            boolean isAvailable = availableQuantity >= item.getQuantity();

            results.add(new StockCheckResult(
                    product.getId(),
                    product.getName(),
                    item.getQuantity(),
                    availableQuantity,
                    isAvailable
            ));
        }

        return results;
    }

    public Order processOrder(Long id) {
        Order order = getOrderById(id);

        if ("PROCESSED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Order is already processed");
        }
        if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Cannot process a cancelled order");
        }

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            Inventory inventory = inventoryRepository.findByProductAndLocation(product, order.getLocation())
                    .orElseThrow(() -> new RuntimeException("Inventory not found for product: " + product.getName() + " at location: " + order.getLocation().getName()));

            if (inventory.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName()
                        + " at location: " + order.getLocation().getName()
                        + ". Available: " + inventory.getQuantity() + ", Requested: " + item.getQuantity());
            }
        }

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            Inventory inventory = inventoryRepository.findByProductAndLocation(product, order.getLocation()).get();
            inventory.setQuantity(inventory.getQuantity() - item.getQuantity());
            inventoryRepository.save(inventory);
        }

        order.setStatus("PROCESSED");
        return orderRepository.save(order);
    }

    public Order cancelOrder(Long id) {
        Order order = getOrderById(id);

        if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
            return order;
        }

        if ("PROCESSED".equalsIgnoreCase(order.getStatus())) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                Inventory inventory = inventoryRepository.findByProductAndLocation(product, order.getLocation())
                        .orElse(null);

                if (inventory != null) {
                    inventory.setQuantity(inventory.getQuantity() + item.getQuantity());
                    inventoryRepository.save(inventory);
                } else {
                    Inventory newInv = new Inventory();
                    newInv.setProduct(product);
                    newInv.setLocation(order.getLocation());
                    newInv.setQuantity(item.getQuantity());
                    inventoryRepository.save(newInv);
                }
            }
        }

        order.setStatus("CANCELLED");
        return orderRepository.save(order);
    }

    public Order updateOrderStatus(Long id, String status) {
        if ("PROCESSED".equalsIgnoreCase(status)) {
            return processOrder(id);
        } else if ("CANCELLED".equalsIgnoreCase(status)) {
            return cancelOrder(id);
        } else {
            Order order = getOrderById(id);
            order.setStatus(status);
            return orderRepository.save(order);
        }
    }

    public void deleteOrder(Long id) {
        Order order = getOrderById(id);
        orderRepository.delete(order);
    }
}
