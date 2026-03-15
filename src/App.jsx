import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// COMPONENTS
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";

// AUTH
import Login from "./components/Login";
import Register from "./pages/Register";
import UserLogin from "./pages/UserLogin";

// AUDIENCE
import Home from "./pages/Home";
import MyBookings from "./pages/MyBookings";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import Help from "./pages/Help";
import AudienceChat from "./pages/AudienceChat";
import PlayDetails from "./pages/PlayDetails";

// PLAY MANAGER
import PlayManagerHome from "./pages/PlayManagerHome";
import CreatePlay from "./pages/CreatePlay";
import ManagePlays from "./pages/ManagePlays";
import AssignActors from "./pages/AssignActors";
import ManagerBookings from "./pages/ManagerBookings";

// OTHER PAGES (from second file)
import ActorHome from "./pages/ActorHome";
import InventoryHome from "./pages/InventoryHome";
import FinanceHome from "./pages/FinanceHome";
import Tickets from "./pages/Tickets";
import Order from "./pages/Order";
import InventoryOrders from "./pages/InventoryOrders";
import SupplierHome from "./pages/SupplierHome";
import Usher from "./pages/Usher";

// ===== NEW PAGES FROM FIRST FILE =====
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
// ======================================

// PROTECTED ROUTE
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// AUDIENCE SIDEBAR (FIXED)
const AudienceSidebar = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="d-flex flex-column p-3 bg-light" style={{ width: "220px", minHeight: "100vh" }}>
      <h5>Audience Menu</h5>

      <Link to="/home" className="btn btn-link">Home</Link>
      <Link to="/home/my-bookings" className="btn btn-link">My Bookings</Link>
      <Link to="/home/audience-chat" className="btn btn-link">Customer Support</Link>
      <Link to="/home/contact" className="btn btn-link">Contact Us</Link>
      <Link to="/home/about" className="btn btn-link">About Us</Link>
      <Link to="/home/help" className="btn btn-link">Help</Link>

      <button className="btn btn-danger mt-auto" onClick={handleLogout}>Logout</button>
    </div>
  );
};

// PLAY MANAGER SIDEBAR (FIXED: now all links include /play-manager/)
const PlayManagerSidebar = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
  return (
    <div className="d-flex flex-column p-3 bg-light" style={{ width: "220px", minHeight: "100vh" }}>
      <h5>Play Manager</h5>
      <Link to="/play-manager" className="btn btn-link">Dashboard</Link>
      <Link to="/play-manager/manager-bookings" className="btn btn-link">Manage Bookings</Link>
      <Link to="/play-manager/manage-plays" className="btn btn-link">Manage Plays</Link>
      <Link to="/play-manager/create-play" className="btn btn-link">Create Play</Link>
      <Link to="/play-manager/assign-actors" className="btn btn-link">Assign Actors</Link>
      <button className="btn btn-danger mt-auto" onClick={handleLogout}>Logout</button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div style={{ minHeight: "100vh", paddingBottom: "50px" }}>
        <Routes>
          {/* AUTH ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/register" element={<Register />} />

          {/* AUDIENCE ROUTES (protected + sidebar) */}
          <Route
            path="/home/*"
            element={
              <ProtectedRoute>
                <div className="d-flex" style={{ minHeight: "100vh" }}>
                  <AudienceSidebar />
                  <div className="flex-grow-1 p-3">
                    <Routes>
                      <Route path="" element={<Home />} />
                      <Route path="my-bookings" element={<MyBookings />} />
                      <Route path="audience-chat" element={<AudienceChat />} />
                      <Route path="contact" element={<ContactUs />} />
                      <Route path="about" element={<AboutUs />} />
                      <Route path="help" element={<Help />} />
                      <Route path="play-details/:id" element={<PlayDetails />} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* PLAY MANAGER ROUTES (protected + sidebar) */}
          <Route
            path="/play-manager/*"
            element={
              <ProtectedRoute>
                <div className="d-flex" style={{ minHeight: "100vh" }}>
                  <PlayManagerSidebar />
                  <div className="flex-grow-1 p-3">
                    <Routes>
                      <Route path="" element={<PlayManagerHome />} />
                      <Route path="create-play" element={<CreatePlay />} />
                      <Route path="manage-plays" element={<ManagePlays />} />
                      <Route path="assign-actors" element={<AssignActors />} />
                      <Route path="manager-bookings" element={<ManagerBookings />} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* OTHER PROTECTED PAGES (no sidebar) */}
          <Route path="/actor-home" element={<ProtectedRoute><ActorHome /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><InventoryHome /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><FinanceHome /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
          <Route path="/order" element={<ProtectedRoute><Order /></ProtectedRoute>} />
          <Route path="/inventory-orders" element={<ProtectedRoute><InventoryOrders /></ProtectedRoute>} />
          <Route path="/supplier-home" element={<ProtectedRoute><SupplierHome /></ProtectedRoute>} />
          <Route path="/usher" element={<ProtectedRoute><Usher /></ProtectedRoute>} />

          {/* ===== ROUTES FROM FIRST FILE ===== */}
          {/* Dashboard (already has a route at "/") */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Users */}
          <Route path="/add-user" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
          <Route path="/pending-users" element={<ProtectedRoute><PendingUsers /></ProtectedRoute>} />
          <Route path="/active-users" element={<ProtectedRoute><ActiveUsers /></ProtectedRoute>} />
          <Route path="/suspended-users" element={<ProtectedRoute><SuspendedUsers /></ProtectedRoute>} />
          <Route path="/rejected-users" element={<ProtectedRoute><RejectedUsers /></ProtectedRoute>} />

          {/* Employees */}
          <Route path="/add-employee" element={<ProtectedRoute><AddEmployee /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
          <Route path="/edit-employee/:id" element={<ProtectedRoute><EditEmployee /></ProtectedRoute>} />

          {/* Actors */}
          <Route path="/actors" element={<ProtectedRoute><Actors /></ProtectedRoute>} />
          <Route path="/add-actor" element={<ProtectedRoute><AddActor /></ProtectedRoute>} />
          <Route path="/edit-actor/:id" element={<ProtectedRoute><EditActor /></ProtectedRoute>} />
        </Routes>

        {/* Global Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;