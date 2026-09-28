import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRole }) {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  // User login nahi hai
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // User ka role allowed nahi hai
  if (allowedRole && role !== allowedRole) {
    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (role === "student") {
      return <Navigate to="/student/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;