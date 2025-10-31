import { useEffect, useState } from "react";
import { usageAPI, stockAPI } from "../services/api";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { handleAPIError } from "../lib/api-error";
import type { StockItem, UsageRecord } from "../types";

export default function UsagePage() {
  const [usages, setUsages] = useState<UsageRecord[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    stockItemId: 0,
    quantityUsed: 0,
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchUsages();
    fetchStockItems();
  }, []);

  const fetchUsages = async () => {
    try {
      const response = await usageAPI.getAll();
      setUsages(response.data);
    } catch (error) {
      handleAPIError(error, "Failed to fetch usage records");
      console.error("Error fetching usages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockItems = async () => {
    try {
      const response = await stockAPI.getAll();
      setStockItems(response.data);
    } catch (error) {
      handleAPIError(error, "Failed to fetch stock items");
      console.error("Error fetching stock items:", error);
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      stockItemId: parseInt(value) || 0,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const validateForm = () => {
    if (!formData.stockItemId) {
      toast.error("Please select a stock item");
      return false;
    }

    if (formData.quantityUsed <= 0) {
      toast.error("Quantity used must be greater than 0");
      return false;
    }

    const stockItem = stockItems.find(
      (item) => item.id === formData.stockItemId
    );
    if (stockItem && formData.quantityUsed > stockItem.quantity) {
      toast.error(
        `Not enough stock. Available: ${stockItem.quantity}, Requested: ${formData.quantityUsed}`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingId) {
        await usageAPI.update(editingId, formData);
        toast.success("Usage updated successfully");
      } else {
        await usageAPI.create(formData);
        toast.success("Usage recorded successfully");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        stockItemId: 0,
        quantityUsed: 0,
        date: new Date().toISOString().split("T")[0],
      });
      fetchUsages();
      fetchStockItems(); // Refresh stock items to show updated quantities
    } catch (error) {
      handleAPIError(
        error,
        `Failed to ${editingId ? "update" : "record"} usage`
      );
      console.error("Error handling usage:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this usage record?")) {
      try {
        await usageAPI.delete(id);
        toast.success("Usage record deleted successfully");
        fetchUsages();
        fetchStockItems(); // Refresh stock items to show updated quantities
      } catch (error) {
        handleAPIError(error, "Failed to delete usage record");
        console.error("Error deleting usage:", error);
      }
    }
  };

  const handleEdit = (usage: UsageRecord) => {
    setEditingId(usage.id || null);
    setFormData({
      stockItemId: usage.stockItemId,
      quantityUsed: usage.quantityUsed,
      date: usage.date,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      stockItemId: 0,
      quantityUsed: 0,
      date: new Date().toISOString().split("T")[0],
    });
  };

  const getStockItemName = (stockItemId: number) => {
    const stockItem = stockItems.find((s) => s.id === stockItemId);
    return stockItem ? stockItem.name : "Unknown";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Usage Management</h1>
        <Button onClick={() => setShowForm(true)}>Record Usage</Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Usage" : "Record Usage"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="stockItemId"
                    className="block text-sm font-medium mb-1"
                  >
                    Stock Item
                  </label>
                  <Select
                    value={formData.stockItemId.toString()}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockItems.map((item) => (
                        <SelectItem key={item.id!} value={item.id!.toString()}>
                          {item.name} (Available: {item.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="quantityUsed"
                    className="block text-sm font-medium mb-1"
                  >
                    Quantity Used
                  </label>
                  <Input
                    id="quantityUsed"
                    name="quantityUsed"
                    type="number"
                    step="0.01"
                    value={formData.quantityUsed || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium mb-1"
                  >
                    Date
                  </label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Record Usage</Button>
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
                <TableHead>Date</TableHead>
                <TableHead>Stock Item</TableHead>
                <TableHead>Quantity Used</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usages.map((usage) => (
                <TableRow key={usage.id}>
                  <TableCell>{usage.date}</TableCell>
                  <TableCell>{getStockItemName(usage.stockItemId)}</TableCell>
                  <TableCell>{usage.quantityUsed}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(usage)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => usage.id && handleDelete(usage.id)}
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
