// src/components/Actors.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Actors = () => {
  const navigate = useNavigate();
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all actors from backend
  useEffect(() => {
    const fetchActors = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/actors"); // Update API if needed
        setActors(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching actors:", error);
        setLoading(false);
      }
    };

    fetchActors();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading actors...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>All Actors</h2>
        <Link to="/add-actor" className="btn btn-primary">
          + Add Actor
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {actors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-3">
                    No actors found.
                  </td>
                </tr>
              ) : (
                actors.map((actor, index) => (
                  <tr key={actor._id}>
                    <td>{index + 1}</td>
                    <td>{actor.fullName}</td>
                    <td>{actor.email}</td>
                    <td>{actor.phone || "-"}</td>
                    <td>{actor.status || "Active"}</td>
                    <td>
                      <Link
                        to={`/edit-actor/${actor._id}`}
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(actor._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Delete actor function
  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this actor?")) {
      try {
        await axios.delete(`http://localhost:5000/api/actors/${id}`);
        setActors(prev => prev.filter(actor => actor._id !== id));
      } catch (error) {
        console.error("Error deleting actor:", error);
      }
    }
  }
};

export default Actors;
