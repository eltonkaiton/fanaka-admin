import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoAddCircleOutline,
  IoAlbumsOutline,
  IoReceiptOutline,
  IoLogOutOutline,
  IoCalendarOutline,
} from "react-icons/io5";

export default function PlayManagerHome() {
  const navigate = useNavigate();

  // State for stats
  const [activePlays, setActivePlays] = useState(null);
  const [totalBookings, setTotalBookings] = useState(null);
  const [upcomingShows, setUpcomingShows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Replace with your actual API base URL if different
        const baseUrl = ""; // e.g., "https://fanaka-server-1.onrender.com/api"
        
        const responses = await Promise.allSettled([
          fetch(`${baseUrl}/api/plays/active/count`),
          fetch(`${baseUrl}/api/bookings/total/count`),
          fetch(`${baseUrl}/api/shows/upcoming/count`),
        ]);

        // Process each response
        const [playsRes, bookingsRes, showsRes] = responses.map(r => 
          r.status === "fulfilled" ? r.value : null
        );

        // Helper to safely parse JSON
        const safeJson = async (res) => {
          if (!res || !res.ok) return null;
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch {
            return null;
          }
        };

        const playsData = await safeJson(playsRes);
        const bookingsData = await safeJson(bookingsRes);
        const showsData = await safeJson(showsRes);

        setActivePlays(playsData?.count ?? 0);
        setTotalBookings(bookingsData?.count ?? 0);
        setUpcomingShows(showsData?.count ?? 0);

        // If any request failed, show a warning but keep data
        if (!playsData || !bookingsData || !showsData) {
          setError("Some statistics could not be loaded.");
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Could not load dashboard statistics. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      alert("Logged out successfully");
      navigate("/login");
    }
  };

  const actions = [
    {
      path: "/play-manager/create-play",
      icon: <IoAddCircleOutline size={40} color="#6200EE" />,
      title: "Create New Play",
      description: "Add a new play to the repertoire",
    },
    {
      path: "/play-manager/manage-plays",
      icon: <IoAlbumsOutline size={40} color="#03DAC6" />,
      title: "Manage Plays",
      description: "Edit, update or remove existing plays",
    },
    {
      path: "/play-manager/manager-bookings",
      icon: <IoReceiptOutline size={40} color="#FF6D00" />,
      title: "View Bookings",
      description: "Check all ticket bookings and revenue",
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header with title and logout button */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Play Manager Dashboard</h1>
          <p style={styles.subtitle}>Welcome back! Manage your plays and bookings.</p>
        </div>
        <button style={styles.logoutButton} onClick={handleLogout}>
          <IoLogOutOutline size={22} color="#fff" />
          <span style={styles.logoutText}>Logout</span>
        </button>
      </div>

      {/* Quick stats row with real data */}
      <div style={styles.statsContainer}>
        {loading ? (
          <div style={styles.loading}>Loading stats...</div>
        ) : (
          <>
            <div style={styles.statCard}>
              <IoCalendarOutline size={30} color="#6200EE" />
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{activePlays}</span>
                <span style={styles.statLabel}>Active Plays</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <IoReceiptOutline size={30} color="#03DAC6" />
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{totalBookings}</span>
                <span style={styles.statLabel}>Total Bookings</span>
              </div>
            </div>
            <div style={styles.statCard}>
              <IoAlbumsOutline size={30} color="#FF6D00" />
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{upcomingShows}</span>
                <span style={styles.statLabel}>Upcoming Shows</span>
              </div>
            </div>
          </>
        )}
        {error && !loading && <div style={styles.error}>{error}</div>}
      </div>

      {/* Action cards grid */}
      <div style={styles.cardGrid}>
        {actions.map((action, index) => (
          <button
            key={index}
            style={styles.card}
            onClick={() => navigate(action.path)}
          >
            <div style={styles.cardIcon}>{action.icon}</div>
            <h3 style={styles.cardTitle}>{action.title}</h3>
            <p style={styles.cardDescription}>{action.description}</p>
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p style={styles.footer}>Use the sidebar for additional navigation options.</p>
    </div>
  );
}

// Inline styles (duplicate border key removed)
const styles = {
  container: {
    padding: "30px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "15px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 5px 0",
  },
  subtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: "0",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "50px",
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s, transform 0.1s",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  // Quick stats row
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
  },
  statInfo: {
    display: "flex",
    flexDirection: "column",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: "1.2",
  },
  statLabel: {
    fontSize: "14px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  loading: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
    fontSize: "18px",
  },
  error: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "20px",
    color: "#ef4444",
    fontSize: "16px",
  },
  // Card grid
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
    marginTop: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "30px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    border: "none", // keep this, removed duplicate
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  cardIcon: {
    marginBottom: "20px",
    backgroundColor: "#f1f5f9",
    padding: "15px",
    borderRadius: "50%",
    display: "inline-flex",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  cardDescription: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0",
    lineHeight: "1.5",
  },
  footer: {
    marginTop: "40px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "20px",
  },
};