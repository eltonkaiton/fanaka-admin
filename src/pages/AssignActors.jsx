import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function AssignActors() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playId, playTitle } = location.state || {};
  const [actors, setActors] = useState([]);
  const [selectedActors, setSelectedActors] = useState([]);
  const [actorRoles, setActorRoles] = useState({});
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast functions
  const showToast = (message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Fetch all active actors
  const fetchActors = async () => {
    try {
      const response = await axios.get(
        "https://fanaka-server-1.onrender.com/api/actors?status=Active"
      );
      setActors(response.data);
    } catch (error) {
      console.log("Fetch Actors Error:", error?.response?.data || error);
      showToast("Failed to fetch actors.", "error");
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

  const handleRoleChange = (actorId, role) => {
    setActorRoles({ ...actorRoles, [actorId]: role });
  };

  const handleAssignActors = async () => {
    if (selectedActors.length === 0) {
      showToast("Please select at least one actor.", "warning");
      return;
    }

    setLoading(true);
    const actorsToAssign = selectedActors.map((actorId) => ({
      actor: actorId,
      role: actorRoles[actorId] || "Actor",
    }));

    try {
      const API_URL = `https://fanaka-server-1.onrender.com/api/plays/${playId}/assign-actors`;
      const response = await axios.post(API_URL, { actors: actorsToAssign });

      if (response.status === 200) {
        showToast("Actors assigned successfully!", "success");
        setTimeout(() => navigate(-1), 1500);
      } else {
        showToast("Failed to assign actors.", "error");
      }
    } catch (error) {
      console.log("Assign Actors Error:", error?.response?.data || error.message);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Toast Container Component
  const ToastContainer = () => (
    <div style={styles.toastContainer}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            ...styles.toast,
            ...(toast.type === "success" && styles.toastSuccess),
            ...(toast.type === "error" && styles.toastError),
            ...(toast.type === "warning" && styles.toastWarning),
            ...(toast.type === "info" && styles.toastInfo),
          }}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={styles.toastClose}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mt-4" style={{ position: "relative" }}>
      <ToastContainer />
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
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleRoleChange(actor._id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-3">
        <button
          className="btn btn-success"
          onClick={handleAssignActors}
          disabled={loading}
        >
          {loading ? "Assigning..." : "Assign Selected Actors"}
        </button>
      </div>
    </div>
  );
}

// Inline styles for toast (same as previous examples)
const styles = {
  toastContainer: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 2000,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: "250px",
    maxWidth: "400px",
    padding: "12px 16px",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    animation: "slideIn 0.3s ease",
  },
  toastSuccess: {
    backgroundColor: "#4CAF50",
  },
  toastError: {
    backgroundColor: "#F44336",
  },
  toastWarning: {
    backgroundColor: "#FF9800",
  },
  toastInfo: {
    backgroundColor: "#2196F3",
  },
  toastClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    marginLeft: "12px",
    padding: 0,
    color: "#fff",
    fontSize: "18px",
    lineHeight: 1,
  },
};

// Add keyframes for toast animation
(() => {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
})();