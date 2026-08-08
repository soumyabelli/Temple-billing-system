import React from "react";
import { FaFire, FaBoxes, FaBookOpen } from "react-icons/fa";

const KitchenDashboard = () => {
  return (
    <div className="p-4 md:p-8 bg-[#faf9f7] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1d1b19]">Kitchen Production</h1>
        <p className="text-sm text-[#5c6675]">Manage recipes and log daily Prasadam production.</p>
        <div className="mt-2 h-1 w-12 rounded-full bg-[#ff8b00]" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-temple-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#ff8b00]">
              <FaFire size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Today's Production</p>
              <h3 className="text-2xl font-bold text-slate-800">1,250 <span className="text-sm font-normal">units</span></h3>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-temple-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FaBoxes size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Requests</p>
              <h3 className="text-2xl font-bold text-slate-800">3</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-temple-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FaBookOpen size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Recipes</p>
              <h3 className="text-2xl font-bold text-slate-800">12</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-temple-100 p-6 shadow-sm flex flex-col min-h-[300px]">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Log New Production</h3>
        <div className="flex-1 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
           [ Recipe Selection and Production Entry Form Here ]
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;
