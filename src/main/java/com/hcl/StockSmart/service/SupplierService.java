package com.hcl.StockSmart.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.hcl.StockSmart.entity.Supplier;
import com.hcl.StockSmart.repository.SupplierRepository;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public Supplier createSupplier(Supplier supplier) {
        validateSupplier(supplier);
        if (supplier.getStatus() == null || supplier.getStatus().trim().isEmpty()) {
            supplier.setStatus("ACTIVE");
        }
        return supplierRepository.save(supplier);
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + id));
    }

    public Supplier updateSupplier(Long id, Supplier updatedSupplier) {
        Supplier existingSupplier = getSupplierById(id);
        validateSupplier(updatedSupplier);

        existingSupplier.setName(updatedSupplier.getName());
        existingSupplier.setEmail(updatedSupplier.getEmail());
        existingSupplier.setPhone(updatedSupplier.getPhone());
        existingSupplier.setAddress(updatedSupplier.getAddress());
        if (updatedSupplier.getStatus() != null && !updatedSupplier.getStatus().trim().isEmpty()) {
            existingSupplier.setStatus(updatedSupplier.getStatus());
        }

        return supplierRepository.save(existingSupplier);
    }

    public void deleteSupplier(Long id) {
        Supplier supplier = getSupplierById(id);
        supplierRepository.delete(supplier);
    }

    private void validateSupplier(Supplier supplier) {
        if (supplier == null) {
            throw new RuntimeException("Supplier data is required.");
        }
        if (supplier.getName() == null || supplier.getName().trim().isEmpty()) {
            throw new RuntimeException("Supplier name is required.");
        }
        if (supplier.getEmail() != null && !supplier.getEmail().trim().isEmpty()) {
            if (!supplier.getEmail().contains("@")) {
                throw new RuntimeException("Please enter a valid email address.");
            }
        }
    }
}