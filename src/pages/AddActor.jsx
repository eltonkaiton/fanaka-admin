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
  const [toasts, setToasts] = useState([]);

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

  const handleChange = (e) => {
    setActor({ ...actor, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/actors", actor);
      showToast("Actor added successfully!", "success");
      setLoading(false);
      setTimeout(() => navigate("/actors"), 1500); // Delay to show toast
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message ||
          "Failed to add actor. Please check the details and try again.",
        "error"
      );
      setLoading(false);
    }
  };

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
    <div className="container mt-4">
      <ToastContainer />
      <h2>Add New Actor</h2>

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

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/actors")}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Actor"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Inline styles for toast (can also use a separate CSS file)
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
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(styleSheet);

export default AddActor;