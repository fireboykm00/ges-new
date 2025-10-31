Excellent 👌 — you want a **fast, clean, 1-hour MVP** that still covers **every key feature** in the original full project report (stock, purchases, suppliers, usage, expenses, reports, auth, roles) — but **without over-engineering** (no extra abstraction, no unnecessary services, no complex UI frameworks).

Here’s your **final, production-ready MVP build plan** — complete, minimal, and structured for a clean code-generation flow.

---

# ⚡ GES Restaurant Stock Management System — Simple MVP Plan (Spring Boot + Vite React)

**Goal:**
Build a minimal yet complete system with:

- Stock, Supplier, Purchase, Usage, Expense modules
- Monthly Report
- Authentication (JWT)
- Role-based Access (Admin, Manager, Staff)

All CRUD features work; auto-updates to stock after purchase or usage; MySQL persistence; responsive Vite + React frontend.

---

## 🧱 Tech Stack

| Layer          | Tech                                      |
| -------------- | ----------------------------------------- |
| **Frontend**   | Vite + React + TypeScript + TailwindCSS   |
| **Frontend**   | Vite + React + TypeScript + TailwindCSS (use pnpm; see rules below)   |
| **Backend**    | Spring Boot 3.x + Spring Data JPA + MySQL |
| **Auth**       | Spring Security + JWT                     |
| **Build Tool** | Maven                                     |
| **Database**   | MySQL (local or Docker)                   |


## ⚙️ Backend — Project Structure

```
ges-backend/
 └── src/main/java/com/ges/
     ├── GesApplication.java
     ├── model/
     │    ├── User.java
     │    ├── Role.java
     │    ├── StockItem.java
     │    ├── Supplier.java
     │    ├── Purchase.java
     │    ├── PurchaseItem.java
     │    ├── Usage.java
     │    └── Expense.java
     ├── repository/
     │    ├── UserRepository.java
     │    ├── StockRepository.java
     │    ├── SupplierRepository.java
     │    ├── PurchaseRepository.java
     │    ├── UsageRepository.java
     │    └── ExpenseRepository.java
     ├── controller/
     │    ├── AuthController.java
     │    ├── StockController.java
     │    ├── SupplierController.java
     │    ├── PurchaseController.java
     │    ├── UsageController.java
     │    ├── ExpenseController.java
     │    └── ReportController.java
     ├── config/
     │    ├── SecurityConfig.java
     │    └── JwtFilter.java
     └── service/
          └── JwtService.java
```

### Frontend package & component rules

Use the following minimal rules for the frontend so the team is consistent and the repo is ready for shadcn UI components:

- Package manager: use pnpm for the frontend project (`ges-frontend`). This ensures a fast, deterministic install and small lockfiles. Example init:

  pnpm create vite@latest ges-frontend -- --template react-ts

- Install and run dev with pnpm:

  cd ges-frontend
  pnpm install
  pnpm dev

- TailwindCSS setup (Vite + pnpm):

  pnpm add -D tailwindcss postcss autoprefixer
  pnpm dlx tailwindcss init -p

  // set `content` in tailwind.config.{js,ts} to include `./index.html`, `./src/**/*.{ts,tsx}`

- shadcn (shadcn/ui) rules and setup:

  - shadcn requires Tailwind. Use the shadcn CLI to scaffold components into `src/components/ui`.
  - Use pnpm dlx to run the shadcn CLI without globally installing it:

    cd ges-frontend
    pnpm dlx shadcn-ui@latest init

  - When adding components, keep them inside `src/components/ui/` and import from there. Commit the generated files (they are UI source files, not build artifacts).

- Recommended folder for shadcn components:

  src/components/ui/  (atoms, buttons, inputs, dialogs exported as separate files)

- Scripts and conventions:

  - Use `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm preview` as standard commands.
  - Add lint/test scripts if you introduce them, prefer pnpm-run to keep commands consistent.

These rules keep the frontend lightweight, reproducible, and ready for shadcn UI components while matching the rest of the MVP plan.


---

## 🧩 Database Entities (Simplified)

### `User`

```java
id, username, password, Role role
```

### `StockItem`

```java
id, name, category, quantity, unitPrice, reorderLevel
```

### `Supplier`

```java
id, name, phone, email
```

### `Purchase`

```java
id, supplierId, date, totalAmount
```

### `PurchaseItem`

```java
id, purchaseId, stockItemId, quantity, price
```

### `Usage`

```java
id, stockItemId, quantityUsed, date
```

### `Expense`

```java
id, category, amount, date, description
```

---

## 🔐 Authentication & RBAC

- `/auth/register` → Register new user (default STAFF)
- `/auth/login` → Login (returns JWT + role)
- Roles: `ADMIN`, `MANAGER`, `STAFF`

Controller example:

```java
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
@PostMapping("/stocks")
public StockItem addStock(@RequestBody StockItem s) { ... }

@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/stocks/{id}")
public void deleteStock(@PathVariable Long id) { ... }
```

---

## 📦 Core Modules & Features

