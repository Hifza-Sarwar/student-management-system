import { useEffect, useState } from "react";

const API_URL = "https://student-management-system-self-five.vercel.app";

function ManageAttendance() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [loading, setLoading] = useState(true);

  // Token lene ka function - YEHI FIX HAI
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const getAuthHeaderOnly = () => {
    return {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    };
  };

  // Get students, courses and attendance
  const fetchData = async () => {
    try {
      const [
        studentsResponse,
        coursesResponse,
        attendanceResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/students`, { headers: getAuthHeaderOnly() }),
        fetch(`${API_URL}/courses`, { headers: getAuthHeaderOnly() }),
        fetch(`${API_URL}/attendance`, { headers: getAuthHeaderOnly() }),
      ]);

      const studentsData = await studentsResponse.json();
      const coursesData = await coursesResponse.json();
      const attendanceData = await attendanceResponse.json();

      if (!studentsResponse.ok) {
        alert("Unable to load students.");
        return;
      }

      if (!coursesResponse.ok) {
        alert("Unable to load courses.");
        return;
      }

      if (!attendanceResponse.ok) {
        alert("Unable to load attendance.");
        return;
      }

      setStudents(studentsData);
      setCourses(coursesData);
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

  // When course or date changes, load existing attendance
  useEffect(() => {
    if (!selectedCourse || !selectedDate) {
      return;
    }

    const existingAttendance = {};

    attendance.forEach((record) => {
      if (
        record.course_id === Number(selectedCourse) &&
        record.date === selectedDate
      ) {
        existingAttendance[record.student_id] = record.status;
      }
    });

    setAttendanceStatus(existingAttendance);
  }, [selectedCourse, selectedDate, attendance]);

  // Change Present / Absent
  const handleStatusChange = (studentId, status) => {
    setAttendanceStatus((previous) => ({
      ...previous,
      [studentId]: status,
    }));
  };

  // Save attendance
  const handleSaveAttendance = async () => {
    if (!selectedCourse) {
      alert("Please select a course.");
      return;
    }

    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    if (students.length === 0) {
      alert("No students found.");
      return;
    }

    try {
      for (const student of students) {
        const status =
          attendanceStatus[student.id] || "Present";

        const existingRecord = attendance.find(
          (record) =>
            record.student_id === student.id &&
            record.course_id === Number(selectedCourse) &&
            record.date === selectedDate
        );

        if (existingRecord) {
          // Update existing attendance
          await fetch(
            `${API_URL}/attendance/${existingRecord.id}`,
            {
              method: "PUT",
              headers: getAuthHeaders(),
              body: JSON.stringify({
                student_id: student.id,
                course_id: Number(selectedCourse),
                date: selectedDate,
                status: status,
              }),
            }
          );
        } else {
          // Create new attendance
          await fetch(`${API_URL}/attendance`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              student_id: student.id,
              course_id: Number(selectedCourse),
              date: selectedDate,
              status: status,
            }),
          });
        }
      }

      alert("Attendance saved successfully!");

      await fetchData();

    } catch (error) {
      console.error("SAVE ERROR:", error);
      alert("Unable to save attendance.");
    }
  };

  // Delete attendance record
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/attendance/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaderOnly(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Unable to delete attendance.");
        return;
      }

      alert("Attendance deleted successfully!");

      fetchData();

    } catch (error) {
      console.error("DELETE ERROR:", error);
      alert("Unable to delete attendance.");
    }
  };

  // Get student
  const getStudent = (studentId) => {
    return students.find(
      (student) => student.id === studentId
    );
  };

  // Get course
  const getCourse = (courseId) => {
    return courses.find(
      (course) => course.id === courseId
    );
  };

  // Filter attendance for selected course/date
  const filteredAttendance = attendance.filter(
    (record) =>
      (!selectedCourse ||
        record.course_id === Number(selectedCourse)) &&
      (!selectedDate ||
        record.date === selectedDate)
  );

  return (
    <div className="manage-attendance-page">
      <main className="manage-attendance-content">
        <div className="manage-attendance-header">
          <div>
            <h1>Manage Attendance</h1>
            <p>Mark and manage student attendance.</p>
          </div>
          <button
            className="save-attendance-btn"
            onClick={handleSaveAttendance}
          >
            Save Attendance
          </button>
        </div>

        <div className="attendance-filters">
          <div className="filter-group">
            <label>Course</label>
            <select
              value={selectedCourse}
              onChange={(e) =>
                setSelectedCourse(e.target.value)
              }
            >
              <option value="">
                Select Course
              </option>
              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(e.target.value)
              }
            />
          </div>
        </div>

        <div className="manage-attendance-card">
          <div className="table-container">
            {loading ? (
              <p>Loading attendance...</p>
            ) : students.length === 0 ? (
              <p>No students found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        {student.id}
                      </td>
                      <td>
                        {student.name}
                      </td>
                      <td>
                        <div className="attendance-options">
                          <label>
                            <input
                              type="radio"
                              name={`attendance-${student.id}`}
                              checked={
                                attendanceStatus[
                                  student.id
                                ] === "Present"
                              }
                              onChange={() =>
                                handleStatusChange(
                                  student.id,
                                  "Present"
                                )
                              }
                            />
                            Present
                          </label>
                          <label>
                            <input
                              type="radio"
                              name={`attendance-${student.id}`}
                              checked={
                                attendanceStatus[
                                  student.id
                                ] === "Absent"
                              }
                              onChange={() =>
                                handleStatusChange(
                                  student.id,
                                  "Absent"
                                )
                              }
                            />
                            Absent
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {selectedCourse && selectedDate && (
          <div className="manage-attendance-card">
            <h2>Saved Attendance</h2>
            <div className="table-container">
              {filteredAttendance.length === 0 ? (
                <p>
                  No attendance saved for this course and date.
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Course</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((record) => {
                      const student = getStudent(
                        record.student_id
                      );
                      const course = getCourse(
                        record.course_id
                      );
                      return (
                        <tr key={record.id}>
                          <td>
                            {student
                              ? student.id
                              : record.student_id}
                          </td>
                          <td>
                            {student
                              ? student.name
                              : "Unknown Student"}
                          </td>
                          <td>
                            {course
                              ? `${course.code} - ${course.name}`
                              : "Unknown Course"}
                          </td>
                          <td>
                            {record.date}
                          </td>
                          <td>
                            {record.status}
                          </td>
                          <td>
                            <button
                              className="delete-attendance-btn"
                              onClick={() =>
                                handleDelete(record.id)
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageAttendance;