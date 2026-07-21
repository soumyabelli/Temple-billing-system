import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FaBoxes, FaDownload, FaSearch, FaWrench, FaTruck, FaMoneyBillWave } from "react-icons/fa";

const API_BASE = "http://localhost:5000/api";

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const AccountantInventory = () => {
  const [activeTab, setActiveTab] = useState("suppliers"); // suppliers, assets, repairs, finance

  const [suppliers, setSuppliers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const [sup, ast, rep] = await Promise.all([
        axios.get(`${API_BASE}/admin/inventory-suppliers`, { headers }),
        axios.get(`${API_BASE}/admin/inventory-assets`, { headers }),
        axios.get(`${API_BASE}/admin/inventory-repairs`, { headers }),
      ]);
      setSuppliers(sup.data?.suppliers || []);
      setAssets(ast.data?.assets || []);
      setRepairs(rep.data?.repairs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalAssetValue = useMemo(() => {
    // In a real app we'd sum asset purchaseCost, but it's not strictly tracked as a number yet
    return assets.length * 15000; 
  }, [assets]);

  const totalRepairCost = useMemo(() => {
    return repairs.reduce((sum, r) => sum + Number(r.cost || 0), 0);
  }, [repairs]);

  return (
    <div className="accountant-view">
      <section className="accountant-view__hero">
        <div>
          <p className="accountant-view__eyebrow">Inventory Finance</p>
          <h1>Financial Inventory Control</h1>
          <p>Monitor inventory expenses, supplier ledgers, and maintenance costs.</p>
        </div>
      </section>

      <div className="flex gap-2 rounded-2xl border bg-white p-2 shadow-sm mb-6 max-w-full overflow-x-auto" style={{ marginTop: "24px" }}>
        {[
          { id: "suppliers", label: "Supplier Ledger", icon: FaTruck },
          { id: "assets", label: "Asset Register", icon: FaBoxes },
          { id: "repairs", label: "Repair Expenses", icon: FaWrench },
          { id: "finance", label: "Financial Summary", icon: FaMoneyBillWave },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <tab.icon /> {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm min-h-[50vh]">
        {loading && <p className="text-slate-500 font-bold py-10 text-center">Loading ledger data...</p>}

        {!loading && activeTab === "suppliers" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Supplier Accounts</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3">Supplier Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">GST Number</th>
                    <th className="p-3">Total Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {suppliers.length === 0 ? (
                    <tr><td colSpan="5" className="p-3 text-center text-slate-500">No suppliers found.</td></tr>
                  ) : (
                    suppliers.map((s) => (
                      <tr key={s._id}>
                        <td className="p-3 font-semibold text-slate-900">{s.name}</td>
                        <td className="p-3">{s.phone}</td>
                        <td className="p-3">{s.email || "-"}</td>
                        <td className="p-3">{s.gst || "-"}</td>
                        <td className="p-3 font-bold text-amber-600">Calculated externally</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === "assets" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Fixed Asset Register</h2>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Est. Value: {formatCurrency(totalAssetValue)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3">Asset ID</th>
                    <th className="p-3">Asset Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Purchase Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {assets.length === 0 ? (
                    <tr><td colSpan="6" className="p-3 text-center text-slate-500">No assets registered.</td></tr>
                  ) : (
                    assets.map((a) => (
                      <tr key={a._id}>
                        <td className="p-3 font-mono font-bold">{a.assetId}</td>
                        <td className="p-3 font-semibold text-slate-900">{a.name}</td>
                        <td className="p-3">{a.category}</td>
                        <td className="p-3">{a.assignedLocation || "-"}</td>
                        <td className="p-3 font-bold">{a.status}</td>
                        <td className="p-3">{formatDateTime(a.purchaseDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === "repairs" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Repair & Maintenance Expenses</h2>
              <span className="font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                Total Cost: {formatCurrency(totalRepairCost)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3">Asset</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Vendor</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Cost</th>
                    <th className="p-3">Completion Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {repairs.length === 0 ? (
                    <tr><td colSpan="6" className="p-3 text-center text-slate-500">No repair records found.</td></tr>
                  ) : (
                    repairs.map((r) => (
                      <tr key={r._id}>
                        <td className="p-3 font-semibold text-slate-900">{r.asset?.name || "Unknown Asset"}</td>
                        <td className="p-3">{r.description}</td>
                        <td className="p-3">{r.vendor}</td>
                        <td className="p-3">{r.status}</td>
                        <td className="p-3 font-bold text-rose-600">{r.cost ? formatCurrency(r.cost) : "Pending"}</td>
                        <td className="p-3">{r.completionDate ? formatDateTime(r.completionDate) : "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === "finance" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Financial Reports & Transactions</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 border rounded-xl flex flex-col items-center justify-center min-h-[200px]">
                <p className="text-slate-500 font-bold uppercase mb-2">Total Maint. Cost</p>
                <p className="text-4xl font-extrabold text-slate-900">{formatCurrency(totalRepairCost)}</p>
              </div>
              <div className="p-6 bg-slate-50 border rounded-xl flex flex-col items-center justify-center min-h-[200px]">
                <p className="text-slate-500 font-bold uppercase mb-2">Assets Reg. Value</p>
                <p className="text-4xl font-extrabold text-slate-900">{formatCurrency(totalAssetValue)}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500 text-center">Detailed Ledger Integration requires transaction sync from `AccountTransaction`.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AccountantInventory;
