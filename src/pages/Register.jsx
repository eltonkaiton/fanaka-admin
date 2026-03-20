import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  };

  const handleRegister = async () => {
    // Basic validation
    if (!username || !fullName || !email || !phone || !password || !confirmPassword) {
      showToast("All fields are required", "error");
      return;
    }

    if (phone.length < 10) {
      showToast("Phone number must be at least 10 digits", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/users/register`, {
        username,
        fullName,
        email,
        phone,
        password,
        role: "Audience", // default role for viewer/customer
      });

      showToast("Registration completed. You can now login.", "success");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.log("Registration error:", error.response?.data || error.message);
      showToast(error.response?.data?.error || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h1 style={styles.title}>Fanaka Arts Register</h1>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <input
            type="text"
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            style={styles.input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoCapitalize="none"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Phone</label>
          <input
            type="tel"
            style={styles.input}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Confirm Password</label>
          <input
            type="password"
            style={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
          />
        </div>

        <button
          style={styles.button}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>

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
    </div>
  );
}

// Inline styles (updated with toast styles)
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    position: "relative",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "40px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "30px",
    textAlign: "center",
    color: "#333",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "600",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#6200EE",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
    transition: "background-color 0.2s",
  },
  loginText: {
    marginTop: "20px",
    textAlign: "center",
    color: "#666",
  },
  link: {
    color: "#6200EE",
    cursor: "pointer",
    textDecoration: "underline",
  },
  // Toast styles
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
};