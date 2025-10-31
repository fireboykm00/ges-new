import { useEffect, useState } from "react";
import { stockAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { toast } from "sonner";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { handleAPIError } from "../lib/api-error";
import { z } from "zod";
import type { StockItem } from "../types";

const stockItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category is too long"),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  unitPrice: z.number().positive("Unit price must be greater than 0"),
  reorderLevel: z.number().min(0, "Reorder level must be 0 or greater"),
});

export default function Stocks() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<StockItem>({
    name: "",
    category: "",
    quantity: 0,
    unitPrice: 0,
    reorderLevel: 0,
  });

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await stockAPI.getAll();
      setStocks(response.data);
    } catch (error) {
      handleAPIError(error, "Failed to fetch stocks");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "name" || name === "category" ? value : parseFloat(value) || 0,
    }));
  };

  const validateForm = () => {
    try {
      stockItemSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0];
          if (typeof field === "string") {
            newErrors[field] = issue.message;
          }
        });
        setFormErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingStock) {
        await stockAPI.update(editingStock.id!, formData);
        toast.success("Stock updated successfully");
      } else {
        await stockAPI.create(formData);
        toast.success("Stock created successfully");
      }

      setShowForm(false);
      resetForm();
      fetchStocks();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to save stock");
      } else {
        toast.error("Failed to save stock");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: 0,
      unitPrice: 0,
      reorderLevel: 0,
    });
    setFormErrors({});
    setEditingStock(null);
  };

  const handleEdit = (stock: StockItem) => {
    setEditingStock(stock);
    setFormData({ ...stock });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this stock item?")) {
      try {
        await stockAPI.delete(id);
        toast.success("Stock deleted successfully");
        fetchStocks();
      } catch (error) {
        toast.error("Failed to delete stock");
        console.error("Error deleting stock:", error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStock(null);
    setFormData({
      name: "",
      category: "",
      quantity: 0,
      unitPrice: 0,
      reorderLevel: 0,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <Button onClick={() => setShowForm(true)}>Add Stock</Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingStock ? "Edit Stock" : "Add Stock"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1"
                  >
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={formErrors.name ? "border-red-500" : ""}
                    aria-invalid={!!formErrors.name}
                    aria-describedby={
                      formErrors.name ? "name-error" : undefined
                    }
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1" id="name-error">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium mb-1"
                  >
                    Category
                  </label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className={formErrors.category ? "border-red-500" : ""}
                    aria-invalid={!!formErrors.category}
                    aria-describedby={
                      formErrors.category ? "category-error" : undefined
                    }
                  />
                  {formErrors.category && (
                    <p
                      className="text-red-500 text-sm mt-1"
                      id="category-error"
                    >
                      {formErrors.category}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium mb-1"
                  >
                    Quantity
                  </label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    className={formErrors.quantity ? "border-red-500" : ""}
                    aria-invalid={!!formErrors.quantity}
                    aria-describedby={
                      formErrors.quantity ? "quantity-error" : undefined
                    }
                  />
                  {formErrors.quantity && (
                    <p
                      className="text-red-500 text-sm mt-1"
                      id="quantity-error"
                    >
                      {formErrors.quantity}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="unitPrice"
                    className="block text-sm font-medium mb-1"
                  >
                    Unit Price
                  </label>
                  <Input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    required
                    className={formErrors.unitPrice ? "border-red-500" : ""}
                    aria-invalid={!!formErrors.unitPrice}
                    aria-describedby={
                      formErrors.unitPrice ? "unitPrice-error" : undefined
                    }
                  />
                  {formErrors.unitPrice && (
                    <p
                      className="text-red-500 text-sm mt-1"
                      id="unitPrice-error"
                    >
                      {formErrors.unitPrice}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="reorderLevel"
                    className="block text-sm font-medium mb-1"
                  >
                    Reorder Level
                  </label>
                  <Input
                    id="reorderLevel"
                    name="reorderLevel"
                    type="number"
                    step="0.01"
                    value={formData.reorderLevel}
                    onChange={handleInputChange}
                    required
                    className={formErrors.reorderLevel ? "border-red-500" : ""}
                    aria-invalid={!!formErrors.reorderLevel}
                    aria-describedby={
                      formErrors.reorderLevel ? "reorderLevel-error" : undefined
                    }
                  />
                  {formErrors.reorderLevel && (
                    <p
                      className="text-red-500 text-sm mt-1"
                      id="reorderLevel-error"
                    >
                      {formErrors.reorderLevel}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingStock ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell>{stock.category}</TableCell>
                  <TableCell>
                    <span
                      className={
                        stock.quantity <= stock.reorderLevel
                          ? "text-red-500 font-bold"
                          : ""
                      }
                    >
                      {stock.quantity}
                    </span>
                  </TableCell>
                  <TableCell>${stock.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>{stock.reorderLevel}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(stock)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => stock.id && handleDelete(stock.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
