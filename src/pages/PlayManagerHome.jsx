import React from "react";
import { useNavigate } from "react-router-dom";
import {
  IoAddCircleOutline,
  IoAlbumsOutline,
  IoReceiptOutline,
  IoLogOutOutline,
} from "react-icons/io5";

export default function PlayManagerHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      alert("Logged out successfully");
      navigate("/login");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Play Manager Dashboard</h1>

      <button style={styles.button} onClick={() => navigate("/create-play")}>
        <IoAddCircleOutline size={22} color="#fff" />
        <span style={styles.buttonText}>Create New Play</span>
      </button>

      <button style={styles.button} onClick={() => navigate("/manage-plays")}>
        <IoAlbumsOutline size={22} color="#fff" />
        <span style={styles.buttonText}>Manage Existing Plays</span>
      </button>

      <button style={styles.button} onClick={() => navigate("/manager-bookings")}>
        <IoReceiptOutline size={22} color="#fff" />
        <span style={styles.buttonText}>View Bookings</span>
      </button>

      <button style={{ ...styles.button, backgroundColor: "#ff4444" }} onClick={handleLogout}>
        <IoLogOutOutline size={22} color="#fff" />
        <span style={styles.buttonText}>Logout</span>
      </button>
    </div>
  );
}

// Inline styles
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  title: {
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "30px",
    textAlign: "center",
    color: "#333",
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    maxWidth: "300px",
    padding: "15px",
    borderRadius: "10px",
    backgroundColor: "#6200EE",
    border: "none",
    cursor: "pointer",
    marginBottom: "15px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "background-color 0.2s",
  },
  buttonText: {
    color: "#fff",
    fontSize: "18px",
    fontWeight: "500",
  },
};