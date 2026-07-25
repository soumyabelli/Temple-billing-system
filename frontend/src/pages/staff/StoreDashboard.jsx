import React from "react";
import { FaBoxes, FaTruckLoading, FaClipboardCheck, FaExclamationTriangle } from "react-icons/fa";

const StoreDashboard = () => {
  return (
    <div className="p-4 md:p-8 bg-[#faf9f7] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1d1b19]">Store Operations</h1>
        <p className="text-sm text-[#5c6675]">Manage goods receiving, issuing, and physical stock.</p>
        <div className="mt-2 h-1 w-12 rounded-full bg-[#ff8b00]" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FaTruckLoading size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Deliveries</p>
              <h3 className="text-2xl font-bold text-slate-800">4</h3>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FaClipboardCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Requests</p>
              <h3 className="text-2xl font-bold text-slate-800">12</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <FaExclamationTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-red-600">Damaged Items</p>
              <h3 className="text-2xl font-bold text-red-700">2</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FaBoxes size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Items</p>
              <h3 className="text-2xl font-bold text-slate-800">450</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col min-h-[300px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Receive Goods (GRN Entry)</h3>
          <div className="flex-1 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
            [ GRN Scanning & Entry Form ]
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col min-h-[300px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Issue Materials</h3>
          <div className="flex-1 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
            [ Scan Barcode to Issue Items ]
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard;
