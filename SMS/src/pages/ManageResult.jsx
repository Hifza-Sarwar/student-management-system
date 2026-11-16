import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://student-management-system-self-five.vercel.app";

function ManageResults() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResult, setEditingResult] = useState(null);

  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [marks, setMarks] = useState("");
  const [grade, setGrade] = useState("");
  const [semester, setSemester] = useState("");

  // Token lene ka function
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

  // ===== MARKS SE GRADE AUTOMATIC =====
  const calculateGrade = (marksValue) => {
    const m = Number(marksValue);
    if (marksValue === "" || isNaN(m)) return "";
    if (m >= 90) return "A+";
    if (m >= 85) return "A";
    if (m >= 80) return "A-";
    if (m >= 75) return "B+";
    if (m >= 70) return "B";
    if (m >= 65) return "C+";
    if (m >= 60) return "C";
    if (m >= 50) return "D";
    return "F";
  };

  // Marks change hote hi Grade auto set ho jaye ga
  const handleMarksChange = (e) => {
    const value = e.target.value;
    setMarks(value);
    setGrade(calculateGrade(value));
  };

  // Get Results, Students and Courses
  const fetchData = async () => {
    try {
      const [resultsRes, studentsRes, coursesRes] = await Promise.all([
        axios.get(`${API_URL}/results`, { headers: getAuthHeaderOnly() }),
        axios.get(`${API_URL}/students`, { headers: getAuthHeaderOnly() }),
        axios.get(`${API_URL}/courses`, { headers: getAuthHeaderOnly() }),
      ]);

      setResults(resultsRes.data);
      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error("FETCH ERROR:", error);
      alert("Unable to load results, students or courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Clear form
  const clearForm = () => {
    setStudentId("");
    setCourseId("");
    setMarks("");
    setGrade("");
    setSemester("");
    setEditingResult(null);
  };

  // Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const resultData = {
      student_id: Number(studentId),
      course_id: Number(courseId),
      marks: Number(marks),
      grade: grade,
      semester: Number(semester),
    };

    try {
      let response;

      if (editingResult) {
        response = await fetch(
          `${API_URL}/results/${editingResult.id}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(resultData),
          }
        );
      } else {
        response = await fetch(`${API_URL}/results`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(resultData),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail);
        return;
      }

      alert(
        editingResult
          ? "Result updated successfully!"
          : "Result added successfully!"
      );

      clearForm();
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Backend server is not running");
    }
  };

  // Edit
  const handleEdit = (result) => {
    setEditingResult(result);

    setStudentId(result.student_id);
    setCourseId(result.course_id);
    setMarks(result.marks);
    setGrade(result.grade);
    setSemester(result.semester);

    setShowForm(true);
  };

  // Delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this result?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/results/${id}`, {
        method: "DELETE",
        headers: getAuthHeaderOnly(),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail);
        return;
      }

      alert("Result deleted successfully!");
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Backend server is not running");
    }
  };

  // Find student
  const getStudent = (id) => {
    return students.find((student) => student.id === id);
  };

  // Find course
  const getCourse = (id) => {
    return courses.find((course) => course.id === id);
  };

  return (
    <div className="manage-results-page">
      <main className="manage-results-content">
        <div className="manage-results-header">
          <div>
            <h1>Manage Results</h1>
            <p>Add, update and manage student results.</p>
          </div>
          <button
            className="add-result-btn"
            onClick={() => {
              clearForm();
              setShowForm(true);
            }}
          >
            + Add Result
          </button>
        </div>

        {showForm && (
          <div className="manage-results-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Student</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - ID {student.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Marks</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter marks"
                  value={marks}
                  onChange={handleMarksChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Grade (Auto)</label>
                <input
                  type="text"
                  placeholder="Auto grade from marks"
                  value={grade}
                  readOnly
                  style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
                  required
                />
                <small style={{ color: "#666" }}>
                  Grade marks se automatic aye ga
                </small>
              </div>

              <div className="form-group">
                <label>Semester</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 8"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  required
                />
              </div>

              <button type="submit">
                {editingResult ? "Update Result" : "Add Result"}
              </button>

              <button
                type="button"
                onClick={() => {
                  clearForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="manage-results-card">
          <div className="table-container">
            {loading ? (
              <p>Loading results...</p>
            ) : results.length === 0 ? (
              <p>No results found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Marks</th>
                    <th>Grade</th>
                    <th>Semester</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => {
                    const student = getStudent(result.student_id);
                    const course = getCourse(result.course_id);
                    return (
                      <tr key={result.id}>
                        <td>
                          {student
                            ? student.id
                            : result.student_id}
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
                        <td>{result.marks}%</td>
                        <td>{result.grade}</td>
                        <td>{result.semester}</td>
                        <td className="result-actions">
                          <button
                            className="edit-result-btn"
                            onClick={() => handleEdit(result)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-result-btn"
                            onClick={() =>
                              handleDelete(result.id)
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
      </main>
    </div>
  );
}

export default ManageResults;