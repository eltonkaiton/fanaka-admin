// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Basic frontend validation
    if (!credentials.email || !credentials.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://fanaka-server-1.onrender.com/api/admin/login",
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { token, admin } = response.data;

      // Save token in localStorage for authentication
      localStorage.setItem("token", token);
      localStorage.setItem("adminName", admin.fullName);
      
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", credentials.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Redirect to dashboard
      navigate("/");
    } catch (err) {
      console.error(err);
      // Show backend error message or default
      setError(err.response?.data?.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check for remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setCredentials(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="login-page" style={styles.page}>
      {/* Background with overlay */}
      <div className="background-overlay" style={styles.backgroundOverlay}>
        <div className="background-pattern" style={styles.backgroundPattern}></div>
      </div>

      {/* Main Container */}
      <div className="container-fluid">
        <div className="row justify-content-center align-items-center min-vh-100">
          {/* Left Side - Branding */}
          <div className="col-lg-6 col-md-8 d-none d-lg-flex flex-column justify-content-center align-items-center p-5" style={styles.brandSection}>
            <div className="brand-content text-center">
              <div className="logo-container mb-4">
                <div style={styles.logo}>
                  <i className="fas fa-theater-masks" style={styles.logoIcon}></i>
                </div>
              </div>
              
              <h1 className="display-4 fw-bold text-white mb-3">Fanaka Arts</h1>
              <h2 className="h3 text-light mb-4">Admin Portal</h2>
              
              <p className="lead text-light opacity-75 mb-4">
                Manage your artists, bookings, and performances with our comprehensive admin dashboard.
              </p>
              
              <div className="features-list text-start text-light">
                <div className="d-flex align-items-center mb-3">
                  <div className="feature-icon me-3" style={styles.featureIcon}>
                    <i className="fas fa-user-shield"></i>
                  </div>
                  <div>
                    <h6 className="mb-1">Secure Access</h6>
                    <small className="opacity-75">Enterprise-grade security for your data</small>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <div className="feature-icon me-3" style={styles.featureIcon}>
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div>
                    <h6 className="mb-1">Analytics Dashboard</h6>
                    <small className="opacity-75">Real-time insights and reports</small>
                  </div>
                </div>
                
                <div className="d-flex align-items-center">
                  <div className="feature-icon me-3" style={styles.featureIcon}>
                    <i className="fas fa-users-cog"></i>
                  </div>
                  <div>
                    <h6 className="mb-1">Team Management</h6>
                    <small className="opacity-75">Manage all your staff and artists</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="col-lg-6 col-md-12 d-flex align-items-center justify-content-center p-5">
            <div className="login-card shadow-lg" style={styles.loginCard}>
              <div className="card-body p-5">
                {/* Form Header */}
                <div className="text-center mb-5">
                  <div className="logo-sm d-lg-none mb-4">
                    <div style={styles.logoSm}>
                      <i className="fas fa-theater-masks" style={styles.logoIconSm}></i>
                    </div>
                  </div>
                  <h2 className="fw-bold text-primary mb-2">Welcome Back</h2>
                  <p className="text-muted">Sign in to your admin account</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert" style={styles.errorAlert}>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      <span>{error}</span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError("")}
                    ></button>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      Email Address
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
                        placeholder="admin@fanakaarts.com"
                        value={credentials.email}
                        onChange={handleChange}
                        required
                        style={styles.input}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label htmlFor="password" className="form-label fw-semibold">
                        <i className="fas fa-lock me-2 text-primary"></i>
                        Password
                      </label>
                      <a href="#" className="text-decoration-none small text-primary">
                        Forgot password?
                      </a>
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

                  {/* Remember Me & Terms */}
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
                      <label className="form-check-label text-muted" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <div className="form-text mt-2">
                      <small className="text-muted">
                        By signing in, you agree to our 
                        <a href="#" className="text-primary text-decoration-none ms-1"> Terms of Service</a> 
                        <span className="mx-1">and</span>
                        <a href="#" className="text-primary text-decoration-none ms-1"> Privacy Policy</a>
                      </small>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 mb-4 fw-semibold"
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
                        Sign In to Dashboard
                      </>
                    )}
                  </button>

                  {/* Footer */}
                  <div className="text-center mt-5 pt-4 border-top">
                    <p className="text-muted mb-2">
                      <small>© {new Date().getFullYear()}Forge reactor. All rights reserved.</small>
                    </p>
                  
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
    </div>
  );
};

// Inline styles for better control
const styles = {
  page: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    position: 'relative',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  },
  brandSection: {
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%)',
    backdropFilter: 'blur(10px)',
  },
  logo: {
    width: '100px',
    height: '100px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    transform: 'rotate(-5deg)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
  },
  logoIcon: {
    fontSize: '50px',
    color: 'white',
  },
  logoSm: {
    width: '70px',
    height: '70px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    transform: 'rotate(-5deg)',
  },
  logoIconSm: {
    fontSize: '35px',
    color: 'white',
  },
  featureIcon: {
    width: '40px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
  },
  loginCard: {
    background: 'white',
    borderRadius: '20px',
    maxWidth: '450px',
    width: '100%',
  },
  errorAlert: {
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(to right, #ffebee, #ffcdd2)',
  },
  input: {
    borderLeft: 'none',
    borderRight: 'none',
    fontSize: '1rem',
  },
  checkbox: {
    borderColor: '#667eea',
    cursor: 'pointer',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  '@media (max-width: 768px)': {
    loginCard: {
      margin: '20px',
    }
  }
};

export default Login;