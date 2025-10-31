package com.ms.ges.controller;

import com.ms.ges.model.StockItem;
import com.ms.ges.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockRepository stockRepository;

    @GetMapping
    public List<StockItem> getAllStocks() {
        return stockRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockItem> getStockById(@PathVariable Long id) {
        Optional<StockItem> stock = stockRepository.findById(id);
        return stock.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public StockItem createStock(@RequestBody StockItem stockItem) {
        return stockRepository.save(stockItem);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<StockItem> updateStock(@PathVariable Long id, @RequestBody StockItem stockItemDetails) {
        Optional<StockItem> optionalStock = stockRepository.findById(id);
        if (optionalStock.isPresent()) {
            StockItem stockItem = optionalStock.get();
            stockItem.setName(stockItemDetails.getName());
            stockItem.setCategory(stockItemDetails.getCategory());
            stockItem.setQuantity(stockItemDetails.getQuantity());
            stockItem.setUnitPrice(stockItemDetails.getUnitPrice());
            stockItem.setReorderLevel(stockItemDetails.getReorderLevel());
            return ResponseEntity.ok(stockRepository.save(stockItem));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable Long id) {
        if (stockRepository.existsById(id)) {
            stockRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}