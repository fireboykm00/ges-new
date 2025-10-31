package com.ms.ges.config;

import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ms.ges.model.Expense;
import com.ms.ges.model.Purchase;
import com.ms.ges.model.PurchaseItem;
import com.ms.ges.model.Role;
import com.ms.ges.model.StockItem;
import com.ms.ges.model.Supplier;
import com.ms.ges.model.Usage;
import com.ms.ges.model.User;
import com.ms.ges.repository.ExpenseRepository;
import com.ms.ges.repository.PurchaseRepository;
import com.ms.ges.repository.StockRepository;
import com.ms.ges.repository.SupplierRepository;
import com.ms.ges.repository.UsageRepository;
import com.ms.ges.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final StockRepository stockRepository;
    private final ExpenseRepository expenseRepository;
    private final PurchaseRepository purchaseRepository;
    private final UsageRepository usageRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedDemoData() {
        return args -> {
            // Create users
            createIfMissing("admin", Role.ADMIN);
            createIfMissing("manager", Role.MANAGER);
            createIfMissing("staff", Role.STAFF);

            // Create suppliers
            Supplier supplier1 = new Supplier();
            supplier1.setName("Fresh Foods Ltd");
            supplier1.setContactPerson("John Doe");
            supplier1.setPhone("123-456-7890");
            supplier1.setEmail("john@freshfoods.com");
            Supplier savedSupplier1 = supplierRepository.save(supplier1);

            Supplier supplier2 = new Supplier();
            supplier2.setName("Quality Meats Co");
            supplier2.setContactPerson("Jane Smith");
            supplier2.setPhone("987-654-3210");
            supplier2.setEmail("jane@qualitymeats.com");
            Supplier savedSupplier2 = supplierRepository.save(supplier2);

            // Create stock items
            StockItem stock1 = new StockItem();
            stock1.setName("Rice");
            stock1.setCategory("Grains");
            stock1.setQuantity(100.0);
            stock1.setUnitPrice(2.5);
            stock1.setReorderLevel(20.0);
            StockItem savedStock1 = stockRepository.save(stock1);

            StockItem stock2 = new StockItem();
            stock2.setName("Chicken");
            stock2.setCategory("Meat");
            stock2.setQuantity(50.0);
            stock2.setUnitPrice(5.0);
            stock2.setReorderLevel(10.0);
            StockItem savedStock2 = stockRepository.save(stock2);

            StockItem stock3 = new StockItem();
            stock3.setName("Tomatoes");
            stock3.setCategory("Vegetables");
            stock3.setQuantity(75.0);
            stock3.setUnitPrice(1.5);
            stock3.setReorderLevel(15.0);
            StockItem savedStock3 = stockRepository.save(stock3);

            // Create expenses
            Expense expense1 = new Expense();
            expense1.setCategory("Utilities");
            expense1.setAmount(500.0);
            expense1.setDescription("Electricity bill");
            expense1.setDate(LocalDate.now());
            expenseRepository.save(expense1);

            Expense expense2 = new Expense();
            expense2.setCategory("Maintenance");
            expense2.setAmount(300.0);
            expense2.setDescription("Equipment repair");
            expense2.setDate(LocalDate.now());
            expenseRepository.save(expense2);

            // Create a purchase with items
            Purchase purchase = new Purchase();
            purchase.setDate(LocalDate.now().minusDays(7));
            purchase.setSupplierId(savedSupplier1.getId());
            purchase.setTotalAmount(0.0);
            
            PurchaseItem purchaseItem1 = new PurchaseItem();
            purchaseItem1.setStockItemId(savedStock1.getId());
            purchaseItem1.setQuantity(50.0);
            purchaseItem1.setPrice(2.0);
            purchaseItem1.setPurchase(purchase);
            purchase.getItems().add(purchaseItem1);

            PurchaseItem purchaseItem2 = new PurchaseItem();
            purchaseItem2.setStockItemId(savedStock2.getId());
            purchaseItem2.setQuantity(30.0);
            purchaseItem2.setPrice(4.5);
            purchaseItem2.setPurchase(purchase);
            purchase.getItems().add(purchaseItem2);

            purchase.setTotalAmount(50.0 * 2.0 + 30.0 * 4.5);
            
            // Update stock quantities based on purchase
            StockItem updatedStock1 = stockRepository.findById(savedStock1.getId()).get();
            updatedStock1.setQuantity(updatedStock1.getQuantity() + purchaseItem1.getQuantity());
            stockRepository.save(updatedStock1);

            StockItem updatedStock2 = stockRepository.findById(savedStock2.getId()).get();
            updatedStock2.setQuantity(updatedStock2.getQuantity() + purchaseItem2.getQuantity());
            stockRepository.save(updatedStock2);

            purchaseRepository.save(purchase);

            

            // Create usages and update stock quantities
            Usage usage1 = new Usage();
            usage1.setStockItemId(savedStock1.getId());
            usage1.setQuantityUsed(5.0);
            usage1.setDate(LocalDate.now().minusDays(2));
            usageRepository.save(usage1);

            // Update stock quantity for first usage
            stockRepository.findById(savedStock1.getId()).ifPresent(stock -> {
                stock.setQuantity(stock.getQuantity() - usage1.getQuantityUsed());
                stockRepository.save(stock);
            });

            // Create second usage
            Usage usage2 = new Usage();
            usage2.setStockItemId(savedStock2.getId());
            usage2.setQuantityUsed(3.0);
            usage2.setDate(LocalDate.now().minusDays(1));
            usageRepository.save(usage2);

            // Update stock quantity for second usage
            stockRepository.findById(savedStock2.getId()).ifPresent(stock -> {
                stock.setQuantity(stock.getQuantity() - usage2.getQuantityUsed());
                stockRepository.save(stock);
            });
        };
    }

    private void createIfMissing(String username, Role role) {
        userRepository.findByUsername(username).ifPresentOrElse(
                u -> {},
                () -> {
                    User user = new User();
                    user.setUsername(username);
                    user.setPassword(passwordEncoder.encode("password"));
                    user.setRole(role);
                    userRepository.save(user);
                }
        );
    }
}


