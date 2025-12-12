// src/pages/AddEmployee.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddEmployee = () => {
  const [employee, setEmployee] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    salary: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const departments = [
    "Administration",
    "Finance",
    "Marketing",
    "Design",
    "Production",
    "Human Resources",
  ];
  const positions = [
    "Manager",
    "Assistant Manager",
    "Senior Designer",
    "Junior Designer",
    "Accountant",
    "Marketing Executive",
    "HR Officer",
    "Production Supervisor",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !employee.fullName ||
      !employee.email ||
      !employee.phone ||
      !employee.position ||
      !employee.department ||
      !employee.salary ||
      !employee.password
    ) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });

      if (!response.ok) throw new Error("Failed to add employee");

      alert("Employee added successfully!");
      navigate(-1); // go back to previous page
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-3">Add New Employee</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            name="fullName"
            value={employee.fullName}
            onChange={handleChange}
            placeholder="Enter full name"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={employee.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input
            type="text"
            className="form-control"
            name="phone"
            value={employee.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Department</label>
          <select
            className="form-select"
            name="department"
            value={employee.department}
            onChange={handleChange}
          >
            <option value="">Select Department</option>
            {departments.map((dept, idx) => (
              <option key={idx} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Position</label>
          <select
            className="form-select"
            name="position"
            value={employee.position}
            onChange={handleChange}
          >
            <option value="">Select Position</option>
            {positions.map((pos, idx) => (
              <option key={idx} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Salary (KES)</label>
          <input
            type="number"
            className="form-control"
            name="salary"
            value={employee.salary}
            onChange={handleChange}
            placeholder="Enter salary"
            min="0"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={employee.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Adding..." : "Add Employee"}
        </button>
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddEmployee;
