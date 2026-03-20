import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdTheaterComedy, MdPersonAdd } from "react-icons/md";

function UserLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_ENDPOINTS = {
    audience: "https://fanaka-server-1.onrender.com/api/users/login",
    employee: "https://fanaka-server-1.onrender.com/api/employees/login",
    actor: "https://fanaka-server-1.onrender.com/api/actors/login",
  };

  const tryLogin = async (url) => {
    try {
      return await axios.post(url, { email, password });
    } catch {
      return null;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      // Audience login
      const audienceRes = await tryLogin(API_ENDPOINTS.audience);
      if (audienceRes?.data?.user) {
        const user = audienceRes.data.user;

        if (user.status !== "Active") {
          alert("Account inactive");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", audienceRes.data.token || "");
        localStorage.setItem("userType", "audience");
        localStorage.setItem("userName", user.fullName);
        localStorage.setItem("customerId", user._id);

        alert(`Welcome ${user.fullName}`);
        navigate("/home");
        return;
      }

      // Employee login
      const employeeRes = await tryLogin(API_ENDPOINTS.employee);
      if (employeeRes?.data?.employee) {
        const emp = employeeRes.data.employee;

        localStorage.setItem("token", employeeRes.data.token || "");
        localStorage.setItem("userName", emp.fullName);
        localStorage.setItem("employeeId", emp._id);
        localStorage.setItem("department", emp.department);

        let screen = "";
        let userType = "";

        switch (emp.department?.toLowerCase()) {
          case "production":
            screen = "/play-manager";
            userType = "manager";
            break;
          case "marketing":
            screen = "/inventory";
            userType = "inventory";
            break;
          case "finance":
            screen = "/finance";
            userType = "finance";
            break;
          case "supplier":
            screen = "/supplier";
            userType = "supplier";
            break;
          case "venue operations":
            screen = "/usher";
            userType = "usher";
            break;
          default:
            alert("No system privileges");
            setLoading(false);
            return;
        }

        localStorage.setItem("userType", userType);
        alert(`Welcome ${emp.fullName}`);
        navigate(screen);
        return;
      }

      // Actor login
      const actorRes = await tryLogin(API_ENDPOINTS.actor);
      if (actorRes?.data?.actor) {
        const actor = actorRes.data.actor;

        if (actor.status !== "Active") {
          alert("Actor account inactive");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", actorRes.data.token || "");
        localStorage.setItem("userType", "actor");
        localStorage.setItem("actorId", actor._id);
        localStorage.setItem("userName", actor.stageName || actor.fullName);

        alert(`Welcome ${actor.stageName || actor.fullName}`);
        navigate("/actor-home");
        return;
      }

      alert("Incorrect email or password");
    } catch (err) {
      console.log(err);
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.logo}>
        <MdTheaterComedy size={60} color="#e94560" />
        <h1>Fanaka Arts</h1>
        <p>Where Stories Come Alive</p>
      </div>

      <div style={styles.form}>
        <h2>Welcome Back</h2>
        <p>Sign in to continue</p>

        <div style={styles.inputBox}>
          <MdEmail />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={styles.inputBox}>
          <MdLock />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            style={styles.eye}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
          </button>
        </div>

        <button style={styles.loginBtn} onClick={handleLogin}>
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <button style={styles.registerBtn} onClick={() => navigate("/register")}>
          <MdPersonAdd /> Create New Account
        </button>

        <p style={styles.info}>
          <b>Departments:</b> Production, Marketing, Finance, Supplier, Venue Operations, Actor
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "#16213e",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  logo: {
    textAlign: "center",
    color: "white",
    marginBottom: 30,
  },
  form: {
    background: "white",
    padding: 30,
    borderRadius: 20,
    width: 350,
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  eye: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },
  loginBtn: {
    width: "100%",
    padding: 15,
    background: "#e94560",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: 10,
  },
  registerBtn: {
    width: "100%",
    padding: 12,
    background: "white",
    border: "2px solid #e94560",
    color: "#e94560",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  info: {
    marginTop: 15,
    fontSize: 12,
  },
};

export default UserLogin;