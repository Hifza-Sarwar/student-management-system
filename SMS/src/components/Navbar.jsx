import { useEffect, useState } from "react";

function Navbar() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    const savedRole = localStorage.getItem("role");

    setUsername(savedUsername || "Student");
    setRole(savedRole || "student");
  }, []);

  const firstLetter = username
    ? username.charAt(0).toUpperCase()
    : "S";

  return (
    <nav className="navbar">

      <div className="navbar-left">
        <h2>Student Management System</h2>
      </div>

      <div className="navbar-right">

        <div className="student-info">

          <div className="avatar">
            {firstLetter}
          </div>

          <div>
            <h4>{username}</h4>
            <p>{role}</p>
          </div>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;