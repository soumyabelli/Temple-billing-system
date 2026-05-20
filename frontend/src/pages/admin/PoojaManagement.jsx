import AdminLayout from "../../layouts/AdminLayout";

const PoojaManagement = () => {
  return (
    <AdminLayout>
      <div className="mt-5 rounded-2xl border p-8 bg-white border-[#ece8e1]">
        <h2 className="text-3xl font-bold text-[#1d1b19]">Pooja Management</h2>
        <p className="mt-2 text-gray-600">Manage bookings, schedules, and pooja operations.</p>
      </div>
    </AdminLayout>
  );
};

export default PoojaManagement;
