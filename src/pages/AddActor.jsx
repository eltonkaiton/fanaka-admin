// src/pages/AddActor.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddActor = () => {
  const navigate = useNavigate();
  const [actor, setActor] = useState({
    fullName: "",
    stageName: "",
    role: "",
    email: "",
    phone: "",
    password: "",
    status: "Active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setActor({ ...actor, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/actors", actor);
      setLoading(false);
      navigate("/actors"); // redirect to actors list
    } catch (err) {
      console.error(err);
      setError("Failed to add actor. Please check the details and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add New Actor</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="fullName"
            className="form-control"
            value={actor.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Stage Name</label>
          <input
            type="text"
            name="stageName"
            className="form-control"
            value={actor.stageName}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Role</label>
          <select
            name="role"
            className="form-select"
            value={actor.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="Lead Actor">Lead Actor</option>
            <option value="Supporting Actor">Supporting Actor</option>
            <option value="Choreographer">Choreographer</option>
            <option value="Singer">Singer</option>
            <option value="Dancer">Dancer</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={actor.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input
            type="text"
            name="phone"
            className="form-control"
            value={actor.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={actor.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-select"
            value={actor.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Actor"}
        </button>
      </form>
    </div>
  );
};

export default AddActor;
