import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function Results() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  // Get all results, students and courses
  const fetchData = async () => {
    try {
      const [resultsResponse, studentsResponse, coursesResponse] =
        await Promise.all([
          fetch(`${API_URL}/results`),
          fetch(`${API_URL}/students`),
          fetch(`${API_URL}/courses`),
        ]);

      const resultsData = await resultsResponse.json();
      const studentsData = await studentsResponse.json();
      const coursesData = await coursesResponse.json();

      if (!resultsResponse.ok) {
        alert(resultsData.detail || "Unable to load results.");
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

      setResults(resultsData);
      setStudents(studentsData);
      setCourses(coursesData);

    } catch (error) {
      console.error("Error:", error);
      alert("Backend server is not running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Find student
  const getStudent = (studentId) => {
    return students.find(
      (student) => student.id === studentId
    );
  };

  // Find course
  const getCourse = (courseId) => {
    return courses.find(
      (course) => course.id === courseId
    );
  };
// Get logged-in student's email
  const loggedInEmail = localStorage.getItem("email");

const currentStudent = students.find(
  (student) => student.email === loggedInEmail
);

// Only show logged-in student's results
const myResults = currentStudent
  ? results.filter(
      (result) => result.student_id === currentStudent.id
    )
  : [];
  // Average marks
  const averageMarks =
    myResults.length > 0
      ? Math.round(
          myResults.reduce(
            (total, result) => total + result.marks,
            0
          ) / myResults.length
        )
      : 0;

  return (
    <div className="results-page">

      <main className="results-content">

        {/* Header */}

        <div className="results-header">
          <div>
            <h1>My Results</h1>
            <p>View your academic results.</p>
          </div>
        </div>

        {/* Summary */}

        <div className="results-card">

          <div className="results-summary">

            <div>
              <span>Average Marks</span>
              <h2>{averageMarks}%</h2>
            </div>

            <div>
              <span>Total Results</span>
              <h2>{myResults.length}</h2>
            </div>

          </div>

        </div>

        {/* Results Table */}

        <div className="results-card">

          <div className="table-container">

            {loading ? (
              <p>Loading results...</p>
            ) : myResults.length === 0 ? (
              <p>No results found.</p>
            ) : (

              <table>

                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Marks</th>
                    <th>Grade</th>
                    <th>Semester</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {myResults.map((result) => {

                    const course = getCourse(result.course_id);

                    return (
                      <tr key={result.id}>

                        <td>
                          {course
                            ? `${course.code} - ${course.name}`
                            : `Course ${result.course_id}`}
                        </td>

                        <td>
                          {result.marks}%
                        </td>

                        <td>
                          {result.grade}
                        </td>

                        <td>
                          {result.semester}
                        </td>

                        <td>
                          {result.marks >= 50
                            ? "Passed"
                            : "Failed"}
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

export default Results;