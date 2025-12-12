// src/components/Dashboard.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleUserDropdown = () => setUserDropdownOpen(!userDropdownOpen);
  const toggleEmployeeDropdown = () => setEmployeeDropdownOpen(!employeeDropdownOpen);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Fetch users and employees from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, employeesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users"),
          axios.get("http://localhost:5000/api/employees"),
        ]);

        setUsers(usersRes.data);
        setEmployees(employeesRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading dashboard...</div>;

  // Compute counts for cards
  const activeUsers = users.filter(u => u.status === "Active").length;
  const pendingUsers = users.filter(u => u.status === "Pending").length;
  const suspendedUsers = users.filter(u => u.status === "Suspended").length;
  const totalEmployees = employees.length;

  // Prepare data for charts
  const pieData = [
    { name: "Active Users", value: activeUsers },
    { name: "Pending Users", value: pendingUsers },
    { name: "Suspended Users", value: suspendedUsers },
  ];

  const lineData = users.map((u, i) => ({
    name: u.fullName,
    Users: activeUsers + pendingUsers,
    Employees: totalEmployees,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FF8042"];

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className={`bg-dark text-white p-3 vh-100 position-fixed ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        style={{ transition: "all 0.3s ease", zIndex: 1000, overflowY: "auto" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-center mb-0 flex-grow-1">
            {sidebarOpen ? "Fanaka Admin" : "FA"}
          </h3>
          <button
            className="btn btn-sm btn-outline-light d-none d-md-block"
            onClick={toggleSidebar}
            style={{ marginLeft: "10px" }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link to="/" className="nav-link text-white d-flex align-items-center">
              <span className="me-2">📊</span>
              {sidebarOpen && <span>Dashboard</span>}
            </Link>
          </li>

          {/* Users Dropdown */}
          <li className="nav-item mb-2">
            <button
              className="btn btn-dark w-100 text-start d-flex align-items-center"
              onClick={toggleUserDropdown}
              style={{ paddingLeft: "0" }}
            >
              <span className="me-2">👥</span>
              {sidebarOpen && <span>Users</span>}
              {sidebarOpen && (
                <span className="ms-auto">{userDropdownOpen ? "▲" : "▼"}</span>
              )}
            </button>

            {userDropdownOpen && sidebarOpen && (
              <ul className="nav flex-column ms-4 mt-2">
                <li className="nav-item mb-1">
                  <Link to="/pending-users" className="nav-link text-white">Pending</Link>
                </li>
                <li className="nav-item mb-1">
                  <Link to="/active-users" className="nav-link text-white">Active</Link>
                </li>
                <li className="nav-item mb-1">
                  <Link to="/suspended-users" className="nav-link text-white">Suspended</Link>
                </li>
                <li className="nav-item mb-1">
                  <Link to="/rejected-users" className="nav-link text-white">Rejected</Link>
                </li>
                <li className="nav-item mb-1">
                  <Link to="/add-user" className="nav-link text-white">Add User</Link>
                </li>
              </ul>
            )}
          </li>

          {/* Employees Dropdown */}
          <li className="nav-item mb-2">
            <button
              className="btn btn-dark w-100 text-start d-flex align-items-center"
              onClick={toggleEmployeeDropdown}
              style={{ paddingLeft: "0" }}
            >
              <span className="me-2">💼</span>
              {sidebarOpen && <span>Employees</span>}
              {sidebarOpen && (
                <span className="ms-auto">{employeeDropdownOpen ? "▲" : "▼"}</span>
              )}
            </button>

            {employeeDropdownOpen && sidebarOpen && (
              <ul className="nav flex-column ms-4 mt-2">
                <li className="nav-item mb-1">
                  <Link to="/employees" className="nav-link text-white">All Employees</Link>
                </li>
                <li className="nav-item mb-1">
                  <Link to="/add-employee" className="nav-link text-white">Add Employee</Link>
                </li>
              </ul>
            )}
          </li>

          {/* Tickets */}
          <li className="nav-item mb-2">
            <Link to="/tickets" className="nav-link text-white d-flex align-items-center">
              <span className="me-2">🎟️</span>
              {sidebarOpen && <span>Tickets</span>}
            </Link>
          </li>

          {/* Actors */}
          <li className="nav-item mb-2">
            <Link to="/actors" className="nav-link text-white d-flex align-items-center">
              <span className="me-2">🎭</span>
              {sidebarOpen && <span>Actors</span>}
            </Link>
          </li>

          {/* Profile */}
          <li className="nav-item mb-2">
            <Link to="/profile" className="nav-link text-white d-flex align-items-center">
              <span className="me-2">👤</span>
              {sidebarOpen && <span>Profile</span>}
            </Link>
          </li>

          {/* Logout */}
          <li className="nav-item mb-2 mt-3">
            <button
              className="btn btn-danger w-100 text-start d-flex align-items-center"
              onClick={handleLogout}
            >
              <span className="me-2">🚪</span>
              {sidebarOpen && <span>Logout</span>}
            </button>
          </li>
        </ul>

        {sidebarOpen && (
          <div className="mt-5 pt-5 border-top">
            <div className="text-center">
              <p className="small text-muted mb-1">Fanaka Arts v1.0</p>
              <p className="small text-muted">© 2024 All rights reserved</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className="flex-grow-1 p-4"
        style={{
          marginLeft: sidebarOpen ? "250px" : "75px",
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        {/* Navbar */}
        <nav className="navbar navbar-light bg-white shadow-sm px-4 py-3 mb-4">
          <div className="d-flex align-items-center">
            <button className="btn btn-outline-secondary d-md-none" onClick={toggleSidebar}>
              ☰
            </button>
            <button
              className="btn btn-outline-secondary d-none d-md-block ms-3"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
            </button>
            <span className="ms-4 navbar-brand mb-0 h1 text-primary">Dashboard Overview</span>
          </div>
        </nav>

        {/* Dashboard Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <Link to="/active-users" className="text-decoration-none">
              <div className="card shadow-sm p-3 hover-card">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5>Active Users</h5>
                    <h3>{activeUsers}</h3>
                  </div>
                  <span style={{ fontSize: "2rem" }}>✅</span>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-4 mb-3">
            <Link to="/pending-users" className="text-decoration-none">
              <div className="card shadow-sm p-3 hover-card">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5>Pending Users</h5>
                    <h3>{pendingUsers}</h3>
                  </div>
                  <span style={{ fontSize: "2rem" }}>⏳</span>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-4 mb-3">
            <Link to="/employees" className="text-decoration-none">
              <div className="card shadow-sm p-3 hover-card">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5>All Employees</h5>
                    <h3>{totalEmployees}</h3>
                  </div>
                  <span style={{ fontSize: "2rem" }}>💼</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Charts */}
        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="card shadow-sm p-3">
              <h5 className="mb-3">User Registration Trend</h5>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Users" stroke="#8884d8" />
                  <Line type="monotone" dataKey="Employees" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="card shadow-sm p-3">
              <h5 className="mb-3">User Status Distribution</h5>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .sidebar-open {
          width: 250px;
        }
        .sidebar-closed {
          width: 75px;
        }
        @media (max-width: 768px) {
          .sidebar-open {
            width: 250px;
          }
          .sidebar-closed {
            width: 0;
            padding: 0 !important;
            overflow: hidden;
          }
          .flex-grow-1 {
            margin-left: 0 !important;
          }
        }
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 5px;
        }
        button.btn-dark:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .hover-card:hover {
          transform: scale(1.02);
          transition: 0.3s;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
