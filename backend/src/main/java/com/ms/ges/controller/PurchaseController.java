package com.ms.ges.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ms.ges.model.Purchase;
import com.ms.ges.model.PurchaseItem;
import com.ms.ges.model.StockItem;
import com.ms.ges.repository.PurchaseRepository;
import com.ms.ges.repository.StockRepository;
import com.ms.ges.repository.SupplierRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseRepository purchaseRepository;
    private final StockRepository stockRepository;
    private final SupplierRepository supplierRepository;

    @GetMapping
    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Purchase> getPurchaseById(@PathVariable @NonNull Long id) {
        Optional<Purchase> purchase = purchaseRepository.findById(id);
        return purchase.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<?> createPurchase(@Valid @RequestBody Purchase purchase) {
        try {
            // Set current date if not provided
            if (purchase.getDate() == null) {
                purchase.setDate(LocalDate.now());
            }
            
            // Validate supplier exists
            Long supplierId = purchase.getSupplierId();
            if (supplierId == null || !supplierRepository.existsById(supplierId)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid or not found supplier ID: " + supplierId));
            }

            // Validate and calculate total amount
            double totalAmount = 0.0;
            if (purchase.getItems() == null || purchase.getItems().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "At least one item is required"));
            }

            // Process items and calculate total without duplicating them
            for (PurchaseItem item : purchase.getItems()) {
                // Validate stock item exists
                Long stockItemId = item.getStockItemId();
                if (stockItemId == null) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("message", "Stock item ID cannot be null"));
                }
                Optional<StockItem> stockItemOpt = stockRepository.findById(stockItemId);
                if (stockItemOpt.isEmpty()) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("message", "Stock item not found with ID: " + stockItemId));
                }

                if (item.getQuantity() <= 0) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("message", "Item quantity must be greater than 0"));
                }

                if (item.getPrice() <= 0) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("message", "Item price must be greater than 0"));
                }

                totalAmount += item.getQuantity() * item.getPrice();

                // Update stock quantity
                StockItem stockItem = stockItemOpt.get();
                stockItem.setQuantity(stockItem.getQuantity() + item.getQuantity());
                stockRepository.save(stockItem);
                
                // Set the purchase reference to maintain bidirectional relationship
                item.setPurchase(purchase);
            }
            
            purchase.setTotalAmount(totalAmount);
            Purchase savedPurchase = purchaseRepository.save(purchase);
            return ResponseEntity.ok(savedPurchase);
        } catch (Exception e) {
            e.printStackTrace(); // Log the actual error for debugging
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Failed to create purchase: " + e.getMessage()));
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchase(@PathVariable @NonNull Long id) {
        try {
            if (!purchaseRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            purchaseRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}