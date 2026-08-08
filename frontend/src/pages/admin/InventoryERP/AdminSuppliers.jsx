import React from "react";

const AdminSuppliers = () => {
  return (
    <div className="p-4 md:p-8 bg-[#faf9f7] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1d1b19]">Suppliers</h1>
        <p className="text-sm text-[#5c6675]">Manage supplier information and contacts.</p>
        <div className="mt-2 h-1 w-12 rounded-full bg-[#ff8b00]" />
      </div>
      
      <div className="rounded-2xl border border-slate-200 bg-temple-100 p-6 shadow-sm flex items-center justify-center min-h-[400px] text-slate-500">
        Suppliers UI goes here.
      </div>
    </div>
  );
};

export default AdminSuppliers;
