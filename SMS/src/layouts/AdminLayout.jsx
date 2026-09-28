import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="admin-dashboard">
      <Navbar />

      <div className="admin-content">
        <AdminSidebar />

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;