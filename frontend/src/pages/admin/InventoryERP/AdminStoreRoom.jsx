import React, { useState } from "react";

const AdminStoreRoom = () => {
  const [activeTab, setActiveTab] = useState("Current Stock");

  const tabs = ["Current Stock","Low Stock","Reserved Stock","Issued","Damaged","Expired","Write-Off","History"];

  return (
    <div className="p-4 md:p-8 bg-[#faf9f7] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1d1b19]">Store Room</h1>
        <p className="text-sm text-[#5c6675]">Manage current stock and inventory status.</p>
        <div className="mt-2 h-1 w-12 rounded-full bg-[#ff8b00]" />
      </div>
      
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "bg-temple-100 text-[#ff8b00] border-t border-l border-r border-slate-200 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-temple-100 p-6 shadow-sm flex items-center justify-center min-h-[400px] text-slate-500">
        {activeTab} UI goes here.
      </div>
    </div>
  );
};

export default AdminStoreRoom;