| Module       | Features                                                    | Access         |
| ------------ | ----------------------------------------------------------- | -------------- |
| **Stock**    | CRUD, low-stock indicator                                   | Admin, Manager |
| **Supplier** | CRUD supplier info                                          | Admin, Manager |
| **Purchase** | Record purchase + auto increment stock                      | Admin, Manager |
| **Usage**    | Record usage + auto decrement stock                         | All roles      |
| **Expense**  | CRUD expenses                                               | Admin, Manager |
| **Reports**  | Monthly totals: purchases, expenses, usage, low-stock count | All roles      |
| **Auth**     | Login/Register + JWT + Roles                                | All users      |

---

### 💡 Auto Stock Updates (Minimal Logic)

```java
@Transactional
public Purchase addPurchase(Purchase purchase) {
  for (PurchaseItem item : purchase.getItems()) {
      StockItem s = stockRepo.findById(item.getStockItemId()).orElseThrow();
      s.setQuantity(s.getQuantity() + item.getQuantity());
      stockRepo.save(s);
  }
  return purchaseRepo.save(purchase);
}

@Transactional
public Usage addUsage(Usage usage) {
  StockItem s = stockRepo.findById(usage.getStockItemId()).orElseThrow();
  s.setQuantity(s.getQuantity() - usage.getQuantityUsed());
  stockRepo.save(s);
  return usageRepo.save(usage);
}
```

---

### 📊 Monthly Report Endpoint

```java
@GetMapping("/reports/monthly")
public Map<String, Object> monthlyReport(@RequestParam String month) {
    LocalDate start = LocalDate.parse(month + "-01");
    LocalDate end = start.plusMonths(1);

    double purchases = purchaseRepo.findByDateBetween(start, end)
        .stream().mapToDouble(Purchase::getTotalAmount).sum();
    double expenses = expenseRepo.findByDateBetween(start, end)
        .stream().mapToDouble(Expense::getAmount).sum();
    long lowStock = stockRepo.findAll().stream()
        .filter(s -> s.getQuantity() <= s.getReorderLevel()).count();

    return Map.of("month", month, "purchases", purchases, "expenses", expenses, "lowStock", lowStock);
}
```

---

## 🖥️ Frontend — Project Structure

```
ges-frontend/
 ├── src/
 │   ├── App.tsx
 │   ├── pages/
 │   │   ├── Login.tsx
 │   │   ├── Dashboard.tsx
 │   │   ├── Stocks.tsx
 │   │   ├── Suppliers.tsx
 │   │   ├── Purchases.tsx
 │   │   ├── Usage.tsx
 │   │   ├── Expenses.tsx
 │   │   └── Reports.tsx
 │   ├── components/
 │   │   ├── Navbar.tsx
 │   │   ├── Sidebar.tsx
 │   │   └── Table.tsx
 │   └── services/api.ts
 └── index.css
```

---

## 🔌 API Integration (Axios)

```ts
// src/services/api.ts
import axios from "axios";
export const api = axios.create({ baseURL: "http://localhost:8080/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 💻 Pages Summary

| Page          | Features                               |
| ------------- | -------------------------------------- |
| **Login**     | POST /auth/login, save token + role    |
| **Dashboard** | Fetch /reports/monthly, display totals |
| **Stocks**    | Table CRUD                             |
| **Suppliers** | CRUD suppliers                         |
| **Purchases** | Add purchase + supplier select         |
| **Usage**     | Record usage                           |
| **Expenses**  | CRUD expenses                          |
| **Reports**   | Monthly summary cards                  |

---

## 🧠 Role Logic (Frontend)

Simple check:

```tsx
const role = localStorage.getItem("role");
if (role !== "ADMIN" && role !== "MANAGER") hideAddButtons();
```

Route protection:

```tsx
<Route
  path="/stocks"
  element={
    <ProtectedRoute allowed={["ADMIN", "MANAGER"]}>
      <Stocks />
    </ProtectedRoute>
  }
/>
```

---

## 🧩 Quick MVP Build Timeline

| Task                                        | Duration           |
| ------------------------------------------- | ------------------ |
| Backend entities + CRUD controllers         | 20 min             |
| JWT + RBAC config                           | 10 min             |
| Frontend setup + Login + Dashboard          | 15 min             |
| CRUD tables + forms (stocks/suppliers/etc.) | 15 min             |
| **Total**                                   | **~60 minutes** ✅ |

---

## 🚀 Run Commands

**Backend:**

```bash
cd ges-backend
mvn spring-boot:run
```

**Frontend:**

```bash
cd ges-frontend
npm run dev
```

**Access:** [http://localhost:5173](http://localhost:5173)
**API:** [http://localhost:8080/api](http://localhost:8080/api)

---

## ✅ Deliverables (MVP Output)

- Functional login & JWT
- Dashboard summary (reports)
- CRUD for Stock, Supplier, Purchase, Usage, Expense
- Auto stock updates
- Role-based UI + API restrictions
- MySQL persistent DB
- Simple, clean code, one-hour build ready

