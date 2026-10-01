package com.hcl.StockSmart.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.hcl.StockSmart.dto.LocationInventoryReportDto;
import com.hcl.StockSmart.dto.LowStockReportDto;
import com.hcl.StockSmart.dto.SummaryReportDto;
import com.hcl.StockSmart.entity.Inventory;
import com.hcl.StockSmart.entity.Location;
import com.hcl.StockSmart.entity.Product;
import com.hcl.StockSmart.entity.SupplierProduct;
import com.hcl.StockSmart.repository.InventoryRepository;
import com.hcl.StockSmart.repository.LocationRepository;
import com.hcl.StockSmart.repository.OrderRepository;
import com.hcl.StockSmart.repository.ProductRepository;
import com.hcl.StockSmart.repository.PurchaseOrderRepository;
import com.hcl.StockSmart.repository.SupplierProductRepository;
import com.hcl.StockSmart.repository.SupplierRepository;

@Service
public class KpiReportService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final LocationRepository locationRepository;
    private final SupplierRepository supplierRepository;
    private final OrderRepository orderRepository;
    private final SupplierProductRepository supplierProductRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public KpiReportService(
            ProductRepository productRepository,
            InventoryRepository inventoryRepository,
            LocationRepository locationRepository,
            SupplierRepository supplierRepository,
            OrderRepository orderRepository,
            SupplierProductRepository supplierProductRepository,
            PurchaseOrderRepository purchaseOrderRepository) {

        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.locationRepository = locationRepository;
        this.supplierRepository = supplierRepository;
        this.orderRepository = orderRepository;
        this.supplierProductRepository = supplierProductRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    public SummaryReportDto getSummaryReport() {
        SummaryReportDto summary = new SummaryReportDto();

        summary.setTotalProducts(productRepository.count());
        summary.setTotalLocations(locationRepository.count());
        summary.setTotalSuppliers(supplierRepository.count());
        summary.setTotalOrders(orderRepository.count());
        summary.setProcessedOrders(orderRepository.countByStatus("PROCESSED"));
        summary.setPendingPurchaseOrdersCount(purchaseOrderRepository.countByStatus("ORDERED"));

        List<Inventory> inventories = inventoryRepository.findAll();
        long totalQuantity = 0;
        double totalValue = 0.0;

        for (Inventory inv : inventories) {
            int qty = inv.getQuantity() != null ? inv.getQuantity() : 0;
            totalQuantity += qty;
            double price = (inv.getProduct() != null && inv.getProduct().getPrice() != null)
                    ? inv.getProduct().getPrice() : 0.0;
            totalValue += qty * price;
        }

        summary.setTotalInventoryQuantity(totalQuantity);
        summary.setTotalInventoryValue(totalValue);

        long lowStockCount = getLowStockReport().size();
        summary.setLowStockProductsCount(lowStockCount);

        return summary;
    }

    public List<LowStockReportDto> getLowStockReport() {
        List<Inventory> inventories = inventoryRepository.findAll();
        List<LowStockReportDto> report = new ArrayList<>();

        for (Inventory inv : inventories) {
            Product product = inv.getProduct();
            if (product != null && product.getReorderLevel() != null) {
                int currentStock = inv.getQuantity() != null ? inv.getQuantity() : 0;
                Integer reorderLevel = product.getReorderLevel();

                if (currentStock <= reorderLevel) {
                    String status = currentStock == 0 ? "CRITICAL" : "WARNING";
                    Long locId = inv.getLocation() != null ? inv.getLocation().getId() : null;
                    String locName = inv.getLocation() != null ? inv.getLocation().getName() : "Unknown";

                    LowStockReportDto dto = new LowStockReportDto(
                            product.getId(),
                            product.getName(),
                            product.getSku(),
                            reorderLevel,
                            currentStock,
                            status,
                            locId,
                            locName
                    );

                    // Fetch Live Preferred Supplier Info if mapped
                    List<SupplierProduct> suppliers = supplierProductRepository.findByProductId(product.getId());
                    if (!suppliers.isEmpty()) {
                        SupplierProduct primarySupplier = suppliers.get(0);
                        if (primarySupplier.getSupplier() != null) {
                            dto.setSupplierId(primarySupplier.getSupplier().getId());
                            dto.setSupplierName(primarySupplier.getSupplier().getName());
                        }
                        dto.setSupplierPrice(primarySupplier.getSupplierPrice());
                        dto.setLeadTimeDays(primarySupplier.getLeadTimeDays());
                        dto.setMinimumOrderQuantity(primarySupplier.getMinimumOrderQuantity());
                    }

                    report.add(dto);
                }
            }
        }

        return report;
    }

    public List<LocationInventoryReportDto> getLocationInventoryReport() {
        List<Location> locations = locationRepository.findAll();
        List<Inventory> inventories = inventoryRepository.findAll();

        Map<Long, List<Inventory>> locationInventoryMap = new HashMap<>();
        for (Inventory inv : inventories) {
            if (inv.getLocation() != null) {
                Long locId = inv.getLocation().getId();
                locationInventoryMap.computeIfAbsent(locId, k -> new ArrayList<>()).add(inv);
            }
        }

        List<LocationInventoryReportDto> report = new ArrayList<>();
        for (Location loc : locations) {
            List<Inventory> locInventories = locationInventoryMap.getOrDefault(loc.getId(), new ArrayList<>());
            int totalItems = locInventories.size();
            int totalQuantity = 0;
            double totalValue = 0.0;

            for (Inventory inv : locInventories) {
                int qty = inv.getQuantity() != null ? inv.getQuantity() : 0;
                totalQuantity += qty;
                double price = (inv.getProduct() != null && inv.getProduct().getPrice() != null)
                        ? inv.getProduct().getPrice() : 0.0;
                totalValue += qty * price;
            }

            report.add(new LocationInventoryReportDto(
                    loc.getId(),
                    loc.getName(),
                    loc.getType(),
                    totalItems,
                    totalQuantity,
                    totalValue
            ));
        }

        return report;
    }
}
