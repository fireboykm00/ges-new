import { useEffect, useState } from "react";
import { purchaseAPI, supplierAPI, stockAPI } from "../services/api";
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
import type { Supplier, StockItem, PurchaseItem, Purchase } from "../types";

// Removed unused Purchase interface (inferred at usage time)

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: 0,
    date: new Date().toISOString().split("T")[0],
    items: [] as PurchaseItem[],
  });
  const [newItem, setNewItem] = useState({
    stockItemId: 0,
    quantity: 0,
    price: 0,
  });

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchStockItems();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await purchaseAPI.getAll();
      setPurchases(response.data);
    } catch (error) {
      toast.error("Failed to fetch purchases");
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await supplierAPI.getAll();
      setSuppliers(response.data);
    } catch (error) {
      toast.error("Failed to fetch suppliers");
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchStockItems = async () => {
    try {
      const response = await stockAPI.getAll();
      setStockItems(response.data);
    } catch (error) {
      toast.error("Failed to fetch stock items");
      console.error("Error fetching stock items:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "supplierId" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]:
        name === "stockItemId" ? parseInt(value) || 0 : parseFloat(value) || 0,
    }));
  };

  const handleAddItem = () => {
    if (newItem.stockItemId && newItem.quantity > 0 && newItem.price > 0) {
      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, { ...newItem }],
      }));
      setNewItem({ stockItemId: 0, quantity: 0, price: 0 });
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const validatePurchase = () => {
    if (!formData.supplierId) {
      toast.error("Please select a supplier");
      return false;
    }

    if (formData.items.length === 0) {
      toast.error("Please add at least one item");
      return false;
    }

    for (const item of formData.items) {
      if (!item.stockItemId) {
        toast.error("Please select a stock item for each entry");
        return false;
      }
      if (item.quantity <= 0) {
        toast.error("Quantity must be greater than 0");
        return false;
      }
      if (item.price <= 0) {
        toast.error("Price must be greater than 0");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePurchase()) {
      return;
    }

    const purchaseData: Purchase = {
      supplierId: formData.supplierId,
      date: formData.date,
      items: formData.items.map((item) => ({
        stockItemId: item.stockItemId,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const response = await purchaseAPI.create(purchaseData);
      console.log("Purchase creation response:", response); // Debug log
      toast.success("Purchase recorded successfully");

      setShowForm(false);
      setFormData({
        supplierId: 0,
        date: new Date().toISOString().split("T")[0],
        items: [],
      });
      fetchPurchases();
      fetchStockItems(); // Refresh stock items to show updated quantities
    } catch (error) {
      console.error("Error recording purchase:", error);
      if (error instanceof Error) {
        toast.error(`Failed to record purchase: ${error.message}`);
      } else {
        toast.error("Failed to record purchase");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this purchase?")) {
      try {
        await purchaseAPI.delete(id);
        toast.success("Purchase deleted successfully");
        fetchPurchases();
        fetchStockItems(); // Refresh stock items to show updated quantities
      } catch (error) {
        toast.error("Failed to delete purchase");
        console.error("Error deleting purchase:", error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      supplierId: 0,
      date: new Date().toISOString().split("T")[0],
      items: [],
    });
  };

  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier ? supplier.name : "Unknown";
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
        <h1 className="text-3xl font-bold">Purchase Management</h1>
        <Button onClick={() => setShowForm(true)}>Record Purchase</Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Record Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="supplierId"
                    className="block text-sm font-medium mb-1"
                  >
                    Supplier
                  </label>
                  <Select
                    value={formData.supplierId.toString()}
                    onValueChange={(value) =>
                      handleSelectChange("supplierId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem
                          key={supplier.id!}
                          value={supplier.id!.toString()}
                        >
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <Select
                    value={newItem.stockItemId.toString()}
                    onValueChange={(value) =>
                      setNewItem({
                        ...newItem,
                        stockItemId: parseInt(value) || 0,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockItems.map((item) => (
                        <SelectItem key={item.id!} value={item.id!.toString()}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Quantity"
                    value={newItem.quantity || ""}
                    name="quantity"
                    onChange={handleItemInputChange}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={newItem.price || ""}
                    name="price"
                    onChange={handleItemInputChange}
                  />
                  <Button type="button" onClick={handleAddItem}>
                    Add
                  </Button>
                </div>

                {formData.items.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {getStockItemName(item.stockItemId)}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            ${(item.quantity * item.price).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="flex space-x-2">
                <Button type="submit">Record Purchase</Button>
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
                <TableHead>Supplier</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.date}</TableCell>
                  <TableCell>{getSupplierName(purchase.supplierId)}</TableCell>
                  <TableCell>
                    ${(purchase.totalAmount ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <ul className="list-disc pl-5">
                      {purchase.items.map(
                        (item: PurchaseItem, index: number) => (
                          <li key={index}>
                            {getStockItemName(item.stockItemId)} -{" "}
                            {item.quantity} @ ${item.price.toFixed(2)}
                          </li>
                        )
                      )}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => purchase.id && handleDelete(purchase.id)}
                    >
                      Delete
                    </Button>
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
