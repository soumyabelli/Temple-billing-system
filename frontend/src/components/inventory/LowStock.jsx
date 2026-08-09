import React from "react";
import { FaBoxes, FaExclamationTriangle, FaClock } from "react-icons/fa";

const LowStock = ({ items = [], requests = [] }) => {
  const lowStockItems = items.filter((item) =>
    String(item.status || "").toLowerCase().includes("low") ||
    (item.currentStock != null && item.minimumStock != null && Number(item.currentStock) <= Number(item.minimumStock))
  );

  const pendingRequests = Array.isArray(requests)
    ? requests.filter((r) => r.status === "Pending" || r.status === "In Progress")
    : [];

  if (!lowStockItems.length && !pendingRequests.length) {
    return (
      <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-sm font-semibold text-slate-400">
        No low stock alerts or pending inventory requests at the moment.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* PENDING INVENTORY REQUESTS FROM ACCOUNTANT & STAFF */}
      {pendingRequests.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-700 tracking-wider">
            <FaClock className="text-amber-600" /> Pending Inventory Requests ({pendingRequests.length})
          </div>
          {pendingRequests.map((req, idx) => (
            <div
              key={req._id || idx}
              className="flex items-center justify-between rounded-xl bg-amber-50/90 border border-amber-200 p-3.5 shadow-xs"
            >
              <div>
                <p className="text-sm font-extrabold text-amber-950">
                  {req.itemName} <span className="text-xs font-bold text-amber-800">({req.quantity} {req.unit})</span>
                </p>
                <p className="text-xs font-medium text-amber-800 mt-0.5">
                  Requested by <strong>{req.userName || req.staffName || req.requestedBy || "Accountant / Staff"}</strong> {req.role ? `(${req.role})` : ""} • Purpose: {req.reason || req.purpose || "Store requirement"}
                </p>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-200 text-amber-900 border border-amber-300 whitespace-nowrap ml-2">
                Pending Approval
              </span>
            </div>
          ))}
        </div>
      )}

      {/* LOW STOCK ALERTS */}
      {lowStockItems.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-rose-700 tracking-wider">
            <FaExclamationTriangle className="text-rose-600" /> Low Stock Threshold Alerts ({lowStockItems.length})
          </div>
          {lowStockItems.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-xl bg-rose-50/90 border border-rose-200 p-3.5 shadow-xs"
            >
              <div>
                <p className="text-sm font-extrabold text-slate-800">{item.name}</p>
                <p className="text-xs font-medium text-rose-700 mt-0.5">
                  Current Stock: <strong>{item.currentStock ?? item.stock ?? "Low"}</strong> (Min: {item.minimumStock || 10})
                </p>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-rose-200 text-rose-900 border border-rose-300">
                Low Stock
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowStock;
