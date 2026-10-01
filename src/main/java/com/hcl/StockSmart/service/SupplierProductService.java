package com.hcl.StockSmart.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.hcl.StockSmart.dto.SupplierProductRequest;
import com.hcl.StockSmart.entity.Product;
import com.hcl.StockSmart.entity.Supplier;
import com.hcl.StockSmart.entity.SupplierProduct;
import com.hcl.StockSmart.repository.ProductRepository;
import com.hcl.StockSmart.repository.SupplierProductRepository;
import com.hcl.StockSmart.repository.SupplierRepository;

import jakarta.transaction.Transactional;

@Service
public class SupplierProductService {

    private final SupplierProductRepository supplierProductRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    public SupplierProductService(
            SupplierProductRepository supplierProductRepository,
            SupplierRepository supplierRepository,
            ProductRepository productRepository) {
        this.supplierProductRepository = supplierProductRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
    }

    public List<SupplierProduct> getProductsBySupplier(Long supplierId) {
        return supplierProductRepository.findBySupplierId(supplierId);
    }

    public List<SupplierProduct> getSuppliersByProduct(Long productId) {
        return supplierProductRepository.findByProductId(productId);
    }

    @Transactional
    public SupplierProduct mapProductToSupplier(Long supplierId, SupplierProductRequest request) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + supplierId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + request.getProductId()));

        if (request.getSupplierPrice() == null || request.getSupplierPrice() < 0) {
            throw new RuntimeException("Supplier price must be greater than or equal to 0.");
        }
        if (request.getLeadTimeDays() == null || request.getLeadTimeDays() < 0) {
            throw new RuntimeException("Lead time days must be greater than or equal to 0.");
        }
        if (request.getMinimumOrderQuantity() == null || request.getMinimumOrderQuantity() <= 0) {
            throw new RuntimeException("Minimum order quantity must be greater than 0.");
        }

        SupplierProduct supplierProduct = supplierProductRepository
                .findBySupplierIdAndProductId(supplierId, request.getProductId())
                .orElseGet(SupplierProduct::new);

        supplierProduct.setSupplier(supplier);
        supplierProduct.setProduct(product);
        supplierProduct.setSupplierPrice(request.getSupplierPrice());
        supplierProduct.setLeadTimeDays(request.getLeadTimeDays());
        supplierProduct.setMinimumOrderQuantity(request.getMinimumOrderQuantity());
        if (request.getStatus() != null) {
            supplierProduct.setStatus(request.getStatus());
        }

        return supplierProductRepository.save(supplierProduct);
    }

    @Transactional
    public SupplierProduct updateSupplierProduct(Long supplierId, Long productId, SupplierProductRequest request) {
        SupplierProduct supplierProduct = supplierProductRepository
                .findBySupplierIdAndProductId(supplierId, productId)
                .orElseThrow(() -> new RuntimeException("Supplier-Product mapping not found for supplier " + supplierId + " and product " + productId));

        if (request.getSupplierPrice() != null) {
            if (request.getSupplierPrice() < 0) {
                throw new RuntimeException("Supplier price must be greater than or equal to 0.");
            }
            supplierProduct.setSupplierPrice(request.getSupplierPrice());
        }
        if (request.getLeadTimeDays() != null) {
            if (request.getLeadTimeDays() < 0) {
                throw new RuntimeException("Lead time days must be greater than or equal to 0.");
            }
            supplierProduct.setLeadTimeDays(request.getLeadTimeDays());
        }
        if (request.getMinimumOrderQuantity() != null) {
            if (request.getMinimumOrderQuantity() <= 0) {
                throw new RuntimeException("Minimum order quantity must be greater than 0.");
            }
            supplierProduct.setMinimumOrderQuantity(request.getMinimumOrderQuantity());
        }
        if (request.getStatus() != null) {
            supplierProduct.setStatus(request.getStatus());
        }

        return supplierProductRepository.save(supplierProduct);
    }

    @Transactional
    public void removeProductFromSupplier(Long supplierId, Long productId) {
        supplierProductRepository.deleteBySupplierIdAndProductId(supplierId, productId);
    }
}
