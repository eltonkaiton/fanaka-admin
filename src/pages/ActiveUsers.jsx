// src/components/ActiveUsers.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ActiveUsers = () => {
  const navigate = useNavigate();
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch active users
  const fetchActiveUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      const active = data.filter(user => user.status === "Active");
      setActiveUsers(active);
    } catch (error) {
      console.error("Error fetching active users:", error);
      alert("Failed to load active users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
  }, []);

  // Handle status update (suspend)
  const suspendUser = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Suspended" }),
      });

      if (!response.ok) throw new Error("Failed to suspend user");

      alert("User has been suspended");
      fetchActiveUsers(); // refresh list
    } catch (error) {
      console.error("Error suspending user:", error);
      alert("Failed to suspend user");
    }
  };

  // Handle delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      alert("User has been deleted");
      fetchActiveUsers(); // refresh list
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  // Filter users by search term
  const filteredUsers = activeUsers.filter(
    user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
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
          onChange={e => setSearchTerm(e.target.value)}
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
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => suspendUser(user._id)}
                    >
                      Suspend
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
    </div>
  );
};

export default ActiveUsers;
