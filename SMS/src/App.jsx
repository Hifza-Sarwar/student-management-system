import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/StudentDashboard";
import Profile from "./pages/Profile";
import Courses from "./pages/Courses";
import Results from "./pages/Results";
import Attendance from "./pages/Attedance";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import Students from "./pages/Student";
import ManageCourses from "./pages/ManageCourse";
import ManageResults from "./pages/ManageResult";
import ManageAttendance from "./pages/ManageAttendance";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />


        {/*  STUDENT */}

        <Route element={<ProtectedRoute allowedRole="student" />}>

          <Route path="/student" element={<StudentLayout />}>

            <Route
              path="dashboard"
              element={<StudentDashboard />}
            />

            <Route
              path="profile"
              element={<Profile />}
            />

            <Route
              path="courses"
              element={<Courses />}
            />

            <Route
              path="results"
              element={<Results />}
            />

            <Route
              path="attendance"
              element={<Attendance />}
            />

          </Route>

        </Route>


        {/* ADMIN  */}

        <Route element={<ProtectedRoute allowedRole="admin" />}>

          <Route path="/admin" element={<AdminLayout />}>

            <Route
              path="dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="students"
              element={<Students />}
            />

            <Route
              path="courses"
              element={<ManageCourses />}
            />

            <Route
              path="results"
              element={<ManageResults />}
            />

            <Route
              path="attendance"
              element={<ManageAttendance />}
            />

          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;