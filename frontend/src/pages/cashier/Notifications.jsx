import React from "react";

// Temporary fallback to prevent blank screen during import/export mismatch.
// Replace with the original implementation once the export style is confirmed.
export default function Notifications() {
  return (
    <div className="p-6">
      <div className="text-xl font-semibold">Page Loaded Successfully</div>
      <div className="mt-2 text-gray-600">Cashier Notifications</div>
    </div>
  );
}

