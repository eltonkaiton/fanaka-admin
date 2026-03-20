// src/pages/RejectedUsers.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RejectedUsers = () => {
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Toast and confirmation state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [confirm, setConfirm] = useState({ show: false, message: "", onConfirm: null });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirm({ show: true, message, onConfirm });
  };

  // Fetch rejected users
  const fetchRejectedUsers = async () => {
    try {
      const response = await fetch("https://fanaka-server-1.onrender.com/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      const rejected = data.filter(user => user.status === "Rejected");
      setRejectedUsers(rejected);
    } catch (error) {
      console.error("Error fetching rejected users:", error);
      showToast("Failed to load rejected users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedUsers();
  }, []);

  // Update user status (Reactivate) — no token required
  const updateUserStatus = async (id, status) => {
    try {
      const response = await fetch(`https://fanaka-server-1.onrender.com/api/users/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to update status");

      showToast(`User status updated to ${status}`, "success");
      fetchRejectedUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      showToast(error.message, "error");
    }
  };

  // Delete user (optional auth)
  const deleteUser = async (id) => {
    showConfirm("Are you sure you want to delete this user?", async () => {
      try {
        const response = await fetch(`https://fanaka-server-1.onrender.com/api/users/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete user");
        showToast("User deleted successfully", "success");
        fetchRejectedUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        showToast("Failed to delete user", "error");
      }
    });
  };

  // Filter users by search term
  const filteredUsers = rejectedUsers.filter(
    user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Styles for toast and confirm
  const styles = {
    toast: {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "12px 20px",
      borderRadius: "8px",
      color: "#fff",
      fontWeight: "500",
      zIndex: 2000,
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      maxWidth: "300px",
    },
    toastSuccess: { backgroundColor: "#4CAF50" },
    toastError: { backgroundColor: "#F44336" },
    toastInfo: { backgroundColor: "#2196F3" },
    confirmOverlay: {
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
    confirmContent: {
      backgroundColor: "#fff",
      borderRadius: "12px",
      padding: "24px",
      maxWidth: "400px",
      width: "90%",
      textAlign: "center",
    },
    confirmButtons: {
      display: "flex",
      gap: "12px",
      marginTop: "20px",
      justifyContent: "center",
    },
    cancelBtn: {
      flex: 1,
      backgroundColor: "#f5f5f5",
      border: "none",
      borderRadius: "8px",
      padding: "12px",
      fontWeight: "600",
      cursor: "pointer",
    },
    confirmBtn: {
      flex: 1,
      backgroundColor: "#6200EE",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "12px",
      fontWeight: "600",
      cursor: "pointer",
    },
  };

  return (
    <div className="container mt-4" style={{ position: "relative" }}>
      <h2 className="text-primary mb-3">Rejected Users</h2>

      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by username, full name, or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading rejected users...</p>
      ) : filteredUsers.length === 0 ? (
        <p>No rejected users found.</p>
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
              {filteredUsers.map(user => (
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
                      onClick={() => updateUserStatus(user._id, "Active")}
                    >
                      Reactivate
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            ...styles.toast,
            ...(toast.type === "success" ? styles.toastSuccess : {}),
            ...(toast.type === "error" ? styles.toastError : {}),
            ...(toast.type === "info" ? styles.toastInfo : {}),
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirm.show && (
        <div style={styles.confirmOverlay} onClick={() => setConfirm({ show: false, message: "", onConfirm: null })}>
          <div style={styles.confirmContent} onClick={(e) => e.stopPropagation()}>
            <p>{confirm.message}</p>
            <div style={styles.confirmButtons}>
              <button
                style={styles.cancelBtn}
                onClick={() => setConfirm({ show: false, message: "", onConfirm: null })}
              >
                Cancel
              </button>
              <button
                style={styles.confirmBtn}
                onClick={() => {
                  confirm.onConfirm();
                  setConfirm({ show: false, message: "", onConfirm: null });
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectedUsers;