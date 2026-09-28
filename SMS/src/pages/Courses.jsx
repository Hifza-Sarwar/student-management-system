import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    instructor: "",
    credits: "",
  });

  // =========================
  // GET COURSES
  // =========================

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses`);

      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      alert("Unable to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =========================
  // OPEN ADD FORM
  // =========================

  const openAddForm = () => {
    setEditingCourse(null);

    setFormData({
      code: "",
      name: "",
      instructor: "",
      credits: "",
    });

    setShowForm(true);
  };

  // =========================
  // OPEN EDIT FORM
  // =========================

  const openEditForm = (course) => {
    setEditingCourse(course);

    setFormData({
      code: course.code,
      name: course.name,
      instructor: course.instructor,
      credits: course.credits,
    });

    setShowForm(true);
  };

  // =========================
  // ADD / UPDATE COURSE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.code ||
      !formData.name ||
      !formData.instructor ||
      !formData.credits
    ) {
      alert("Please fill all fields.");
      return;
    }

    const courseData = {
      code: formData.code,
      name: formData.name,
      instructor: formData.instructor,
      credits: Number(formData.credits),
    };

    try {
      if (editingCourse) {
        // PUT
        await axios.put(
          `${API_URL}/courses/${editingCourse.id}`,
          courseData
        );

        alert("Course updated successfully!");
      } else {
        // POST
        await axios.post(
          `${API_URL}/courses`,
          courseData
        );

        alert("Course added successfully!");
      }

      await fetchCourses();

      setShowForm(false);
      setEditingCourse(null);

      setFormData({
        code: "",
        name: "",
        instructor: "",
        credits: "",
      });

    } catch (error) {
      console.error("Error saving course:", error);

      if (error.response) {
        alert(
          error.response.data.detail ||
          "Something went wrong."
        );
      } else {
        alert("Backend connection failed.");
      }
    }
  };

  // =========================
  // DELETE COURSE
  // =========================

  const handleDelete = async (courseId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/courses/${courseId}`
      );

      alert("Course deleted successfully!");

      await fetchCourses();

    } catch (error) {
      console.error("Error deleting course:", error);

      if (error.response) {
        alert(
          error.response.data.detail ||
          "Unable to delete course."
        );
      } else {
        alert("Backend connection failed.");
      }
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredCourses = courses.filter((course) => {
    const searchText = search.toLowerCase();

    return (
      course.code.toLowerCase().includes(searchText) ||
      course.name.toLowerCase().includes(searchText) ||
      course.instructor.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="courses-page">

      <main className="courses-content">

        {/* HEADER */}

        <div className="courses-header">

          <div>
            <h1>Courses</h1>
            <p>Manage available courses.</p>
          </div>

          <button
            className="add-course-btn"
            onClick={openAddForm}
          >
            + Add Course
          </button>

        </div>


        {/* SEARCH */}

        <div className="courses-actions">

          <input
            type="text"
            placeholder="Search course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>


        {/* COURSE TABLE */}

        <div className="courses-card">

          <div className="table-container">

            {loading ? (
              <p>Loading courses...</p>
            ) : filteredCourses.length === 0 ? (
              <p>No courses found.</p>
            ) : (

              <table>

                <thead>

                  <tr>
                    <th>Course ID</th>
                    <th>Code</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Credits</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredCourses.map((course) => (

                    <tr key={course.id}>

                      <td>
                        CR-
                        {String(course.id).padStart(3, "0")}
                      </td>

                      <td>
                        {course.code}
                      </td>

                      <td>
                        {course.name}
                      </td>

                      <td>
                        {course.instructor}
                      </td>

                      <td>
                        {course.credits}
                      </td>

                      <td className="course-actions">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            openEditForm(course)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(course.id)
                          }
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


      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {showForm && (

        <div className="course-modal">

          <div className="course-modal-content">

            <div className="modal-header">

              <div>

                <h2>
                  {editingCourse
                    ? "Edit Course"
                    : "Add Course"}
                </h2>

                <p>
                  {editingCourse
                    ? "Update course information."
                    : "Enter course information."}
                </p>

              </div>

              <button
                className="close-modal-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form onSubmit={handleSubmit}>

              {/* CODE */}

              <div className="form-group">

                <label>Course Code</label>

                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. CS-101"
                  required
                />

              </div>


              {/* NAME */}

              <div className="form-group">

                <label>Course Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Web Development"
                  required
                />

              </div>


              {/* INSTRUCTOR */}

              <div className="form-group">

                <label>Instructor</label>

                <input
                  type="text"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleChange}
                  placeholder="Enter instructor name"
                  required
                />

              </div>


              {/* CREDITS */}

              <div className="form-group">

                <label>Credits</label>

                <input
                  type="number"
                  name="credits"
                  value={formData.credits}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                  min="1"
                  required
                />

              </div>


              {/* BUTTONS */}

              <div className="form-buttons">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  {editingCourse
                    ? "Update Course"
                    : "Add Course"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Courses;