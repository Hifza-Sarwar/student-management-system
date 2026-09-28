import Navbar from "../components/Navbar";
import Sidebar from "../components/SideBar";
import { Outlet } from "react-router-dom";

function StudentLayout() {
  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-content">
        <Sidebar />

        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;