import { NavLink } from "react-router-dom";

function AdminSidebar() {
  return (
    <aside className="sidebar">
      <h3>Admin Panel</h3>

      <ul>
        <li>
          <NavLink to="/admin/dashboard">
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/students">
            Students
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/courses">
            Courses
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/results">
            Results
          </NavLink>
        </li>

        <li>
          <NavLink to="/admin/attendance">
            Attendance
          </NavLink>
        </li>

        <li>
          <NavLink to="/">
            Logout
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}

export default AdminSidebar;