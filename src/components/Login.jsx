import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // All possible login endpoints
  const endpoints = {
    admin: "http://localhost:5000/api/admin/login",
    audience: "http://localhost:5000/api/users/login",
    employee: "http://localhost:5000/api/employees/login",
    actor: "http://localhost:5000/api/actors/login",
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // Helper to test a single endpoint
  const tryLogin = async (url) => {
    try {
      return await axios.post(url, credentials);
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!credentials.email || !credentials.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    // Try admin first (local server)
    let response = await tryLogin(endpoints.admin);
    if (response?.data?.admin) {
      const { token, admin } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("adminName", admin.fullName);
      localStorage.setItem("userType", "admin");

      if (rememberMe) localStorage.setItem("rememberedEmail", credentials.email);
      else localStorage.removeItem("rememberedEmail");

      navigate("/");
      setLoading(false);
      return;
    }

    // Try audience
    response = await tryLogin(endpoints.audience);
    if (response?.data?.user) {
      const user = response.data.user;
      if (user.status !== "Active") {
        setError("Account is inactive. Please contact support.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", response.data.token || "");
      localStorage.setItem("userType", "audience");
      localStorage.setItem("userName", user.fullName);
      localStorage.setItem("customerId", user._id);

      if (rememberMe) localStorage.setItem("rememberedEmail", credentials.email);
      else localStorage.removeItem("rememberedEmail");

      navigate("/home");
      setLoading(false);
      return;
    }

    // Try employee
    response = await tryLogin(endpoints.employee);
    if (response?.data?.employee) {
      const emp = response.data.employee;
      localStorage.setItem("token", response.data.token || "");
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
          screen = "/supplier-home";
          userType = "supplier";
          break;
        case "venue operations":
          screen = "/usher";
          userType = "usher";
          break;
        default:
          setError("Your department has no system access.");
          setLoading(false);
          return;
      }

      localStorage.setItem("userType", userType);
      if (rememberMe) localStorage.setItem("rememberedEmail", credentials.email);
      else localStorage.removeItem("rememberedEmail");

      navigate(screen);
      setLoading(false);
      return;
    }

    // Try actor
    response = await tryLogin(endpoints.actor);
    if (response?.data?.actor) {
      const actor = response.data.actor;
      if (actor.status !== "Active") {
        setError("Actor account is inactive.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", response.data.token || "");
      localStorage.setItem("userType", "actor");
      localStorage.setItem("actorId", actor._id);
      localStorage.setItem("userName", actor.stageName || actor.fullName);

      if (rememberMe) localStorage.setItem("rememberedEmail", credentials.email);
      else localStorage.removeItem("rememberedEmail");

      navigate("/actor-home");
      setLoading(false);
      return;
    }

    // If none worked
    setError("Invalid email or password. Please try again.");
    setLoading(false);
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setCredentials(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="login-page" style={styles.page}>
      <div className="background-overlay" style={styles.backgroundOverlay}></div>
      <div className="background-pattern" style={styles.backgroundPattern}></div>

      <div className="container-fluid">
        <div className="row justify-content-center align-items-center min-vh-100">
          {/* Left side - clean brand presentation */}
          <div className="col-lg-6 col-md-8 d-none d-lg-flex flex-column justify-content-center align-items-center p-5" style={styles.brandSection}>
            <div className="brand-content text-center">
              <div className="logo-container mb-4">
                <div style={styles.logo}>
                  <i className="fas fa-theater-masks" style={styles.logoIcon}></i>
                </div>
              </div>
              <h1 className="display-4 fw-bold text-white mb-3">Fanaka Arts</h1>
              <p className="lead text-light opacity-75">Sign in to access your dashboard</p>
            </div>
          </div>

          {/* Right side - login form */}
          <div className="col-lg-6 col-md-12 d-flex align-items-center justify-content-center p-5">
            <div className="login-card shadow-lg" style={styles.loginCard}>
              <div className="card-body p-5">
                <div className="text-center mb-5">
                  <div className="logo-sm d-lg-none mb-4">
                    <div style={styles.logoSm}>
                      <i className="fas fa-theater-masks" style={styles.logoIconSm}></i>
                    </div>
                  </div>
                  <h2 className="fw-bold text-primary mb-2">Welcome Back</h2>
                  <p className="text-muted">Sign in with your email and password</p>
                </div>

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert" style={styles.errorAlert}>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      <span>{error}</span>
                    </div>
                    <button type="button" className="btn-close" onClick={() => setError("")}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold">
                      <i className="fas fa-envelope me-2 text-primary"></i>Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-user text-muted"></i>
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control py-3 border-start-0"
                        placeholder="enter your email"
                        value={credentials.email}
                        onChange={handleChange}
                        required
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label htmlFor="password" className="form-label fw-semibold">
                        <i className="fas fa-lock me-2 text-primary"></i>Password
                      </label>
                      <a href="#" className="text-decoration-none small text-primary">Forgot password?</a>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-key text-muted"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        className="form-control py-3 border-start-0"
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                        style={styles.input}
                      />
                      <button
                        type="button"
                        className="input-group-text bg-light border-start-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-muted`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={styles.checkbox}
                      />
                      <label className="form-check-label text-muted" htmlFor="rememberMe">Remember me</label>
                    </div>
                    <div className="form-text mt-2">
                      <small className="text-muted">
                        By signing in, you agree to our
                        <a href="#" className="text-primary text-decoration-none ms-1">Terms of Service</a>
                        <span className="mx-1">and</span>
                        <a href="#" className="text-primary text-decoration-none ms-1">Privacy Policy</a>
                      </small>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 mb-3 fw-semibold"
                    disabled={loading}
                    style={styles.submitButton}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Sign In
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-muted mb-0">
                      New here? <Link to="/register" className="text-primary text-decoration-none fw-semibold">Create an account</Link>
                    </p>
                  </div>

                  <div className="text-center mt-4 pt-3 border-top">
                    <p className="text-muted mb-2">
                      <small>© {new Date().getFullYear()} Fanaka Arts. All rights reserved.</small>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </div>
  );
};

const styles = {
  page: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', position: 'relative' },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)'
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
  },
  brandSection: { background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%)', backdropFilter: 'blur(10px)' },
  logo: { width: '100px', height: '100px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', transform: 'rotate(-5deg)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' },
  logoIcon: { fontSize: '50px', color: 'white' },
  logoSm: { width: '70px', height: '70px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', transform: 'rotate(-5deg)' },
  logoIconSm: { fontSize: '35px', color: 'white' },
  loginCard: { background: 'white', borderRadius: '20px', maxWidth: '450px', width: '100%' },
  errorAlert: { borderRadius: '10px', border: 'none', background: 'linear-gradient(to right, #ffebee, #ffcdd2)' },
  input: { borderLeft: 'none', borderRight: 'none', fontSize: '1rem' },
  checkbox: { borderColor: '#667eea', cursor: 'pointer' },
  submitButton: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '10px', fontSize: '1rem', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' },
};

export default Login;