import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  IoFilmOutline,
  IoLocationOutline,
  IoTrashOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoCashOutline,
  IoStarOutline,
  IoDiamondOutline,
  IoPeopleOutline,
  IoCubeOutline,
  IoCheckmark,
  IoClose,
  IoSearch,
  IoCloseCircle,
  IoAdd,
} from "react-icons/io5";

const API_BASE_URL = "https://fanaka-server-1.onrender.com";

export default function ManagePlays() {
  const navigate = useNavigate();

  const [plays, setPlays] = useState([]);
  const [filteredPlays, setFilteredPlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return `${API_BASE_URL}${imagePath}`;
    return `${API_BASE_URL}/uploads/${imagePath}`;
  };

  const fetchPlays = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/plays`);
      const playsWithFullUrls = response.data.map((play) => ({
        ...play,
        image: getFullImageUrl(play.image),
      }));
      setPlays(playsWithFullUrls);
      setFilteredPlays(playsWithFullUrls);
    } catch (error) {
      window.alert("Failed to fetch plays.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlays();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPlays(plays);
    } else {
      const filtered = plays.filter(
        (play) =>
          play.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          play.venue?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlays(filtered);
    }
  }, [searchQuery, plays]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlays();
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/api/plays/${id}`);
        fetchPlays();
      } catch (error) {
        window.alert("Failed to delete.");
      }
    }
  };

  const handleApproveMaterial = async (playId, requestId) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/plays/${playId}/material-requests/${requestId}/approve`
      );
      fetchPlays();
    } catch (error) {
      window.alert("Failed to approve.");
    }
  };

  const handleRejectMaterial = async (playId, requestId) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/plays/${playId}/material-requests/${requestId}/reject`
      );
      fetchPlays();
    } catch (error) {
      window.alert("Failed to reject.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatMaterials = (materials) => {
    if (!materials || !Array.isArray(materials)) return "No materials";
    return materials
      .map((material) => {
        if (material && typeof material === "object") {
          return (
            material.name || material.title || material.materialName || JSON.stringify(material)
          );
        }
        return material;
      })
      .join(", ");
  };

  if (loading && !refreshing) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading plays...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with search */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Manage Plays</h1>
        <p style={styles.headerSubtitle}>
          {filteredPlays.length} play{filteredPlays.length !== 1 ? "s" : ""} found
        </p>
        <div style={styles.searchContainer}>
          <IoSearch size={20} color="#666" style={styles.searchIcon} />
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search plays..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length > 0 && (
            <button style={styles.clearButton} onClick={() => setSearchQuery("")}>
              <IoCloseCircle size={20} color="#999" />
            </button>
          )}
        </div>
      </div>

      {/* Plays List */}
      <div style={styles.listContent}>
        {filteredPlays.length === 0 ? (
          <div style={styles.centered}>
            <IoFilmOutline size={80} color="#ddd" />
            <p style={styles.emptyTitle}>No Plays</p>
            <p style={styles.emptySubtitle}>
              {searchQuery ? "No matches found" : "Create your first play"}
            </p>
          </div>
        ) : (
          filteredPlays.map((play) => {
            const imageUrl = getFullImageUrl(play.image);
            const hasMaterialRequests = play.materialRequests && play.materialRequests.length > 0;

            return (
              <div key={play._id} style={styles.playCard}>
                {/* Image Section */}
                <div style={styles.imageSection}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={play.title} style={styles.image} />
                  ) : (
                    <div style={styles.placeholderImage}>
                      <IoFilmOutline size={50} color="#666" />
                    </div>
                  )}
                  <div style={styles.imageOverlay}>
                    <h3 style={styles.imageTitle}>{play.title}</h3>
                    <div style={styles.venueBadge}>
                      <IoLocationOutline size={14} color="#fff" />
                      <span style={styles.venueText}>{play.venue}</span>
                    </div>
                  </div>
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDelete(play._id, play.title)}
                  >
                    <IoTrashOutline size={20} color="#ff4444" />
                  </button>
                </div>

                {/* Play Details */}
                <div style={styles.detailsContainer}>
                  <div style={styles.descriptionContainer}>
                    <IoDocumentTextOutline size={16} color="#6200EE" />
                    <p style={styles.descriptionText}>
                      {play.description || "No description"}
                    </p>
                  </div>

                  <div style={styles.detailsGrid}>
                    <div style={styles.detailItem}>
                      <IoCalendarOutline size={16} color="#666" />
                      <span style={styles.detailLabel}>Date</span>
                      <span style={styles.detailValue}>{formatDate(play.date)}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <IoCashOutline size={16} color="#666" />
                      <span style={styles.detailLabel}>Regular</span>
                      <span style={styles.detailValue}>KES {play.regularPrice || 0}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <IoStarOutline size={16} color="#666" />
                      <span style={styles.detailLabel}>VIP</span>
                      <span style={styles.detailValue}>KES {play.vipPrice || 0}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <IoDiamondOutline size={16} color="#666" />
                      <span style={styles.detailLabel}>VVIP</span>
                      <span style={styles.detailValue}>KES {play.vvipPrice || 0}</span>
                    </div>
                  </div>

                  {/* Actors Section */}
                  <div style={styles.actorsSection}>
                    <IoPeopleOutline size={16} color="#6200EE" />
                    <span style={styles.actorsText}>
                      {play.actors?.length || 0} assigned actors
                    </span>
                    <button
                      style={styles.assignButton}
                      onClick={() =>
                        navigate("/assign-actors", { state: { playId: play._id, playTitle: play.title } })
                      }
                    >
                      Assign
                    </button>
                  </div>

                  {/* Material Requests */}
                  <div style={styles.materialSection}>
                    <div style={styles.sectionHeader}>
                      <IoCubeOutline size={16} color="#6200EE" />
                      <span style={styles.sectionTitle}>Material Requests</span>
                      <span style={styles.badge}>{play.materialRequests?.length || 0}</span>
                    </div>

                    {hasMaterialRequests ? (
                      <div style={styles.materialsList}>
                        {play.materialRequests.slice(0, 2).map((req) => (
                          <div
                            key={req._id}
                            style={{
                              ...styles.requestCard,
                              ...(req.status === "approved" ? styles.approvedCard : {}),
                              ...(req.status === "rejected" ? styles.rejectedCard : {}),
                            }}
                          >
                            <div style={styles.requestHeader}>
                              <span style={styles.actorName}>
                                {req.actor?.fullName || req.actor?.name || "Actor"}
                              </span>
                              <span
                                style={{
                                  ...styles.statusBadge,
                                  ...(req.status === "approved" ? styles.statusApproved : {}),
                                  ...(req.status === "rejected" ? styles.statusRejected : {}),
                                  ...(!req.status || req.status === "pending"
                                    ? styles.statusPending
                                    : {}),
                                }}
                              >
                                {req.status ? req.status.toUpperCase() : "PENDING"}
                              </span>
                            </div>
                            <p style={styles.materialsText}>
                              {formatMaterials(req.materials)}
                            </p>
                            {(!req.status || req.status === "pending") && (
                              <div style={styles.requestActions}>
                                <button
                                  style={styles.approveButton}
                                  onClick={() => handleApproveMaterial(play._id, req._id)}
                                >
                                  <IoCheckmark size={14} color="#fff" />
                                </button>
                                <button
                                  style={styles.rejectButton}
                                  onClick={() => handleRejectMaterial(play._id, req._id)}
                                >
                                  <IoClose size={14} color="#fff" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                        {play.materialRequests.length > 2 && (
                          <p style={styles.moreText}>
                            +{play.materialRequests.length - 2} more requests
                          </p>
                        )}
                      </div>
                    ) : (
                      <div style={styles.noMaterialsContainer}>
                        <IoCubeOutline size={30} color="#ddd" />
                        <p style={styles.noMaterialsText}>No material requests</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button */}
      <button style={styles.fab} onClick={() => navigate("/create-play")}>
        <IoAdd size={30} color="#fff" />
      </button>

      {/* Refresh overlay (simple) */}
      {refreshing && (
        <div style={styles.refreshOverlay}>
          <div style={styles.spinner}></div>
        </div>
      )}
    </div>
  );
}

// Inline styles
const styles = {
  container: {
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #6200EE",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "12px",
    fontSize: "16px",
    color: "#666",
  },
  header: {
    padding: "20px 20px 10px 20px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #eee",
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1a1a1a",
    margin: 0,
  },
  headerSubtitle: {
    fontSize: "14px",
    color: "#666",
    marginTop: "2px",
    marginBottom: "16px",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "0 15px",
    border: "1px solid #ddd",
  },
  searchIcon: {
    marginRight: "10px",
  },
  searchInput: {
    flex: 1,
    height: "50px",
    fontSize: "16px",
    border: "none",
    outline: "none",
    background: "transparent",
  },
  clearButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px",
  },
  listContent: {
    padding: "16px",
    paddingBottom: "100px",
  },
  playCard: {
    backgroundColor: "#fff",
    marginBottom: "20px",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  imageSection: {
    position: "relative",
    height: "180px",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: "15px",
  },
  imageTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#fff",
    marginBottom: "5px",
  },
  venueBadge: {
    display: "inline-flex",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#6200EE",
    padding: "4px 10px",
    borderRadius: "10px",
    gap: "5px",
  },
  venueText: {
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
  },
  deleteButton: {
    position: "absolute",
    top: "15px",
    right: "15px",
    backgroundColor: "rgba(255,255,255,0.9)",
    width: "40px",
    height: "40px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  detailsContainer: {
    padding: "15px",
  },
  descriptionContainer: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "15px",
  },
  descriptionText: {
    flex: 1,
    fontSize: "14px",
    color: "#444",
    lineHeight: "20px",
    margin: 0,
  },
  detailsGrid: {
    display: "flex",
    flexWrap: "wrap",
    marginBottom: "15px",
    paddingBottom: "15px",
    borderBottom: "1px solid #eee",
  },
  detailItem: {
    width: "50%",
    marginBottom: "10px",
  },
  detailLabel: {
    display: "block",
    fontSize: "12px",
    color: "#888",
    marginTop: "2px",
  },
  detailValue: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginTop: "2px",
  },
  actorsSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
    padding: "10px 0",
    borderTop: "1px solid #eee",
    borderBottom: "1px solid #eee",
  },
  actorsText: {
    flex: 1,
    fontSize: "14px",
    color: "#666",
  },
  assignButton: {
    backgroundColor: "#6200EE",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 15px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  materialSection: {
    marginBottom: "10px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
  },
  badge: {
    backgroundColor: "#6200EE",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "600",
  },
  materialsList: {
    marginTop: "5px",
  },
  requestCard: {
    backgroundColor: "#f8f9fa",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "8px",
    border: "1px solid #eee",
  },
  approvedCard: {
    backgroundColor: "rgba(40,167,69,0.1)",
    borderColor: "rgba(40,167,69,0.3)",
  },
  rejectedCard: {
    backgroundColor: "rgba(255,68,68,0.1)",
    borderColor: "rgba(255,68,68,0.3)",
  },
  requestHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "5px",
  },
  actorName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
  },
  statusBadge: {
    padding: "3px 8px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "600",
    color: "#fff",
  },
  statusPending: {
    backgroundColor: "#ffc107",
  },
  statusApproved: {
    backgroundColor: "#28a745",
  },
  statusRejected: {
    backgroundColor: "#dc3545",
  },
  materialsText: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "8px",
    lineHeight: "18px",
  },
  requestActions: {
    display: "flex",
    gap: "8px",
  },
  approveButton: {
    flex: 1,
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: {
    textAlign: "center",
    fontSize: "12px",
    color: "#6200EE",
    marginTop: "5px",
    fontStyle: "italic",
  },
  noMaterialsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
    border: "1px dashed #eee",
  },
  noMaterialsText: {
    marginTop: "8px",
    fontSize: "13px",
    color: "#999",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#666",
    marginTop: "15px",
  },
  emptySubtitle: {
    fontSize: "14px",
    color: "#999",
    marginTop: "5px",
    textAlign: "center",
  },
  fab: {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    width: "60px",
    height: "60px",
    borderRadius: "30px",
    backgroundColor: "#6200EE",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    zIndex: 100,
  },
  refreshOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
};

// Add global keyframe animation for spinner
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);