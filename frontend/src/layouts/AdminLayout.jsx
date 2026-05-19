import Sidebar from "../components/Sidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex bg-[#f8f6f2] min-h-screen">
      <Sidebar />
      <div className="ml-[260px] flex-1 p-8">{children}</div>
    </div>
  );
};

export default AdminLayout;
