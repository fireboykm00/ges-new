package com.ms.ges.repository;

import com.ms.ges.model.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<StockItem, Long> {
    @Query("SELECT s FROM StockItem s WHERE s.quantity <= s.reorderLevel")
    List<StockItem> findLowStockItems();
}