import { useEffect, useState } from "react";

const API_URL = "https://student-management-system-self-five.vercel.app";

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [credits, setCredits] = useState("");

  // GET courses
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/courses`);
      const data = await response.json();

      if (!response.ok) {
        alert(data.detail);
        return;
      }

      setCourses(data);
    } catch (error) {
      console.error(error);
      alert("Backend server is not running");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Clear form
  const clearForm = () => {
    setCode("");
    setName("");
    setInstructor("");
    setCredits("");
    setEditingCourse(null);
  };

  // Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const courseData = {
      code,
      name,
      instructor,
      credits: Number(credits),
    };

    try {
      let response;

      if (editingCourse) {
        response = await fetch(
          `${API_URL}/courses/${editingCourse.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(courseData),
          }
        );
      } else {
        response = await fetch(`${API_URL}/courses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(courseData),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail);
        return;
      }

      alert(
        editingCourse
          ? "Course updated successfully!"
          : "Course added successfully!"
      );

      clearForm();
      setShowForm(false);
      fetchCourses();

    } catch (error) {
      console.error(error);
      alert("Backend server is not running");
    }
  };

  // Edit
  const handleEdit = (course) => {
    setEditingCourse(course);

    setCode(course.code);
    setName(course.name);
    setInstructor(course.instructor);
    setCredits(course.credits);

    setShowForm(true);
  };

  // Delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail);
        return;
      }

      alert("Course deleted successfully!");

      fetchCourses();

    } catch (error) {
      console.error(error);
      alert("Backend server is not running");
    }
  };

  return (
    <div className="manage-courses-page">

      <main className="manage-courses-content">

        <div className="manage-courses-header">
          <div>
            <h1>Manage Courses</h1>
            <p>Add, edit and manage courses.</p>
          </div>

          <button
            className="add-course-btn"
            onClick={() => {
              clearForm();
              setShowForm(true);
            }}
          >
            + Add Course
          </button>
        </div>

        {/* Form */}

        {showForm && (
          <div className="manage-courses-card">
            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label>Course Code</label>
                <input
                  type="text"
                  placeholder="e.g. CS-401"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  placeholder="Enter course name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Instructor</label>
                <input
                  type="text"
                  placeholder="Enter instructor name"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Credits</label>
                <input
                  type="number"
                  placeholder="Enter credits"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  required
                />
              </div>

              <button type="submit">
                {editingCourse ? "Update Course" : "Add Course"}
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

        {/* Courses Table */}

        <div className="manage-courses-card">

          <div className="table-container">

            {loading ? (
              <p>Loading courses...</p>
            ) : courses.length === 0 ? (
              <p>No courses found.</p>
            ) : (
              <table>

                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Credits</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>

                      <td>{course.code}</td>
                      <td>{course.name}</td>
                      <td>{course.instructor}</td>
                      <td>{course.credits}</td>

                      <td className="course-actions">

                        <button
                          className="edit-course-btn"
                          onClick={() => handleEdit(course)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-course-btn"
                          onClick={() => handleDelete(course.id)}
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}

export default ManageCourses;