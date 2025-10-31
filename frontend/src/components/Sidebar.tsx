import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  LayoutDashboard,
  Boxes,
  Truck,
  ShoppingCart,
  Utensils,
  Wallet,
  BarChart2,
  Users,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const role = localStorage.getItem("role");

  const isActive = (path: string) => location.pathname === path;

  // Define navigation items based on role
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      path: "/stocks",
      label: "Stocks",
      icon: Boxes,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      path: "/suppliers",
      label: "Suppliers",
      icon: Truck,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      path: "/purchases",
      label: "Purchases",
      icon: ShoppingCart,
      roles: ["ADMIN", "MANAGER"],
    },
    { path: "/usage", label: "Usage", icon: Utensils },
    {
      path: "/expenses",
      label: "Expenses",
      icon: Wallet,
      roles: ["ADMIN", "MANAGER"],
    },
    { path: "/reports", label: "Reports", icon: BarChart2 },
    {
      path: "/users",
      label: "Users",
      icon: Users,
      roles: ["ADMIN"],
    },
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true; // Items without roles are accessible to all
    return item.roles.includes(role || "");
  });

  return (
    <div className="bg-white w-64 min-h-screen shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">🍽️GES</h2>
      </div>
      <nav className="p-2">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
