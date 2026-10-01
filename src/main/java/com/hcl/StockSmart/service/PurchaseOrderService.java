package com.hcl.StockSmart.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.hcl.StockSmart.dto.PurchaseOrderItemRequest;
import com.hcl.StockSmart.dto.PurchaseOrderRequest;
import com.hcl.StockSmart.dto.ReceivePurchaseOrderRequest;
import com.hcl.StockSmart.entity.Inventory;
import com.hcl.StockSmart.entity.Location;
import com.hcl.StockSmart.entity.Product;
import com.hcl.StockSmart.entity.PurchaseOrder;
import com.hcl.StockSmart.entity.PurchaseOrderItem;
import com.hcl.StockSmart.entity.Supplier;
import com.hcl.StockSmart.entity.SupplierProduct;
import com.hcl.StockSmart.repository.InventoryRepository;
import com.hcl.StockSmart.repository.LocationRepository;
import com.hcl.StockSmart.repository.ProductRepository;
import com.hcl.StockSmart.repository.PurchaseOrderRepository;
import com.hcl.StockSmart.repository.SupplierProductRepository;
import com.hcl.StockSmart.repository.SupplierRepository;

import jakarta.transaction.Transactional;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final InventoryRepository inventoryRepository;
    private final SupplierProductRepository supplierProductRepository;

    public PurchaseOrderService(
            PurchaseOrderRepository purchaseOrderRepository,
            SupplierRepository supplierRepository,
            ProductRepository productRepository,
            LocationRepository locationRepository,
            InventoryRepository inventoryRepository,
            SupplierProductRepository supplierProductRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.locationRepository = locationRepository;
        this.inventoryRepository = inventoryRepository;
        this.supplierProductRepository = supplierProductRepository;
    }

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    public PurchaseOrder getPurchaseOrderById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found with ID: " + id));
    }

    public List<PurchaseOrder> getPurchaseOrdersBySupplier(Long supplierId) {
        return purchaseOrderRepository.findBySupplierId(supplierId);
    }

    @Transactional
    public PurchaseOrder createPurchaseOrder(PurchaseOrderRequest request) {
        if (request.getSupplierId() == null) {
            throw new RuntimeException("Supplier ID is required for a Purchase Order.");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Purchase Order must contain at least one line item.");
        }

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + request.getSupplierId()));

        Location receiveLocation = null;
        if (request.getReceiveLocationId() != null) {
            receiveLocation = locationRepository.findById(request.getReceiveLocationId()).orElse(null);
        }

        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(supplier);
        po.setReceiveLocation(receiveLocation);
        po.setStatus("ORDERED");
        po.setOrderDate(LocalDateTime.now());
        po.setExpectedDate(request.getExpectedDate() != null ? request.getExpectedDate() : LocalDateTime.now().plusDays(7));

        // Generate PO Number PO-10001
        long nextId = purchaseOrderRepository.count() + 1001;
        po.setPurchaseOrderNumber("PO-" + nextId);

        double totalAmount = 0.0;

        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null) {
                throw new RuntimeException("Product ID is required for each order item.");
            }
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new RuntimeException("Item quantity must be greater than 0.");
            }

            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + itemReq.getProductId()));

            Double unitPrice = itemReq.getUnitPrice();
            if (unitPrice == null || unitPrice <= 0) {
                // Auto-populate from SupplierProduct mapping if exists
                Optional<SupplierProduct> spOpt = supplierProductRepository
                        .findBySupplierIdAndProductId(supplier.getId(), product.getId());
                if (spOpt.isPresent() && spOpt.get().getSupplierPrice() != null) {
                    unitPrice = spOpt.get().getSupplierPrice();
                } else if (product.getPrice() != null) {
                    unitPrice = product.getPrice();
                } else {
                    unitPrice = 0.0;
                }
            }

            if (unitPrice < 0) {
                throw new RuntimeException("Unit price must be greater than or equal to 0.");
            }

            double lineTotal = itemReq.getQuantity() * unitPrice;
            totalAmount += lineTotal;

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setReceivedQuantity(0);
            item.setUnitPrice(unitPrice);
            item.setTotalPrice(lineTotal);

            po.addItem(item);
        }

        po.setTotalAmount(totalAmount);
        return purchaseOrderRepository.save(po);
    }

    @Transactional
    public PurchaseOrder receivePurchaseOrder(Long id, ReceivePurchaseOrderRequest receiveRequest) {
        PurchaseOrder po = getPurchaseOrderById(id);

        if ("RECEIVED".equalsIgnoreCase(po.getStatus())) {
            throw new RuntimeException("Purchase Order " + po.getPurchaseOrderNumber() + " has already been received.");
        }
        if ("CANCELLED".equalsIgnoreCase(po.getStatus())) {
            throw new RuntimeException("Cannot receive a cancelled Purchase Order.");
        }

        Long targetLocationId = receiveRequest != null ? receiveRequest.getLocationId() : null;
        if (targetLocationId == null && po.getReceiveLocation() != null) {
            targetLocationId = po.getReceiveLocation().getId();
        }

        if (targetLocationId == null) {
            throw new RuntimeException("A valid target inventory Location must be selected to receive stock.");
        }

        final Long finalLocationId = targetLocationId;
        Location location = locationRepository.findById(finalLocationId)
                .orElseThrow(() -> new RuntimeException("Location not found with ID: " + finalLocationId));

        po.setReceiveLocation(location);

        boolean allItemsFullyReceived = true;
        boolean anyItemReceived = false;

        for (PurchaseOrderItem item : po.getItems()) {
            int qtyToReceive = item.getQuantity() - (item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0);

            if (receiveRequest != null && receiveRequest.getItemReceivedQuantities() != null && receiveRequest.getItemReceivedQuantities().containsKey(item.getId())) {
                qtyToReceive = receiveRequest.getItemReceivedQuantities().get(item.getId());
            }

            if (qtyToReceive > 0) {
                anyItemReceived = true;
                int updatedReceivedQty = (item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0) + qtyToReceive;
                item.setReceivedQuantity(updatedReceivedQty);

                // Update Inventory at target location using existing Inventory Repository
                Optional<Inventory> existingInvOpt = inventoryRepository
                        .findByProductIdAndLocationId(item.getProduct().getId(), location.getId());

                Inventory inventory;
                if (existingInvOpt.isPresent()) {
                    inventory = existingInvOpt.get();
                    int currentQty = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
                    inventory.setQuantity(currentQty + qtyToReceive);
                } else {
                    inventory = new Inventory();
                    inventory.setProduct(item.getProduct());
                    inventory.setLocation(location);
                    inventory.setQuantity(qtyToReceive);
                }
                inventoryRepository.save(inventory);
            }

            if (item.getReceivedQuantity() < item.getQuantity()) {
                allItemsFullyReceived = false;
            }
        }

        if (allItemsFullyReceived) {
            po.setStatus("RECEIVED");
        } else if (anyItemReceived) {
            po.setStatus("PARTIALLY_RECEIVED");
        }

        po.setReceivedDate(LocalDateTime.now());
        return purchaseOrderRepository.save(po);
    }

    @Transactional
    public PurchaseOrder cancelPurchaseOrder(Long id) {
        PurchaseOrder po = getPurchaseOrderById(id);
        if ("RECEIVED".equalsIgnoreCase(po.getStatus())) {
            throw new RuntimeException("Cannot cancel a fully received Purchase Order.");
        }
        po.setStatus("CANCELLED");
        return purchaseOrderRepository.save(po);
    }
}
