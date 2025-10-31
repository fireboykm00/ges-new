import { useEffect, useState } from "react";
import { expenseAPI } from "../services/api";
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
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import type { Expense } from "../types";

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<Expense>({
    category: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAll();
      setExpenses(response.data);
    } catch (error) {
      toast.error("Failed to fetch expenses");
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "category" || name === "description"
          ? value
          : parseFloat(value) || 0,
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.category.trim()) {
      errors.push("Category is required");
    }

    if (!formData.description.trim()) {
      errors.push("Description is required");
    }

    if (formData.amount <= 0) {
      errors.push("Amount must be greater than 0");
    }

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
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
      if (editingExpense) {
        // Update existing expense
        await expenseAPI.update(editingExpense.id!, formData);
        toast.success("Expense updated successfully");
      } else {
        // Create new expense
        const response = await expenseAPI.create(formData);
        console.log("Expense creation response:", response); // Debug log
        toast.success("Expense recorded successfully");
      }

      setShowForm(false);
      setEditingExpense(null);
      setFormData({
        category: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
      fetchExpenses();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to save expense: ${error.message}`);
      } else {
        toast.error("Failed to save expense");
      }
      console.error("Error saving expense:", error);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({ ...expense });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await expenseAPI.delete(id);
        toast.success("Expense deleted successfully");
        fetchExpenses();
      } catch (error) {
        toast.error("Failed to delete expense");
        console.error("Error deleting expense:", error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
    setFormData({
      category: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
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
        <h1 className="text-3xl font-bold">Expense Management</h1>
        <Button onClick={() => setShowForm(true)}>Record Expense</Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingExpense ? "Edit Expense" : "Record Expense"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  />
                </div>
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium mb-1"
                  >
                    Amount
                  </label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
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
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingExpense ? "Update" : "Record"}
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
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(expense)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => expense.id && handleDelete(expense.id)}
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
