package com.ms.ges.repository;

import com.ms.ges.model.Usage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface UsageRepository extends JpaRepository<Usage, Long> {
    @Query("SELECT u FROM Usage u WHERE u.date BETWEEN :startDate AND :endDate")
    List<Usage> findByDateBetween(LocalDate startDate, LocalDate endDate);
}