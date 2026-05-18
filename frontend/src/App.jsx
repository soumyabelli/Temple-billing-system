import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import AccountantDashboard from "./pages/AccountantDashboard";
import CashierDashboard from "./pages/CashierDashboard";
import PriestDashboard from "./pages/PriestDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import DevoteeDashboard from "./pages/DevoteeDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accountant"
        element={
          <ProtectedRoute allowedRoles={["accountant"]}>
            <AccountantDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashier"
        element={
          <ProtectedRoute allowedRoles={["cashier"]}>
            <CashierDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/priest"
        element={
          <ProtectedRoute allowedRoles={["priest"]}>
            <PriestDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/devotee"
        element={
          <ProtectedRoute allowedRoles={["devotee"]}>
            <DevoteeDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
