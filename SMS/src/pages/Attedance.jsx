import { useEffect, useState } from "react";

const API_URL = "https://student-management-system-self-five.vercel.app";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  // Get attendance, students and courses
  const fetchData = async () => {
    try {
      const [
        attendanceResponse,
        studentsResponse,
        coursesResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/attendance`),
        fetch(`${API_URL}/students`),
        fetch(`${API_URL}/courses`),
      ]);

      const attendanceData =
        await attendanceResponse.json();

      const studentsData =
        await studentsResponse.json();

      const coursesData =
        await coursesResponse.json();

      if (!attendanceResponse.ok) {
        alert(
          attendanceData.detail ||
            "Unable to load attendance."
        );
        return;
      }

      if (!studentsResponse.ok) {
        alert("Unable to load students.");
        return;
      }

      if (!coursesResponse.ok) {
        alert("Unable to load courses.");
        return;
      }

      setAttendance(attendanceData);
      setStudents(studentsData);
      setCourses(coursesData);

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

  const loggedInEmail = localStorage.getItem("email");

  const currentStudent = students.find(
    (student) => student.email === loggedInEmail
  );

  // Only current student's attendance
  const myAttendance = currentStudent
    ? attendance.filter(
        (record) =>
          record.student_id === currentStudent.id
      )
    : [];

  // Find course
  const getCourse = (courseId) => {
    return courses.find(
      (course) => course.id === courseId
    );
  };

  // Group attendance by course
  const courseAttendance = courses
    .map((course) => {
      const records = myAttendance.filter(
        (record) =>
          record.course_id === course.id
      );

      if (records.length === 0) {
        return null;
      }

      const total = records.length;

      const present = records.filter(
        (record) => record.status === "Present"
      ).length;

      const absent = records.filter(
        (record) => record.status === "Absent"
      ).length;

      const percentage = Math.round(
        (present / total) * 100
      );

      return {
        id: course.id,
        code: course.code,
        subject: course.name,
        total,
        present,
        absent,
        percentage,
      };
    })
    .filter(Boolean);

  // Overall attendance
  const totalClasses = myAttendance.length;

  const totalPresent = myAttendance.filter(
    (record) => record.status === "Present"
  ).length;

  const totalAbsent = myAttendance.filter(
    (record) => record.status === "Absent"
  ).length;

  const overallPercentage =
    totalClasses > 0
      ? Math.round(
          (totalPresent / totalClasses) * 100
        )
      : 0;

  // Attendance status
  const getAttendanceStatus = (percentage) => {
    if (percentage >= 75) {
      return "Good";
    }

    return "Low";
  };

  return (
    <div className="attendance-page">

      <main className="attendance-content">

        {/* Header */}

        <div className="attendance-header">

          <h1>My Attendance</h1>

          <p>
            View your attendance details for each course.
          </p>

        </div>

        {/* Summary */}

        <div className="attendance-summary">

          <div className="attendance-summary-card">

            <span>Overall Attendance</span>

            <h2>
              {overallPercentage}%
            </h2>

          </div>

          <div className="attendance-summary-card">

            <span>Total Present</span>

            <h2>
              {totalPresent}
            </h2>

          </div>

          <div className="attendance-summary-card">

            <span>Total Absent</span>

            <h2>
              {totalAbsent}
            </h2>

          </div>

        </div>

        {/* Attendance Table */}

        <div className="attendance-card">

          <div className="table-container">

            {loading ? (

              <p>Loading attendance...</p>

            ) : courseAttendance.length === 0 ? (

              <p>
                No attendance records found.
              </p>

            ) : (

              <table>

                <thead>

                  <tr>

                    <th>Course Code</th>

                    <th>Subject</th>

                    <th>Total Classes</th>

                    <th>Present</th>

                    <th>Absent</th>

                    <th>Percentage</th>

                    <th>Status</th>

                  </tr>

                </thead>

                <tbody>

                  {courseAttendance.map(
                    (course) => (

                      <tr key={course.id}>

                        <td>
                          {course.code}
                        </td>

                        <td>
                          {course.subject}
                        </td>

                        <td>
                          {course.total}
                        </td>

                        <td>
                          {course.present}
                        </td>

                        <td>
                          {course.absent}
                        </td>

                        <td>
                          {course.percentage}%
                        </td>

                        <td>

                          <span
                            className="attendance-status"
                          >
                            {getAttendanceStatus(
                              course.percentage
                            )}
                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}

export default Attendance;