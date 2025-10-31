import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Stocks from "./pages/Stocks";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Usage from "./pages/Usage";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isAuthRoute = ["/login", "/register"].includes(location.pathname);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="*"
          element={<Navigate to="/login" state={{ from: location }} />}
        />
      </Routes>
    );
  }

  // If authenticated user tries to access login/register, redirect to dashboard
  if (isAuthRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          <Routes>
            {/* Default route redirects to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin and Manager only routes */}
            <Route
              path="/stocks"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                  <Stocks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                  <Suppliers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchases"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                  <Purchases />
                </ProtectedRoute>
              }
            />

            {/* General authenticated user routes */}
            <Route path="/usage" element={<Usage />} />

            <Route
              path="/expenses"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route path="/reports" element={<Reports />} />

            {/* Admin only routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Users />
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </Router>
  );
}
