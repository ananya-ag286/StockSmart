package com.hcl.StockSmart.controller;

import com.hcl.StockSmart.entity.Product;
import com.hcl.StockSmart.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {

        return productService.updateProduct(id, product);
    }

    @GetMapping("/barcode/{barcode}")
    public Product getProductByBarcode(@PathVariable String barcode) {
        return productService.getProductByBarcode(barcode);
    }

    @GetMapping("/rfid/{rfidTag}")
    public Product getProductByRfidTag(@PathVariable String rfidTag) {
        return productService.getProductByRfidTag(rfidTag);
    }

    @PutMapping("/{id}/barcode")
    public Product updateProductBarcode(
            @PathVariable Long id,
            @RequestParam String barcode) {
        return productService.updateProductBarcode(id, barcode);
    }

    @PutMapping("/{id}/rfid")
    public Product updateProductRfidTag(
            @PathVariable Long id,
            @RequestParam String rfidTag) {
        return productService.updateProductRfidTag(id, rfidTag);
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {

        productService.deleteProduct(id);

        return "Product deleted successfully";
    }
}