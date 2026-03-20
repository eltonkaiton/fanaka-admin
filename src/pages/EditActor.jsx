// src/pages/EditActor.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EditActor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actor, setActor] = useState({
    fullName: "",
    role: "",
    status: "Active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch actor data
  useEffect(() => {
    const fetchActor = async () => {
      try {
        const res = await axios.get(`https://fanaka-server-1.onrender.com/api/actors/${id}`);
        setActor(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load actor.");
      }
    };
    fetchActor();
  }, [id]);

  const handleChange = (e) => {
    setActor({ ...actor, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`https://fanaka-server-1.onrender.com/api/actors/${id}`, actor);
      setLoading(false);
      navigate("/actors"); // redirect to actors list
    } catch (err) {
      console.error(err);
      setError("Failed to update actor.");
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Edit Actor</h2>
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
          <label className="form-label">Role</label>
          <input
            type="text"
            name="role"
            className="form-control"
            value={actor.role}
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
          {loading ? "Updating..." : "Update Actor"}
        </button>
      </form>
    </div>
  );
};

export default EditActor;
