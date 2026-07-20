import React, { useState } from "react";
import { getProfitLoss, getMonthlyReport, getAnnualReport } from "../../../services/accountService";

const FinancialReports = () => {
  const [activeTab, setActiveTab] = useState("pnl");

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Financial Reports</h2>
      
      <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-white/20 pb-4">
        <button
          onClick={() => setActiveTab("pnl")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "pnl" ? "bg-amber-500 text-white" : "text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Profit & Loss
        </button>
        <button
          onClick={() => setActiveTab("monthly")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "monthly" ? "bg-amber-500 text-white" : "text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Monthly Report
        </button>
        <button
          onClick={() => setActiveTab("annual")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "annual" ? "bg-amber-500 text-white" : "text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Annual Report
        </button>
      </div>

      <div className="bg-white dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 p-6 rounded-2xl shadow-xl min-h-[400px]">
        {activeTab === "pnl" && (
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Profit & Loss Statement</h3>
            <p className="text-slate-600 dark:text-white/70">Select financial year to generate P&L report (Integration pending)...</p>
          </div>
        )}
        
        {activeTab === "monthly" && (
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Monthly Financial Report</h3>
            <p className="text-slate-600 dark:text-white/70">Select month and year to generate monthly report (Integration pending)...</p>
          </div>
        )}

        {activeTab === "annual" && (
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Annual Financial Report</h3>
            <p className="text-slate-600 dark:text-white/70">Select financial year to generate annual report (Integration pending)...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReports;
