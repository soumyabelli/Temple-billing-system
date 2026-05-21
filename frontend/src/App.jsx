import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/common/ProtectedRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import DonationManagement from "./pages/admin/DonationManagement";
import MemberManagement from "./pages/admin/MemberManagement";
import AdminLayout from "./layouts/AdminLayout";

import AccountantDashboard from "./pages/accountant/AccountantDashboard";
import CashierDashboard from "./pages/cashier/CashierDashboard";
import PriestDashboard from "./pages/priest/PriestDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import DevoteeDashboard from "./pages/devotee/DevoteeDashboard";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

function App() {
  return (
    <Routes>

      {/* AUTH */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* DONATIONS */}
      <Route
        path="/admin/donations"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <DonationManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/members"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <MemberManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* ACCOUNTANT */}
      <Route
        path="/accountant"
        element={
          <ProtectedRoute allowedRoles={["accountant"]}>
            <AccountantDashboard />
          </ProtectedRoute>
        }
      />

      {/* CASHIER */}
      <Route
        path="/cashier"
        element={
          <ProtectedRoute allowedRoles={["cashier"]}>
            <CashierDashboard />
          </ProtectedRoute>
        }
      />

      {/* PRIEST */}
      <Route
        path="/priest"
        element={
          <ProtectedRoute allowedRoles={["priest"]}>
            <PriestDashboard />
          </ProtectedRoute>
        }
      />

      {/* STAFF */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />

      {/* DEVOTEE */}
      <Route
        path="/devotee"
        element={
          <ProtectedRoute allowedRoles={["devotee"]}>
            <DevoteeDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;