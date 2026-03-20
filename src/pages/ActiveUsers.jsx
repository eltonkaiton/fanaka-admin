// src/pages/ActiveUsers.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ActiveUsers = () => {
  const navigate = useNavigate();
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Toast state
  const [toasts, setToasts] = useState([]);
  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  // Processing states for buttons
  const [processingId, setProcessingId] = useState(null);

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

  // Fetch active users
  const fetchActiveUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      const active = data.filter((user) => user.status === "Active");
      setActiveUsers(active);
    } catch (error) {
      console.error("Error fetching active users:", error);
      showToast("Failed to load active users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
  }, []);

  // Suspend user — no token required
  const suspendUser = async (id) => {
    setProcessingId(id);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Suspended" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to suspend user");

      showToast("User has been suspended", "success");
      fetchActiveUsers();
    } catch (error) {
      console.error("Error suspending user:", error);
      showToast(error.message, "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Delete user — no token required
  const deleteUser = async (id) => {
    setProcessingId(id);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete user");

      showToast("User has been deleted", "success");
      fetchActiveUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast(error.message, "error");
    } finally {
      setProcessingId(null);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete._id);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Filter users by search term
  const filteredUsers = activeUsers.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toast Component
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
          <button onClick={() => removeToast(toast.id)} style={styles.toastClose}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );

  // Delete Confirmation Modal
  const DeleteConfirmModal = () => {
    if (!showDeleteModal) return null;
    return (
      <div style={styles.modalOverlay} onClick={cancelDelete}>
        <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.confirmModalHeader}>
            <h3>Confirm Delete</h3>
          </div>
          <p style={styles.confirmModalText}>
            Are you sure you want to delete user{" "}
            <strong>{userToDelete?.fullName || userToDelete?.username}</strong>?
            This action cannot be undone.
          </p>
          <div style={styles.confirmModalButtons}>
            <button
              style={styles.confirmModalCancel}
              onClick={cancelDelete}
              disabled={processingId}
            >
              Cancel
            </button>
            <button
              style={styles.confirmModalConfirm}
              onClick={confirmDelete}
              disabled={processingId === userToDelete?._id}
            >
              {processingId === userToDelete?._id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <DeleteConfirmModal />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-primary">Active Users</h2>
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
        <p>Loading active users...</p>
      ) : filteredUsers.length === 0 ? (
        <p>No active users found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-success">
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
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => suspendUser(user._id)}
                      disabled={processingId === user._id}
                    >
                      {processingId === user._id ? "Suspending..." : "Suspend"}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteClick(user)}
                      disabled={processingId === user._id}
                    >
                      {processingId === user._id ? "Deleting..." : "Delete"}
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
  confirmModalHeader: {
    marginBottom: "16px",
    textAlign: "center",
  },
  confirmModalText: {
    fontSize: "16px",
    color: "#333",
    textAlign: "center",
    marginBottom: "24px",
  },
  confirmModalButtons: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },
  confirmModalCancel: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#f5f5f5",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#e0e0e0",
    },
  },
  confirmModalConfirm: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#F44336",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#d32f2f",
    },
  },
};

// Add keyframes for toast animation
const styleSheet = document.styleSheets[0];
try {
  styleSheet.insertRule(
    `
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
  `,
    styleSheet.cssRules.length
  );
} catch (e) {
  // Ignore if rule already exists
}

export default ActiveUsers;