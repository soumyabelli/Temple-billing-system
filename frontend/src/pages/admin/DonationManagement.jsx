import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getDonationTypes } from "../../services/donationTypeService";
import DonationStats from "../../components/dashboard/donation/DonationStats";
import DonationCharts from "../../components/dashboard/donation/DonationCharts";
import DonationFilters from "../../components/dashboard/donation/DonationFilters";
import DonationTable from "../../components/dashboard/donation/DonationTable";
import RecentDonations from "../../components/dashboard/donation/RecentDonations";
import TopDonors from "../../components/dashboard/donation/TopDonors";

const DonationManagement = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [stats, setStats] = useState({});
  const [categories, setCategories] = useState(getDonationTypes());

  const loadCategories = (donationList) => {
    const donationCategories = Array.from(
      new Set(donationList.map((donation) => donation.category).filter(Boolean))
    );
    setCategories(Array.from(new Set([...getDonationTypes(), ...donationCategories])));
  };

  const fetchDonations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/donations");
      const donations = Array.isArray(res.data?.donations) ? res.data.donations : [];
      setDonations(donations);
      setFilteredDonations(donations);
      loadCategories(donations);
    } catch (error) {
      console.error("Unable to load donations:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/donations/stats");
      setStats(res.data?.stats || {});
    } catch (error) {
      console.error("Unable to load donation stats:", error);
    }
  };

  useEffect(() => {
    fetchDonations();
    fetchStats();
  }, []);

  const handleApplyFilters = ({ searchTerm, category, status }) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const nextFiltered = donations.filter((donation) => {
      const textFields = [donation.donorName, donation.category, donation.status, donation.transactionId, donation._id];
      const matchesSearch =
        !normalizedSearch ||
        textFields.filter(Boolean).some((field) => field.toString().toLowerCase().includes(normalizedSearch));

      const matchesCategory = category === "All Donation Types" || donation.category === category;
      const matchesStatus = status === "All Statuses" || donation.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    setFilteredDonations(nextFiltered);
  };

  return (
    <div className="space-y-6 mt-5">
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-[#2f0f4f] via-[#5e2d97] to-[#c78918] p-8 text-white shadow-2xl shadow-violet-900/25">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),transparent_34%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.32em] text-amber-200/80">Donation Command Center</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Admin Donation Overview</h1>
            <p className="mt-4 text-slate-200/85 text-lg">
              High-level donation intelligence for administrators: reports, category performance, donor health,
              verification workflows and donation-type governance.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => navigate("/admin/donations/reports")}
              className="rounded-3xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              View Reports
            </button>
            <button
              onClick={() => navigate("/admin/donations/verification")}
              className="rounded-3xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
            >
              Open Verification
            </button>
          </div>
        </div>
      </div>

      <DonationStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
        <DonationCharts donations={filteredDonations} />

        <div className="grid gap-6">
          <DonationFilters categories={categories} onApplyFilters={handleApplyFilters} />

          <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl text-white">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Donation Types</p>
            <h2 className="mt-3 text-2xl font-semibold">Manage donation categories</h2>
            <p className="mt-3 text-slate-300">
              Admin-defined donation types are stored centrally and reflected across Add Donation, filters, reports and tables.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/admin/donations/settings")}
                className="rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Manage Donation Types
              </button>
              <span className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                {categories.length} donation types available
              </span>
            </div>
          </div>
        </div>
      </div>

      <DonationTable donations={filteredDonations} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentDonations donations={filteredDonations} />
        <TopDonors donations={filteredDonations} />
      </div>
    </div>
  );
};

export default DonationManagement;
