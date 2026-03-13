// src/pages/AssignActors.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function AssignActors() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playId, playTitle } = location.state || {}; // getting state from navigation
  const [actors, setActors] = useState([]);
  const [selectedActors, setSelectedActors] = useState([]);
  const [actorRoles, setActorRoles] = useState({}); // key: actorId, value: role

  // Fetch all active actors
  const fetchActors = async () => {
    try {
      const response = await axios.get(
        "https://fanaka-server-1.onrender.com/api/actors?status=Active"
      );
      setActors(response.data);
    } catch (error) {
      console.log("Fetch Actors Error:", error?.response?.data || error);
      alert("Failed to fetch actors.");
    }
  };

  useEffect(() => {
    fetchActors();
  }, []);

  const toggleSelectActor = (actorId) => {
    if (selectedActors.includes(actorId)) {
      setSelectedActors(selectedActors.filter((id) => id !== actorId));
      const newRoles = { ...actorRoles };
      delete newRoles[actorId];
      setActorRoles(newRoles);
    } else {
      setSelectedActors([...selectedActors, actorId]);
    }
  };

  const handleAssignActors = async () => {
    if (selectedActors.length === 0) {
      alert("Please select at least one actor.");
      return;
    }

    const actorsToAssign = selectedActors.map((actorId) => ({
      actor: actorId,
      role: actorRoles[actorId] || "Actor",
    }));

    try {
      const API_URL = `https://fanaka-server-1.onrender.com/api/plays/${playId}/assign-actors`;
      const response = await axios.post(API_URL, { actors: actorsToAssign });

      if (response.status === 200) {
        alert("Actors assigned successfully!");
        navigate(-1); // go back
      } else {
        alert("Failed to assign actors.");
      }
    } catch (error) {
      console.log("Assign Actors Error:", error?.response?.data || error.message);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-4">
        Assign Actors to "{playTitle || "Play"}"
      </h3>

      {actors.length === 0 ? (
        <p className="text-center">No active actors available.</p>
      ) : (
        <div className="list-group">
          {actors.map((actor) => (
            <div
              key={actor._id}
              className={`list-group-item mb-2 ${
                selectedActors.includes(actor._id) ? "list-group-item-primary" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => toggleSelectActor(actor._id)}
            >
              <strong>{actor.fullName}</strong> ({actor.stageName || "No Stage Name"})
              <div>Email: {actor.email}</div>
              <div>Phone: {actor.phone}</div>
              <div>Status: {actor.status}</div>
              {selectedActors.includes(actor._id) && (
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Role in this play"
                  value={actorRoles[actor._id] || ""}
                  onChange={(e) =>
                    setActorRoles({ ...actorRoles, [actor._id]: e.target.value })
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-3">
        <button className="btn btn-success" onClick={handleAssignActors}>
          Assign Selected Actors
        </button>
      </div>
    </div>
  );
}