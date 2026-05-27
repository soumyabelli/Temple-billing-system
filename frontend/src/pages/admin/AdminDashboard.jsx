import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaDonate, FaRupeeSign, FaUsers, FaBoxes } from "react-icons/fa";
import { MdTempleBuddhist, MdOutlinePayments } from "react-icons/md";
import AdminLayout from "../../layouts/AdminLayout";
import DashboardCards from "../../components/dashboard/DashboardCards";
import RevenueChart from "../../components/dashboard/RevenueChart";
import DonationChart from "../../components/dashboard/DonationChart";
import RecentBookings from "../../components/pooja/RecentBookings";
import LowStock from "../../components/inventory/LowStock";
import LogoutModal from "../../components/LogoutModal";
import { useAuth } from "../../context/AuthContext";
import DevoteesManagement from "./DevoteesManagement";
import DevoteeDetails from "./DevoteeDetails";
import NotificationsCenter from "./NotificationsCenter";
const statCards = [
  { title: "Total Revenue", amount: "Rs 2,45,680", trend: "12.3%", trendUp: true, icon: <FaRupeeSign />, accent: "bg-orange-100 text-orange-600" },
  { title: "Daily Collection", amount: "Rs 48,650", trend: "8.2%", trendUp: true, icon: <FaDonate />, accent: "bg-green-100 text-green-600" },
  { title: "Pooja Bookings", amount: "156", trend: "18%", trendUp: true, icon: <MdTempleBuddhist />, accent: "bg-violet-100 text-violet-600" },
  { title: "Total Donations", amount: "Rs 75,230", trend: "15.4%", trendUp: true, icon: <FaDonate />, accent: "bg-amber-100 text-amber-600" },
  { title: "Prasadam Sales", amount: "Rs 21,430", trend: "7.1%", trendUp: true, icon: <FaBoxes />, accent: "bg-sky-100 text-sky-600" },
  { title: "Pending Payments", amount: "Rs 12,560", trend: "2.2%", trendUp: false, icon: <MdOutlinePayments />, accent: "bg-rose-100 text-rose-600" },
  { title: "Total Devotees", amount: "2,350", trend: "4.3%", trendUp: true, icon: <FaUsers />, accent: "bg-blue-100 text-blue-600" },
  { title: "Low Stock Items", amount: "8", trend: "Requires attention", trendUp: false, icon: <FaBoxes />, accent: "bg-red-100 text-red-600" },
];

const PlaceholderView = ({ title, darkMode }) => (
  <div className={`mt-5 rounded-2xl border p-8 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
    <h2 className={`text-3xl font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>{title}</h2>
    <p className={`mt-2 ${darkMode ? "text-slate-300" : "text-gray-600"}`}>Module layout is ready. Connect forms, APIs, and database operations next.</p>
  </div>
);

const DashboardView = ({ darkMode }) => (
  <>
    <div className="mt-5">
      <h1 className={`text-[30px] md:text-[38px] font-bold leading-tight ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Welcome back, Admin</h1>
      <p className={`${darkMode ? "text-slate-300" : "text-gray-600"}`}>Manage collections, bookings and operations from one dashboard.</p>
    </div>

    <DashboardCards cards={statCards} />

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
      <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
        <h3 className={`text-xl font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Monthly Revenue</h3>
        <RevenueChart />
      </div>
      <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
        <h3 className={`text-xl font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Donation Sources</h3>
        <DonationChart />
      </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
      <div className={`rounded-2xl border p-5 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
        <h3 className={`text-2xl font-bold mb-3 ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Recent Bookings</h3>
        <RecentBookings />
      </div>
      <div className={`rounded-2xl border p-5 ${darkMode ? "bg-[#1f2937] border-[#334155]" : "bg-white border-[#ece8e1]"}`}>
        <h3 className={`text-2xl font-bold mb-3 ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>Low Stock Alerts</h3>
        <LowStock />
      </div>
    </div>
  </>
);

const AdminDashboard = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [selectedDevotee, setSelectedDevotee] = useState(null);
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    setShowLogout(false);
    navigate("/login");
  };

  const handleEditDevotee = (devotee) => {
    setSelectedDevotee(devotee);
  };

  const handleBackToDevotees = () => {
    setSelectedDevotee(null);
  };

  return (
    <>
      <AdminLayout onLogoutClick={() => setShowLogout(true)}>
        {({ activeItem, darkMode }) => {
          if (activeItem === "Dashboard") {
            return <DashboardView darkMode={darkMode} />;
          }

          if (activeItem === "Devotees Management") {
            if (selectedDevotee) {
              return (
                <DevoteeDetails
                  darkMode={darkMode}
                  devotee={selectedDevotee}
                  onBack={handleBackToDevotees}
                />
              );
            }

            return (
              <DevoteesManagement
                darkMode={darkMode}
                onEditProfile={handleEditDevotee}
              />
            );
          }

          if (activeItem === "Notifications") {
            return <NotificationsCenter darkMode={darkMode} />;
          }

          return <PlaceholderView title={activeItem} darkMode={darkMode} />;
        }}
      </AdminLayout>

      {showLogout && (
        <LogoutModal
          onClose={() => setShowLogout(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default AdminDashboard;
