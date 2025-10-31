package com.ms.ges.controller;

import com.ms.ges.repository.PurchaseRepository;
import com.ms.ges.repository.ExpenseRepository;
import com.ms.ges.repository.StockRepository;
import com.ms.ges.repository.UsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final PurchaseRepository purchaseRepository;
    private final ExpenseRepository expenseRepository;
    private final StockRepository stockRepository;
    private final UsageRepository usageRepository;

    @GetMapping("/monthly")
    public Map<String, Object> monthlyReport(@RequestParam String month) {
        LocalDate start = LocalDate.parse(month + "-01");
        LocalDate end = start.plusMonths(1);

        double purchases = purchaseRepository.findByDateBetween(start, end)
                .stream().mapToDouble(purchase -> purchase.getTotalAmount()).sum();
                
        double expenses = expenseRepository.findByDateBetween(start, end)
                .stream().mapToDouble(expense -> expense.getAmount()).sum();
                
        long lowStock = stockRepository.findLowStockItems().size();
        
        long usageCount = usageRepository.findByDateBetween(start, end).size();

        Map<String, Object> report = new HashMap<>();
        report.put("month", month);
        report.put("purchases", purchases);
        report.put("expenses", expenses);
        report.put("lowStock", lowStock);
        report.put("usageCount", usageCount);

        return report;
    }
}