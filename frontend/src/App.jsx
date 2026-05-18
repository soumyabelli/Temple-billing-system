import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";

import AdminDashboard from "./pages/AdminDashboard";
import AccountantDashboard from "./pages/AccountantDashboard";
import CashierDashboard from "./pages/CashierDashboard";
import PriestDashboard from "./pages/PriestDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import DevoteeDashboard from "./pages/DevoteeDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/accountant" element={<AccountantDashboard />} />
      <Route path="/cashier" element={<CashierDashboard />} />
      <Route path="/priest" element={<PriestDashboard />} />
      <Route path="/staff" element={<StaffDashboard />} />
      <Route path="/devotee" element={<DevoteeDashboard />} />
    </Routes>
  );
}

export default App;