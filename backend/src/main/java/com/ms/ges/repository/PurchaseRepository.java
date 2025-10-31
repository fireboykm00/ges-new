package com.ms.ges.repository;

import com.ms.ges.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    @Query("SELECT p FROM Purchase p WHERE p.date BETWEEN :startDate AND :endDate")
    List<Purchase> findByDateBetween(LocalDate startDate, LocalDate endDate);
}