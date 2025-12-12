// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";

// Users
import AddUser from "./pages/AddUser";
import PendingUsers from "./pages/PendingUsers";
import ActiveUsers from "./pages/ActiveUsers";
import SuspendedUsers from "./pages/SuspendedUsers";
import RejectedUsers from "./pages/RejectedUsers";

// Employees
import AddEmployee from "./pages/AddEmployee";
import Employees from "./pages/AllEmployees";
import EditEmployee from "./pages/EditEmployee";

// Actors
import Actors from "./pages/Actors";
import AddActor from "./pages/AddActor";
import EditActor from "./pages/EditActor";

// Auth
import Login from "./components/Login";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Footer Component
const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#222",
        color: "#fff",
        textAlign: "center",
        padding: "12px 0",
        position: "fixed",
        width: "100%",
        bottom: 0,
        zIndex: 1000,
      }}
    >
      &copy; {new Date().getFullYear()} Forge Reactor. All rights reserved.
    </footer>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div style={{ minHeight: "100vh", paddingBottom: "50px" }}>
        <Routes>
          {/* LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* DASHBOARD */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* USERS */}
          <Route
            path="/add-user"
            element={
              <ProtectedRoute>
                <AddUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pending-users"
            element={
              <ProtectedRoute>
                <PendingUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/active-users"
            element={
              <ProtectedRoute>
                <ActiveUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suspended-users"
            element={
              <ProtectedRoute>
                <SuspendedUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rejected-users"
            element={
              <ProtectedRoute>
                <RejectedUsers />
              </ProtectedRoute>
            }
          />

          {/* EMPLOYEES */}
          <Route
            path="/add-employee"
            element={
              <ProtectedRoute>
                <AddEmployee />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-employee/:id"
            element={
              <ProtectedRoute>
                <EditEmployee />
              </ProtectedRoute>
            }
          />

          {/* ACTORS */}
          <Route
            path="/actors"
            element={
              <ProtectedRoute>
                <Actors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-actor"
            element={
              <ProtectedRoute>
                <AddActor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-actor/:id"
            element={
              <ProtectedRoute>
                <EditActor />
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* Global Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
