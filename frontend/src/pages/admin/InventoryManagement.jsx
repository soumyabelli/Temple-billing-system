import AdminLayout from "../../layouts/AdminLayout";

const InventoryManagement = () => {
  return (
    <AdminLayout>
      <div className="mt-5 rounded-2xl border p-8 bg-white border-[#ece8e1]">
        <h2 className="text-3xl font-bold text-[#1d1b19]">Inventory Management</h2>
        <p className="mt-2 text-gray-600">Monitor stock, procurement, and alerts.</p>
      </div>
    </AdminLayout>
  );
};

export default InventoryManagement;
