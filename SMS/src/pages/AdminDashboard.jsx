import { useEffect, useState } from "react";

const API_URL = "https://student-management-system-self-five.vercel.app";

function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [results, setResults] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [
        studentsResponse,
        coursesResponse,
        resultsResponse,
        attendanceResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/students`),
        fetch(`${API_URL}/courses`),
        fetch(`${API_URL}/results`),
        fetch(`${API_URL}/attendance`),
      ]);

      const studentsData = await studentsResponse.json();
      const coursesData = await coursesResponse.json();
      const resultsData = await resultsResponse.json();
      const attendanceData = await attendanceResponse.json();

      if (!studentsResponse.ok) {
        alert("Unable to load students.");
        return;
      }

      if (!coursesResponse.ok) {
        alert("Unable to load courses.");
        return;
      }

      if (!resultsResponse.ok) {
        alert("Unable to load results.");
        return;
      }

      if (!attendanceResponse.ok) {
        alert("Unable to load attendance.");
        return;
      }

      setStudents(studentsData);
      setCourses(coursesData);
      setResults(resultsData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error("FETCH ERROR:", error);
      alert("Backend server is not running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Overall attendance percentage
  const totalAttendance = attendance.length;

  const totalPresent = attendance.filter(
    (record) => record.status === "Present"
  ).length;

  const attendancePercentage =
    totalAttendance > 0
      ? Math.round(
          (totalPresent / totalAttendance) * 100
        )
      : 0;

  const stats = [
    {
      title: "Students",
      value: students.length,
      description: "Total Students",
    },
    {
      title: "Courses",
      value: courses.length,
      description: "Active Courses",
    },
    {
      title: "Results",
      value: results.length,
      description: "Results Added",
    },
    {
      title: "Attendance",
      value: `${attendancePercentage}%`,
      description: "Overall Attendance",
    },
  ];

  // Show latest 4 students
  const recentStudents = [...students]
    .reverse()
    .slice(0, 4);

  return (
    <div className="admin-dashboard">

      <div className="admin-content">

        <main className="admin-main">

          <div className="admin-header">
            <h1>Welcome, Admin</h1>
            <p>
              Manage your student management system.
            </p>
          </div>

          {loading ? (
            <p>Loading dashboard...</p>
          ) : (
            <>
              <div className="admin-stats">

                {stats.map((stat) => (
                  <div
                    className="admin-stat-card"
                    key={stat.title}
                  >
                    <h3>{stat.title}</h3>

                    <h2>{stat.value}</h2>

                    <p>{stat.description}</p>
                  </div>
                ))}

              </div>

              <section className="recent-students">

                <h2>Recent Students</h2>

                <div className="student-list">

                  {recentStudents.length === 0 ? (
                    <p>No students found.</p>
                  ) : (
                    recentStudents.map((student) => (
                      <div key={student.id}>

                        <strong>
                          {student.name}
                        </strong>

                        <span>
                          ST-{String(student.id).padStart(3, "0")}
                        </span>

                      </div>
                    ))
                  )}

                </div>

              </section>
            </>
          )}

        </main>

      </div>

    </div>
  );
}

export default AdminDashboard;