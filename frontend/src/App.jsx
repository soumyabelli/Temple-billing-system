import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/common/ProtectedRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import DonationManagement from "./pages/admin/DonationManagement";
import AllDonations from "./pages/admin/donations/AllDonations";
import AddDonation from "./pages/admin/donations/AddDonation";
import DonationCategories from "./pages/admin/donations/DonationCategories";
import DonorManagement from "./pages/admin/donations/DonorManagement";
import SponsorshipPrograms from "./pages/admin/donations/SponsorshipPrograms";
import CampaignManagement from "./pages/admin/donations/CampaignManagement";
import FestivalDonations from "./pages/admin/donations/FestivalDonations";
import RecurringDonations from "./pages/admin/donations/RecurringDonations";
import DonationReceipts from "./pages/admin/donations/DonationReceipts";
import PaymentVerification from "./pages/admin/donations/PaymentVerification";
import DonationAnalytics from "./pages/admin/donations/DonationAnalytics";
import DonationReports from "./pages/admin/donations/DonationReports";
import QRUPIDonations from "./pages/admin/donations/QRUPIDonations";
import RefundRequests from "./pages/admin/donations/RefundRequests";
import DonorNotifications from "./pages/admin/donations/DonorNotifications";
import DonationSettings from "./pages/admin/donations/DonationSettings";
import MemberManagement from "./pages/admin/MemberManagement";
import AllEmployees from "./pages/admin/employee/AllEmployees";
import AddEmployee from "./pages/admin/employee/AddEmployee";
import Attendances from "./pages/admin/employee/Attendances";
import Payroll from "./pages/admin/employee/Payroll";
import LeaveManagement from "./pages/admin/employee/LeaveManagement";
import Performance from "./pages/admin/employee/Performance";
import ShiftManagement from "./pages/admin/employee/ShiftManagement";
import PoojaManagement from "./pages/admin/PoojaManagement";
import FeedbackManagement from "./pages/admin/FeedbackManagement";
import SettingsManagement from "./pages/admin/SettingsManagement";
import FestivalsEventsManagement from "./pages/admin/FestivalsEventsManagement";
import BillingManagement from "./pages/admin/BillingManagement";
import InventoryManagement from "./pages/admin/InventoryManagement";
import AdminLayout from "./layouts/AdminLayout";

import AccountantDashboard from "./pages/accountant/AccountantDashboard";
import CashierDashboard from "./pages/cashier/CashierDashboard";
import PriestDashboard from "./pages/priest/PriestDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import LeaveHistory from "./pages/staff/LeaveHistory";
import DevoteeDashboard from "./pages/devotee/DevoteeDashboard";
import AssignTask from "./pages/admin/AssignTask";

import LoginPage from "./pages/auth/LoginPage";
import AuthLoginPage from "./pages/auth/AuthLoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LandingPage from "./pages/LandingPage";

import Attendance from "./pages/staff/Attendance";

function App() {
  return (
    <Routes>

      {/* AUTH */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LandingPage />} />
      <Route path="/auth-login" element={<AuthLoginPage />} />
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
      <Route
        path="/admin/devotees"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leave-history"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <LeaveHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assign-task"
        element={
          <ProtectedRoute allowedRoles={["admin", "priest"]}>
            <AssignTask />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/feedback"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <FeedbackManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pooja"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <PoojaManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/billing"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <BillingManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <InventoryManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <SettingsManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <FestivalsEventsManagement />
            </AdminLayout>
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
        path="/admin/donations/all"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AllDonations />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/add"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AddDonation />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/categories"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <DonationCategories />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/donors"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <DonorManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/sponsorships"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <SponsorshipPrograms />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/campaigns"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <CampaignManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/festivals"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <FestivalDonations />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/recurring"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <RecurringDonations />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/receipts"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <DonationReceipts />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/verification"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <PaymentVerification />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/analytics"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <DonationAnalytics />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <DonationReports />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/qr-upi"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <QRUPIDonations />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/refunds"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <RefundRequests />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/notifications"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <DonorNotifications />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/donations/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <DonationSettings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AllEmployees />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees/add"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AddEmployee />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees/attendances"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <Attendances />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees/payroll"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <Payroll />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees/leave"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <LeaveManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees/performance"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <Performance />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees/shifts"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <ShiftManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees/tasks"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AssignTask />
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
      <Route
        path="/staff/attendance"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <Attendance />
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
