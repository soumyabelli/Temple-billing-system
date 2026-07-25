import React, { useState, useEffect } from "react";
import { getTransactions } from "../../../services/accountService";
import { toast } from "react-toastify";
import { FaSearch, FaFilter } from "react-icons/fa";

const AccountLedgersView = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    transactionType: "",
    source: "",
  });

  const loadLedgers = async () => {
    setLoading(true);
    try {
      const data = await getTransactions(filters);
      setTransactions(data);
    } catch (error) {
      toast.error("Failed to load ledgers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedgers();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="accountant-view">
      <section className="accountant-view__hero">
        <div>
          <h1>Account Ledgers</h1>
          <p>Complete ledger of all credits, debits, and manual entries across the temple ERP.</p>
        </div>
      </section>

      <div className="accountant-toolbar mt-6">
        <label className="accountant-field">
          <span style={{ fontSize: "0.75rem", color: "#64748b", position: "absolute", top: "-18px", left: "4px", fontWeight: "600" }}>From</span>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
        </label>
        <label className="accountant-field">
          <span style={{ fontSize: "0.75rem", color: "#64748b", position: "absolute", top: "-18px", left: "4px", fontWeight: "600" }}>To</span>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
        </label>
        <label className="accountant-field">
          <span style={{ fontSize: "0.75rem", color: "#64748b", position: "absolute", top: "-18px", left: "4px", fontWeight: "600" }}>Type</span>
          <select name="transactionType" value={filters.transactionType} onChange={handleFilterChange}>
            <option value="">All Types</option>
            <option value="Credit">Credit (Income)</option>
            <option value="Debit">Debit (Expense)</option>
          </select>
        </label>
        <label className="accountant-field">
          <span style={{ fontSize: "0.75rem", color: "#64748b", position: "absolute", top: "-18px", left: "4px", fontWeight: "600" }}>Module</span>
          <select name="source" value={filters.source} onChange={handleFilterChange}>
            <option value="">All Modules</option>
            <option value="Donation">Donation</option>
            <option value="Pooja Booking">Pooja Booking</option>
            <option value="Prasadam">Prasadam Sales</option>
            <option value="Inventory">Inventory</option>
            <option value="Repair">Repair</option>
            <option value="Room Booking">Room Booking</option>
            <option value="Payroll">Payroll</option>
            <option value="Manual Entry">Manual Entry</option>
          </select>
        </label>
      </div>

      <section className="accountant-panel mt-6">
        <div className="accountant-panel__header">
          <h3 className="accountant-panel__title">General Ledger</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">Loading ledger...</div>
        ) : (
          <div className="accountant-tableWrap mt-4">
            <table className="accountant-table accountant-table--wide">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference / ID</th>
                  <th>Description</th>
                  <th>Source / Category</th>
                  <th>Payment Mode</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">No transactions found.</td>
                  </tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t._id}>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                      <td className="font-semibold text-slate-700 text-xs">{t.referenceId || "N/A"}</td>
                      <td>{t.description}</td>
                      <td>
                        <p className="font-bold text-slate-800">{t.source}</p>
                        <p className="text-xs text-slate-500">{t.category}</p>
                      </td>
                      <td>{t.paymentMethod}</td>
                      <td>
                        <span className={`px-2 py-1 text-xs rounded-full ${t.transactionType === 'Credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {t.transactionType}
                        </span>
                      </td>
                      <td className="font-bold">Rs {t.amount?.toLocaleString("en-IN")}</td>
                      <td>
                        <span className={`px-2 py-1 text-xs rounded-full ${t.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AccountLedgersView;
