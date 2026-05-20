import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AccountantDashboard from "./pages/accountant/AccountantDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CashierDashboard from "./pages/cashier/CashierDashboard";
import DevoteeDashboard from "./pages/devotee/DevoteeDashboard";
import LoginPage from "./pages/auth/LoginPage";
import PriestDashboard from "./pages/priest/PriestDashboard";
import RegisterPage from "./pages/auth/RegisterPage";
import StaffDashboard from "./pages/staff/StaffDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

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
