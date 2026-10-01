package com.hcl.StockSmart.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.hcl.StockSmart.entity.Product;
import com.hcl.StockSmart.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product updateProduct(Long id, Product updatedProduct) {

        Product existingProduct = getProductById(id);

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setSku(updatedProduct.getSku());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setReorderLevel(updatedProduct.getReorderLevel());
        if (updatedProduct.getBarcode() != null) {
            existingProduct.setBarcode(updatedProduct.getBarcode());
        }
        if (updatedProduct.getRfidTag() != null) {
            existingProduct.setRfidTag(updatedProduct.getRfidTag());
        }

        return productRepository.save(existingProduct);
    }

    public Product getProductByBarcode(String barcode) {
        return productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException("Product not found with barcode: " + barcode));
    }

    public Product getProductByRfidTag(String rfidTag) {
        return productRepository.findByRfidTag(rfidTag)
                .orElseThrow(() -> new RuntimeException("Product not found with RFID tag: " + rfidTag));
    }

    public Product updateProductBarcode(Long id, String barcode) {
        Product product = getProductById(id);
        product.setBarcode(barcode);
        return productRepository.save(product);
    }

    public Product updateProductRfidTag(Long id, String rfidTag) {
        Product product = getProductById(id);
        product.setRfidTag(rfidTag);
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}