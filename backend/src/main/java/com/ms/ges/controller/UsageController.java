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
            Optional<StockItem> stockItemOpt = stockRepository.findById(usage.getStockItemId());
            if (stockItemOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Stock item not found with ID: " + usage.getStockItemId()));
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
        if (usageRepository.existsById(id)) {
            usageRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}