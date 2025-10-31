// Types mirroring backend models and responses

export type Role = "ADMIN" | "MANAGER" | "STAFF";

export interface UserInfo {
  username: string;
  role: Role;
}

export interface StockItem {
  id?: number;
  name: string;
  category: string;
  quantity: number; // backend uses Double -> number
  unitPrice: number; // Double
  reorderLevel: number; // Double
}

export interface Supplier {
  id?: number;
  name: string;
  phone: string;
  email: string;
}

export interface PurchaseItem {
  id?: number;
  stockItemId: number;
  quantity: number;
  price: number;
}

export interface Purchase {
  id?: number;
  supplierId: number;
  date: string; // LocalDate as YYYY-MM-DD
  totalAmount?: number;
  items: PurchaseItem[];
}

export interface UsageRecord {
  id?: number;
  stockItemId: number;
  quantityUsed: number;
  date: string; // LocalDate as YYYY-MM-DD
}

export interface Expense {
  id?: number;
  category: string;
  amount: number;
  date?: string; // LocalDate
  description: string;
}

export interface MonthlyReport {
  month: string; // YYYY-MM
  purchases: number;
  expenses: number;
  lowStock: number;
  usageCount: number;
}

