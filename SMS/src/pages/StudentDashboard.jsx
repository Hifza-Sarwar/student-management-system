import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function StudentDashboard() {
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

  // Logged-in user's email
  const loggedInEmail = localStorage.getItem("email");

  // Find logged-in student
  const currentStudent = students.find(
    (student) => student.email === loggedInEmail
  );

  // Student's results
  const myResults = currentStudent
    ? results.filter(
        (result) => result.student_id === currentStudent.id
      )
    : [];

  // Student's attendance
  const myAttendance = currentStudent
    ? attendance.filter(
        (record) => record.student_id === currentStudent.id
      )
    : [];

  // Average result
  const averageResult =
    myResults.length > 0
      ? Math.round(
          myResults.reduce(
            (total, result) => total + result.marks,
            0
          ) / myResults.length
        )
      : 0;

  // Attendance percentage
  const totalAttendance = myAttendance.length;

  const presentAttendance = myAttendance.filter(
    (record) => record.status === "Present"
  ).length;

  const attendancePercentage =
    totalAttendance > 0
      ? Math.round(
          (presentAttendance / totalAttendance) * 100
        )
      : 0;

  // Courses
  const studentCourses = currentStudent
    ? courses.filter((course) =>
        myResults.some(
          (result) => result.course_id === course.id
        )
      )
    : [];

  return (
    <div className="dashboard">

      <div className="dashboard-content">

        <main className="dashboard-main">

          <h1>
            Welcome, {currentStudent?.name || "Student"}
          </h1>

          <p>
            Here is your academic overview.
          </p>

          {loading ? (
            <p>Loading dashboard...</p>
          ) : (
            <>
              <div className="dashboard-cards">

                <div className="dashboard-card">
                  <h3>Courses</h3>
                  <h2>{studentCourses.length}</h2>
                  <p>Enrolled Courses</p>
                </div>

                <div className="dashboard-card">
                  <h3>Results</h3>
                  <h2>{averageResult}%</h2>
                  <p>Average Result</p>
                </div>

                <div className="dashboard-card">
                  <h3>Attendance</h3>
                  <h2>{attendancePercentage}%</h2>
                  <p>Overall Attendance</p>
                </div>

              </div>

              <section className="recent-section">

                <h2>Recent Courses</h2>

                <div className="course-list">

                  {studentCourses.length === 0 ? (
                    <p>No courses found.</p>
                  ) : (
                    studentCourses.map((course) => (
                      <div key={course.id}>
                        {course.code} - {course.name}
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

export default StudentDashboard;