package com.hcl.StockSmart.controller;

import com.hcl.StockSmart.entity.Product;
import com.hcl.StockSmart.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Manage products including categories, SKUs, pricing, barcodes, and RFID tags")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @Operation(summary = "Create a new product", description = "Adds a new product to the catalog")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Product created successfully") })
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @Operation(summary = "Get all products", description = "Returns a list of all products in the catalog")
    @ApiResponse(responseCode = "200", description = "List of products returned")
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @Operation(summary = "Get product by ID", description = "Returns a single product by its unique ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Product found"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @GetMapping("/{id}")
    public Product getProductById(@Parameter(description = "Product ID") @PathVariable Long id) {
        return productService.getProductById(id);
    }

    @Operation(summary = "Update a product", description = "Updates the details of an existing product")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Product updated successfully"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @PutMapping("/{id}")
    public Product updateProduct(
            @Parameter(description = "Product ID") @PathVariable Long id,
            @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    @Operation(summary = "Find product by barcode", description = "Looks up a product using its barcode value")
    @ApiResponse(responseCode = "200", description = "Product found by barcode")
    @GetMapping("/barcode/{barcode}")
    public Product getProductByBarcode(@Parameter(description = "Barcode string") @PathVariable String barcode) {
        return productService.getProductByBarcode(barcode);
    }

    @Operation(summary = "Find product by RFID tag", description = "Looks up a product using its RFID tag identifier")
    @ApiResponse(responseCode = "200", description = "Product found by RFID tag")
    @GetMapping("/rfid/{rfidTag}")
    public Product getProductByRfidTag(@Parameter(description = "RFID tag value") @PathVariable String rfidTag) {
        return productService.getProductByRfidTag(rfidTag);
    }

    @Operation(summary = "Update product barcode", description = "Assigns or updates the barcode for a product")
    @ApiResponse(responseCode = "200", description = "Barcode updated successfully")
    @PutMapping("/{id}/barcode")
    public Product updateProductBarcode(
            @Parameter(description = "Product ID") @PathVariable Long id,
            @Parameter(description = "New barcode value") @RequestParam String barcode) {
        return productService.updateProductBarcode(id, barcode);
    }

    @Operation(summary = "Update product RFID tag", description = "Assigns or updates the RFID tag for a product")
    @ApiResponse(responseCode = "200", description = "RFID tag updated successfully")
    @PutMapping("/{id}/rfid")
    public Product updateProductRfidTag(
            @Parameter(description = "Product ID") @PathVariable Long id,
            @Parameter(description = "New RFID tag value") @RequestParam String rfidTag) {
        return productService.updateProductRfidTag(id, rfidTag);
    }

    @Operation(summary = "Delete a product", description = "Removes a product from the catalog by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Product deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @DeleteMapping("/{id}")
    public String deleteProduct(@Parameter(description = "Product ID") @PathVariable Long id) {
        productService.deleteProduct(id);
        return "Product deleted successfully";
    }
}
