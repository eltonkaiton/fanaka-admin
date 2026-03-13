// src/pages/EditEmployee.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    salary: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch employee data by ID
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`https://fanaka-server-1.onrender.com/api/employees/${id}`);
        if (!res.ok) {
          alert("Employee not found");
          navigate("/employees");
          return;
        }
        const data = await res.json();
        setEmployee(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load employee details");
        navigate("/employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  // Handle change
  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  // Submit updated data
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`https://fanaka-server-1.onrender.com/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });

      if (!res.ok) throw new Error("Update failed");

      alert("Employee updated successfully!");
      navigate("/employees");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (loading) return <p className="container mt-4">Loading...</p>;

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-3">Edit Employee</h2>

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="fullName"
            className="form-control"
            value={employee.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={employee.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input
            type="text"
            name="phone"
            className="form-control"
            value={employee.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Department</label>
            <input
              type="text"
              name="department"
              className="form-control"
              value={employee.department}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Position</label>
            <input
              type="text"
              name="position"
              className="form-control"
              value={employee.position}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Salary (KES)</label>
          <input
            type="number"
            name="salary"
            className="form-control"
            value={employee.salary}
            onChange={handleChange}
            required
          />
        </div>

        <div className="d-flex gap-2 mt-3">
          <button type="submit" className="btn btn-primary flex-grow-1">
            Update Employee
          </button>
          <button
            type="button"
            className="btn btn-secondary flex-grow-1"
            onClick={() => navigate("/employees")}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;
