// src/components/PendingUsers.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PendingUsers = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      const response = await fetch("https://fanaka-server-1.onrender.com/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      const pending = data.filter(user => user.status === "Pending");
      setPendingUsers(pending);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      alert("Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // Handle status update
  const updateUserStatus = async (id, status) => {
    try {
      const response = await fetch(`https://fanaka-server-1.onrender.com/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      alert(`User status updated to ${status}`);
      fetchPendingUsers(); // refresh list
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status");
    }
  };

  // Filter users by search term
  const filteredUsers = pendingUsers.filter(
    user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
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
          onChange={e => setSearchTerm(e.target.value)}
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
                      Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => updateUserStatus(user._id, "Rejected")}
                    >
                      Reject
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

export default PendingUsers;
