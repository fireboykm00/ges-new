package com.ms.ges.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ms.ges.model.StockItem;
import com.ms.ges.model.Usage;
import com.ms.ges.repository.StockRepository;
import com.ms.ges.repository.UsageRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usages")
@RequiredArgsConstructor
public class UsageController {

    private final UsageRepository usageRepository;
    private final StockRepository stockRepository;

    private Optional<StockItem> validateAndGetStockItem(@NonNull Long stockItemId) {
        return stockRepository.findById(stockItemId);
    }

    @GetMapping
    public List<Usage> getAllUsages() {
        return usageRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usage> getUsageById(@PathVariable @NonNull Long id) {
        Optional<Usage> usage = usageRepository.findById(id);
        return usage.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUsage(@Valid @RequestBody Usage usage) {
        try {
            // Set current date if not provided
            if (usage.getDate() == null) {
                usage.setDate(LocalDate.now());
            }
            
            // Validate stock item exists
            Long stockItemId = usage.getStockItemId();
            if (stockItemId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Stock item ID cannot be null"));
            }

            Optional<StockItem> stockItemOpt = stockRepository.findById(stockItemId);
            if (stockItemOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Stock item not found with ID: " + stockItemId));
            }

            StockItem stockItem = stockItemOpt.get();
            
            // Check if there's enough quantity
            if (stockItem.getQuantity() < usage.getQuantityUsed()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", 
                        "Insufficient stock. Available: " + stockItem.getQuantity() + 
                        ", Requested: " + usage.getQuantityUsed()));
            }

            // Set the user who recorded the usage
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof com.ms.ges.model.User) {
                usage.setUser((com.ms.ges.model.User) authentication.getPrincipal());
            }

            // Update stock quantity
            stockItem.setQuantity(stockItem.getQuantity() - usage.getQuantityUsed());
            stockRepository.save(stockItem);
            
            Usage savedUsage = usageRepository.save(usage);
            return ResponseEntity.ok(savedUsage);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Failed to create usage record: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsage(@PathVariable @NonNull Long id) {
        Optional<Usage> existingUsage = usageRepository.findById(id);
        if (existingUsage.isPresent()) {
            Usage usage = existingUsage.get();
            
            // Restore the stock quantity before deleting
            Optional<StockItem> stockItemOpt = stockRepository.findById(usage.getStockItemId());
            if (stockItemOpt.isPresent()) {
                StockItem stockItem = stockItemOpt.get();
                stockItem.setQuantity(stockItem.getQuantity() + usage.getQuantityUsed());
                stockRepository.save(stockItem);
            }
            
            usageRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUsage(@PathVariable @NonNull Long id, @Valid @RequestBody Usage usage, Authentication auth) {
        try {
            Optional<Usage> existingUsageOpt = usageRepository.findById(id);
            if (existingUsageOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Usage existingUsage = existingUsageOpt.get();

            // Verify user is authorized to update this record
            String currentUser = auth.getName();
            if (existingUsage.getUser() != null && !existingUsage.getUser().getUsername().equals(currentUser)) {
                return ResponseEntity.status(403)
                    .body(Map.of("message", "You are not authorized to update this record"));
            }

            // Validate stock item exists
            Long stockItemId = usage.getStockItemId();
            if (stockItemId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Stock item ID cannot be null"));
            }
            
            Optional<StockItem> stockItemOpt = validateAndGetStockItem(stockItemId);
            if (stockItemOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Stock item not found with ID: " + stockItemId));
            }

            StockItem stockItem = stockItemOpt.get();
            
            // Calculate the net change in quantity
            double quantityDifference = usage.getQuantityUsed() - existingUsage.getQuantityUsed();
            
            // Check if there's enough quantity for the update
            if (stockItem.getQuantity() < quantityDifference) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", 
                        "Insufficient stock. Available: " + stockItem.getQuantity() + 
                        ", Additional quantity needed: " + quantityDifference));
            }

            // Update stock quantity
            stockItem.setQuantity(stockItem.getQuantity() - quantityDifference);
            stockRepository.save(stockItem);
            
            // Update usage record
            existingUsage.setStockItemId(usage.getStockItemId());
            existingUsage.setQuantityUsed(usage.getQuantityUsed());
            existingUsage.setDate(usage.getDate() != null ? usage.getDate() : existingUsage.getDate());
            
            Usage updatedUsage = usageRepository.save(existingUsage);
            return ResponseEntity.ok(updatedUsage);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Failed to update usage record: " + e.getMessage()));
        }
    }
}