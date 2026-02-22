// src/pages/Employees.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const res = await fetch("https://fanaka-server-1.onrender.com/api/employees");
      if (!res.ok) throw new Error("Failed to fetch employees");

      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Error fetching employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Delete employee
  const deleteEmployee = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`https://fanaka-server-1.onrender.com
/api/employees/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete employee");

      alert("Employee deleted successfully");

      // Remove deleted employee from UI
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
    } catch (error) {
      console.error(error);
      alert("Error deleting employee");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-primary">Employees List</h2>
        <button
          className="btn btn-success"
          onClick={() => navigate("/add-employee")}
        >
          + Add Employee
        </button>
      </div>

      {loading ? (
        <p>Loading employees...</p>
      ) : employees.length === 0 ? (
        <div className="alert alert-info">No employees found.</div>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Position</th>
              <th>Salary (KES)</th>
              <th style={{ width: "150px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.fullName}</td>
                <td>{emp.email}</td>
                <td>{emp.phone}</td>
                <td>{emp.department}</td>
                <td>{emp.position}</td>
                <td>{emp.salary.toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => navigate(`/edit-employee/${emp._id}`)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteEmployee(emp._id)}
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
  );
};

export default Employees;
