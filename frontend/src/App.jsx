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
import ReportsAnalytics from "./pages/admin/ReportsAnalytics";
import MemberManagement from "./pages/admin/MemberManagement";
import AllEmployees from "./pages/admin/employee/AllEmployees";
import AddEmployee from "./pages/admin/employee/AddEmployee";
import Attendances from "./pages/admin/employee/Attendances";
import Payroll from "./pages/admin/employee/Payroll";
import LeaveManagement from "./pages/admin/employee/LeaveManagement";
import Performance from "./pages/admin/employee/Performance";
import ShiftManagement from "./pages/admin/employee/ShiftManagement";
import AttendanceSettings from "./pages/admin/employee/AttendanceSettings";
import PoojaManagement from "./pages/admin/PoojaManagement";
import AllBookings from "./pages/admin/AllBookings";
import FeedbackManagement from "./pages/admin/FeedbackManagement";
import SettingsManagement from "./pages/admin/SettingsManagement";
import FestivalsEventsManagement from "./pages/admin/FestivalsEventsManagement";
import BillingManagement from "./pages/admin/BillingManagement";
import InventoryManagement from "./pages/admin/InventoryManagement";
import PrasadaBooked from "./pages/admin/PrasadaBooked";
import NotificationsCenter from "./pages/admin/NotificationsCenter";
import AdminLayout from "./layouts/AdminLayout";

import CashierLayout from "./layouts/CashierLayout";

import AccountantDashboard from "./pages/accountant/AccountantDashboard";
import CashierDashboardPage from "./pages/cashier/CashierDashboardPage";
import BillingPage from "./pages/cashier/BillingPage";
import PoojaBookingsPage from "./pages/cashier/PoojaBookingsPage";
import DonationsPage from "./pages/cashier/DonationsPage";
import PrasadamPage from "./pages/cashier/PrasadamPage";
import ReceiptsPage from "./pages/cashier/ReceiptsPage";
import PaymentsPage from "./pages/cashier/PaymentsPage";
import ReportsPage from "./pages/cashier/ReportsPage";
import InventoryPage from "./pages/cashier/InventoryPage";
import NotificationsPage from "./pages/cashier/NotificationsPage";
import ProfilePage from "./pages/cashier/ProfilePage";
import RegisterDevoteesPage from "./pages/cashier/RegisterDevoteesPage";
import PriestDashboard from "./pages/priest/PriestDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import LeaveHistory from "./pages/staff/LeaveHistory";
import DevoteeDashboard from "./pages/devotee/DevoteeDashboard";

import LoginPage from "./pages/auth/LoginPage";
import AuthLoginPage from "./pages/auth/AuthLoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LandingPage from "./pages/LandingPage";



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
            <Navigate to="/admin/employees/shifts" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <NotificationsCenter />
            </AdminLayout>
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
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <ReportsAnalytics />
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
        path="/admin/pooja/all-bookings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AllBookings />
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
        path="/admin/prasada/booked"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <PrasadaBooked />
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
        path="/admin/employees/settings"
        element={
          <ProtectedRoute
            element={<AdminLayout />}
            allowedRoles={["admin"]}
          >
            <AttendanceSettings />
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
        path="/admin/employees/attendance"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <Attendances />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees/attendances"
        element={<Navigate to="/admin/employees/attendance" replace />}
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
            <Navigate to="/admin/employees/shifts" replace />
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
          <ProtectedRoute allowedRoles={["cashier", "admin"]}>
            <CashierLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CashierDashboardPage />} />
        <Route path="dashboard" element={<CashierDashboardPage />} />
        <Route path="quick-billing" element={<BillingPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="pooja-bookings" element={<PoojaBookingsPage />} />
        <Route path="donations" element={<DonationsPage />} />
        <Route path="prasadam-sales" element={<PrasadamPage />} />
        <Route path="receipts" element={<ReceiptsPage />} />
        <Route path="register-devotees" element={<RegisterDevoteesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* PRIEST */}
      <Route
        path="/priest"
        element={
          <ProtectedRoute allowedRoles={["priest"]}>
            <PriestDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/priest/assigned-poojas"
        element={
          <ProtectedRoute allowedRoles={["priest"]}>
            <PriestDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/priest/seva-schedule"
        element={
          <ProtectedRoute allowedRoles={["priest"]}>
            <PriestDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/priest/completed-services"
        element={
          <ProtectedRoute allowedRoles={["priest"]}>
            <PriestDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/priest/special-duties"
        element={
          <ProtectedRoute allowedRoles={["priest"]}>
            <PriestDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/priest/festival-duties"
        element={
          <ProtectedRoute allowedRoles={["priest"]}>
            <PriestDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/priest/notifications"
        element={
          <ProtectedRoute allowedRoles={["priest"]}>
            <PriestDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/priest/profile"
        element={
          <ProtectedRoute allowedRoles={["priest"]}>
            <PriestDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/priest/settings"
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
