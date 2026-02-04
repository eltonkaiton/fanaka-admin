// src/pages/SuspendedUsers.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SuspendedUsers = () => {
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch suspended users
  const fetchSuspendedUsers = async () => {
    try {
      const response = await fetch("https://fanaka-server-1.onrender.com/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      const suspended = data.filter(user => user.status === "Suspended");
      setSuspendedUsers(suspended);
    } catch (error) {
      console.error("Error fetching suspended users:", error);
      alert("Failed to load suspended users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuspendedUsers();
  }, []);

  // Handle updating user status
  const updateUserStatus = async (id, status) => {
    try {
      const response = await fetch(`https://fanaka-server-1.onrender.com/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      alert(`User status updated to ${status}`);
      fetchSuspendedUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status");
    }
  };

  // Handle deleting user
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`https://fanaka-server-1.onrender.com/api/users/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
      alert("User deleted successfully");
      fetchSuspendedUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  // Filter users by search term
  const filteredUsers = suspendedUsers.filter(
    user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-3">Suspended Users</h2>

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
        <p>Loading suspended users...</p>
      ) : filteredUsers.length === 0 ? (
        <p>No suspended users found.</p>
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
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => updateUserStatus(user._id, "Rejected")}
                    >
                      Reject
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
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
    </div>
  );
};

export default SuspendedUsers;
