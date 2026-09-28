import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit form open or close
  const [showForm, setShowForm] = useState(false);

  // Edit mode
  const [editingStudent, setEditingStudent] = useState(null);

  // Search
  const [search, setSearch] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    course: "",
    is_active: true,
  });

  // =========================
  // GET STUDENTS
  // =========================

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // =========================
  // OPEN ADD FORM
  // =========================

  const openAddForm = () => {
    setEditingStudent(null);

    setFormData({
      name: "",
      email: "",
      age: "",
      course: "",
      is_active: true,
    });

    setShowForm(true);
  };

  // =========================
  // OPEN EDIT FORM
  // =========================

  const openEditForm = (student) => {
    setEditingStudent(student);

    setFormData({
      name: student.name,
      email: student.email,
      age: student.age,
      course: student.course || "",
      is_active: student.is_active,
    });

    setShowForm(true);
  };

  // =========================
  // ADD / UPDATE STUDENT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.age) {
      alert("Please fill all required fields.");
      return;
    }

    const studentData = {
      name: formData.name,
      email: formData.email,
      age: Number(formData.age),
      course: formData.course,
      is_active: formData.is_active,
    };

    try {
      if (editingStudent) {
        // PUT
        await axios.put(
          `${API_URL}/students/${editingStudent.id}`,
          studentData
        );

        alert("Student updated successfully!");
      } else {
        // POST
        await axios.post(
          `${API_URL}/students`,
          studentData
        );

        alert("Student added successfully!");
      }

      // Database se fresh data
      await fetchStudents();

      // Form close
      setShowForm(false);

      setEditingStudent(null);

      setFormData({
        name: "",
        email: "",
        age: "",
        course: "",
        is_active: true,
      });

    } catch (error) {
      console.error("Error saving student:", error);

      if (error.response) {
        alert(
          error.response.data.detail || "Something went wrong."
        );
      } else {
        alert("Backend connection failed.");
      }
    }
  };

  // =========================
  // DELETE STUDENT
  // =========================

  const handleDelete = async (studentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/students/${studentId}`
      );

      alert("Student deleted successfully!");

      await fetchStudents();

    } catch (error) {
      console.error("Error deleting student:", error);

      if (error.response) {
        alert(
          error.response.data.detail || "Unable to delete student."
        );
      } else {
        alert("Backend connection failed.");
      }
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase();

    return (
      student.name.toLowerCase().includes(searchText) ||
      student.email.toLowerCase().includes(searchText) ||
      String(student.id).includes(searchText) ||
      (student.course || "").toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="students-page">

      <main className="students-content">

        {/* HEADER */}

        <div className="students-header">

          <div>
            <h1>Students</h1>
            <p>Manage registered students.</p>
          </div>

          <button
            className="add-student-btn"
            onClick={openAddForm}
          >
            + Add Student
          </button>

        </div>


        {/* SEARCH */}

        <div className="students-actions">

          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>


        {/* STUDENTS TABLE */}

        <div className="students-card">

          <div className="table-container">

            {loading ? (
              <p>Loading students...</p>
            ) : filteredStudents.length === 0 ? (
              <p>No students found.</p>
            ) : (

              <table>

                <thead>

                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>

                </thead>


                <tbody>

                  {filteredStudents.map((student) => (

                    <tr key={student.id}>

                      <td>
                        ST-
                        {String(student.id).padStart(3, "0")}
                      </td>

                      <td>
                        {student.name}
                      </td>

                      <td>
                        {student.email}
                      </td>

                      <td>
                        {student.age}
                      </td>

                      <td>
                        {student.course || "-"}
                      </td>

                      <td>
                        {student.is_active
                          ? "Active"
                          : "Inactive"}
                      </td>

                      <td className="student-actions">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            openEditForm(student)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(student.id)
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

        <div className="student-modal">

          <div className="student-modal-content">

            <div className="modal-header">

              <div>
                <h2>
                  {editingStudent
                    ? "Edit Student"
                    : "Add Student"}
                </h2>

                <p>
                  {editingStudent
                    ? "Update student information."
                    : "Enter student information."}
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

              {/* NAME */}

              <div className="form-group">

                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter student name"
                  required
                />

              </div>


              {/* EMAIL */}

              <div className="form-group">

                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter student email"
                  required
                />

              </div>


              {/* AGE */}

              <div className="form-group">

                <label>Age</label>

                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter age"
                  min="1"
                  required
                />

              </div>


              {/* COURSE */}

              <div className="form-group">

                <label>Course</label>

                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                />

              </div>


              {/* ACTIVE */}

              <div className="form-checkbox">

                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />

                <label>Active Student</label>

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
                  {editingStudent
                    ? "Update Student"
                    : "Add Student"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Students;