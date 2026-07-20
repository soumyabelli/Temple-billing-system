import React, { useState } from "react";
import { FiDollarSign, FiList, FiClock, FiCheckSquare } from "react-icons/fi";

const CashierAccounts = () => {
  const [activeTab, setActiveTab] = useState("daily-cash-book");

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Cashier Accounts</h2>

      <div className="flex gap-4 mb-6 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab("daily-cash-book")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "daily-cash-book" ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          Daily Cash Book
        </button>
        <button
          onClick={() => setActiveTab("cash-closing")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "cash-closing" ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          Cash Closing
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "transactions" ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          Transaction History
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "pending" ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          Pending Payments
        </button>
      </div>

      <div className="bg-white backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-xl min-h-[400px]">
        {activeTab === "daily-cash-book" && (
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Today's Collection</h3>
            <p className="text-slate-600">Integration with cash book APIs pending...</p>
          </div>
        )}
        
        {activeTab === "cash-closing" && (
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Daily Cash Closing</h3>
            <p className="text-slate-600">Form to submit daily cash closing pending...</p>
          </div>
        )}

        {activeTab === "transactions" && (
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Transaction History</h3>
            <p className="text-slate-600">List of transactions pending...</p>
          </div>
        )}

        {activeTab === "pending" && (
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Pending Payments</h3>
            <p className="text-slate-600">List of pending payments pending...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierAccounts;
