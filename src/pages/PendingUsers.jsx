// src/pages/PendingUsers.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PendingUsers = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState({ show: false, message: "", onConfirm: null, id: null, status: "" });
  const [processingId, setProcessingId] = useState(null);

  const showToast = (message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      const response = await fetch("https://fanaka-server-1.onrender.com/api/users");

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      const pending = data.filter(user => user.status === "Pending");
      setPendingUsers(pending);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      showToast("Failed to load pending users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // Update user status (Approve / Reject)
  const updateUserStatus = async (id, status) => {
    setProcessingId(id);
    try {
      const response = await fetch(
        `https://fanaka-server-1.onrender.com/api/users/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      showToast(`User ${status === "Active" ? "approved" : "rejected"} successfully`, "success");
      fetchPendingUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      showToast(error.message, "error");
    } finally {
      setProcessingId(null);
      setConfirm({ show: false, message: "", onConfirm: null, id: null, status: "" });
    }
  };

  const handleApprove = (id, username) => {
    setConfirm({
      show: true,
      message: `Are you sure you want to approve ${username}?`,
      onConfirm: () => updateUserStatus(id, "Active"),
    });
  };

  const handleReject = (id, username) => {
    setConfirm({
      show: true,
      message: `Are you sure you want to reject ${username}?`,
      onConfirm: () => updateUserStatus(id, "Rejected"),
    });
  };

  // Filter users based on search
  const filteredUsers = pendingUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ToastContainer = () => (
    <div style={styles.toastContainer}>
      {toasts.map(toast => (
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
          <button onClick={() => removeToast(toast.id)} style={styles.toastClose}>✕</button>
        </div>
      ))}
    </div>
  );

  const ConfirmModal = () => confirm.show && (
    <div style={styles.modalOverlay} onClick={() => setConfirm({ ...confirm, show: false })}>
      <div style={styles.confirmModal} onClick={e => e.stopPropagation()}>
        <h3>Confirm Action</h3>
        <p>{confirm.message}</p>
        <div style={styles.confirmButtons}>
          <button
            style={styles.cancelBtn}
            onClick={() => setConfirm({ ...confirm, show: false })}
          >
            Cancel
          </button>
          <button
            style={styles.confirmBtn}
            onClick={confirm.onConfirm}
            disabled={processingId !== null}
          >
            {processingId ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <ToastContainer />
      <ConfirmModal />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-primary">Pending Users</h2>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by username, full name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading pending users...</p>
      ) : filteredUsers.length === 0 ? (
        <p>No pending users found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-primary">
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.role}</td>
                  <td>{user.status}</td>
                  <td>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleApprove(user._id, user.username)}
                      disabled={processingId === user._id}
                    >
                      {processingId === user._id ? "Processing..." : "Approve"}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleReject(user._id, user.username)}
                      disabled={processingId === user._id}
                    >
                      {processingId === user._id ? "Processing..." : "Reject"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Styles for toast and modal
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
  toastSuccess: { backgroundColor: "#4CAF50" },
  toastError: { backgroundColor: "#F44336" },
  toastWarning: { backgroundColor: "#FF9800" },
  toastInfo: { backgroundColor: "#2196F3" },
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1500,
  },
  confirmModal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "400px",
    width: "90%",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  confirmButtons: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "20px",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#f5f5f5",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
  },
  confirmBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#6200EE",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
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

export default PendingUsers;