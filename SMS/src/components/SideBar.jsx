import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <h3>Student Portal</h3>

      <ul>
        <li>
          <NavLink to="/student/dashboard">Dashboard</NavLink>
        </li>

        <li>
          <NavLink to="/student/profile">Profile</NavLink>
        </li>

        <li>
          <NavLink to="/student/courses">Courses</NavLink>
        </li>

        <li>
          <NavLink to="/student/results">Results</NavLink>
        </li>

        <li>
          <NavLink to="/student/attendance">Attendance</NavLink>
        </li>

        <li>
          <NavLink to="/">Logout</NavLink>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;