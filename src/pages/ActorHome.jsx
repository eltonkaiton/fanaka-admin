import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  IoFilmOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoPersonOutline,
  IoCheckmarkCircle,
  IoInformationCircleOutline,
  IoClose,
  IoCashOutline,
  IoStarOutline,
  IoDiamondOutline,
  IoCubeOutline,
  IoSendOutline,
  IoSearch,
  IoCloseCircle,
  IoLogOutOutline,
  IoPersonCircle,
  IoStar,
  IoMailOutline,
  IoAdd,
  IoRemove,
  IoCheckmarkDoneOutline,
  IoCube,
} from "react-icons/io5";
import { MdPersonOutline } from "react-icons/md";

const API_BASE_URL = "https://fanaka-server-1.onrender.com";

export default function ActorHome() {
  const navigate = useNavigate();
  const actorId = localStorage.getItem("actorId");

  const [actor, setActor] = useState(null);
  const [assignedPlays, setAssignedPlays] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  const fetchActorDashboard = async () => {
    if (!actorId) return;
    try {
      const [dashboardRes, itemsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/actors/${actorId}/dashboard`),
        axios.get(`${API_BASE_URL}/api/items`),
      ]);

      setActor(dashboardRes.data.actor);
      setAssignedPlays(
        dashboardRes.data.plays.map((p) => ({
          ...p,
          confirmed: p.actors.find((a) => a.actor === actorId)?.confirmed || false,
        }))
      );

      const availableItems = itemsRes.data.filter((item) => item.quantity > 0);
      setItems(availableItems);
    } catch (error) {
      console.log("Fetch Error:", error?.response?.data || error);
      window.alert("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!actorId) {
      window.alert("Actor ID missing. Please log in again.");
      navigate("/login");
      return;
    }
    fetchActorDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActorDashboard();
  };

  const handleConfirmPlay = async (playId) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/actors/${playId}/confirm`, { actorId: actor._id });
      setAssignedPlays((prev) =>
        prev.map((p) => (p._id === playId ? { ...p, confirmed: true } : p))
      );
      window.alert("Availability confirmed!");
    } catch (error) {
      window.alert("Could not confirm play.");
    }
  };

  const handleMarkCollected = async (requestId) => {
    console.log("=== Mark Collected Debug ===");
    console.log("Play ID:", selectedPlay?._id);
    console.log("Request ID:", requestId);
    console.log("Actor ID:", actor?._id);

    if (!window.confirm("Are you sure you have collected all the items?")) return;

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/plays/${selectedPlay._id}/material-requests/${requestId}/collect`,
        { actorId: actor._id }
      );

      console.log("Success Response:", response.data);
      window.alert("Items marked as collected!");

      if (selectedPlay) {
        setSelectedPlay((prev) => ({
          ...prev,
          materialRequests: prev.materialRequests.map((req) =>
            req._id === requestId
              ? {
                  ...req,
                  status: "collected",
                  collectedAt: new Date().toISOString(),
                  ...response.data.request,
                }
              : req
          ),
        }));
      }

      fetchActorDashboard();
    } catch (error) {
      console.error("Mark Collected Error Details:", {
        message: error.message,
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });

      let errorMessage = "Could not mark as collected.";
      if (error.response?.status === 404) {
        errorMessage = "Collect endpoint not found. You need to add it to playRoutes.js.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      window.alert(errorMessage);
    }
  };

  const openModal = (play) => {
    setSelectedPlay(play);
    setSelectedItems({});
    setModalVisible(true);
  };

  const toggleItemSelection = (item) => {
    setSelectedItems((prev) => {
      if (prev[item._id]) {
        const newItems = { ...prev };
        delete newItems[item._id];
        return newItems;
      } else {
        return {
          ...prev,
          [item._id]: {
            item,
            quantity: 1,
            maxQuantity: item.quantity,
          },
        };
      }
    });
  };

  const updateItemQuantity = (itemId, change) => {
    setSelectedItems((prev) => {
      const current = prev[itemId];
      if (!current) return prev;

      const newQuantity = current.quantity + change;
      if (newQuantity < 1 || newQuantity > current.maxQuantity) return prev;

      return {
        ...prev,
        [itemId]: {
          ...current,
          quantity: newQuantity,
        },
      };
    });
  };

  const handleRequestItems = async () => {
    const selectedCount = Object.keys(selectedItems).length;
    if (selectedCount === 0) {
      window.alert("Please select at least one item.");
      return;
    }

    try {
      const materialsWithQuantity = Object.values(selectedItems).map(({ item, quantity }) => ({
        name: item.name,
        quantity: quantity,
      }));

      await axios.post(`${API_BASE_URL}/api/actors/${selectedPlay._id}/request-materials`, {
        actorId: actor._id,
        materials: materialsWithQuantity,
      });

      window.alert("Item request sent!");
      fetchActorDashboard();
      setModalVisible(false);
    } catch (error) {
      console.error("Request Items Error:", error.response?.data || error);
      window.alert(error.response?.data?.error || "Could not send request.");
    }
  };

  const getPlayStatus = (playDate) => {
    const now = new Date();
    const playDateTime = new Date(playDate);
    const diffTime = playDateTime - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: "Past Event", color: "#dc3545" };
    if (diffDays === 0) return { text: "Today", color: "#ff9800" };
    if (diffDays <= 7) return { text: "This Week", color: "#4caf50" };
    return { text: "Upcoming", color: "#2196f3" };
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getFullImageUrl = (imagePath) =>
    !imagePath
      ? null
      : imagePath.startsWith("http")
      ? imagePath
      : `${API_BASE_URL}${imagePath}`;

  const filteredPlays = assignedPlays.filter((play) => {
    const matchesSearch = play.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isUpcoming = new Date(play.date) > new Date();
    return activeTab === "upcoming"
      ? matchesSearch && isUpcoming
      : matchesSearch && !isUpcoming;
  });

  if (loading && !refreshing) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <p style={styles.greeting}>Welcome back</p>
            <h1 style={styles.actorName}>{actor?.fullName}</h1>
          </div>
          <button style={styles.profileButton} onClick={() => navigate("/profile")}>
            <IoPersonCircle size={40} color="#fff" />
          </button>
        </div>
        <div style={styles.profileInfo}>
          <div style={styles.stageNameBadge}>
            <IoStar size={16} color="#FFD700" />
            <span style={styles.stageName}>{actor?.stageName}</span>
          </div>
          <p style={styles.actorContact}>
            <IoMailOutline size={14} color="#fff" /> {actor?.email}
          </p>
        </div>
      </div>

      {/* Search */}
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
            <IoCloseCircle size={20} color="#666" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          style={{ ...styles.tabButton, ...(activeTab === "upcoming" ? styles.tabButtonActive : {}) }}
          onClick={() => setActiveTab("upcoming")}
        >
          <span style={{ ...styles.tabText, ...(activeTab === "upcoming" ? styles.tabTextActive : {}) }}>
            Upcoming
          </span>
        </button>
        <button
          style={{ ...styles.tabButton, ...(activeTab === "past" ? styles.tabButtonActive : {}) }}
          onClick={() => setActiveTab("past")}
        >
          <span style={{ ...styles.tabText, ...(activeTab === "past" ? styles.tabTextActive : {}) }}>
            Past
          </span>
        </button>
      </div>

      {/* Plays List */}
      <div style={styles.listContainer}>
        {filteredPlays.length === 0 ? (
          <div style={styles.emptyContainer}>
            <IoCalendarOutline size={80} color="#e0e0e0" />
            <p style={styles.emptyTitle}>No {activeTab} plays</p>
            <p style={styles.emptySubtitle}>
              {searchQuery ? "Try different search" : "No assigned plays"}
            </p>
          </div>
        ) : (
          filteredPlays.map((play) => {
            const status = getPlayStatus(play.date);
            const imageUrl = getFullImageUrl(play.image);

            return (
              <div key={play._id} style={styles.playCard} onClick={() => openModal(play)}>
                {imageUrl ? (
                  <img src={imageUrl} alt={play.title} style={styles.playImage} />
                ) : (
                  <div style={styles.playPlaceholder}>
                    <IoFilmOutline size={40} color="#777" />
                  </div>
                )}
                <div style={styles.playInfo}>
                  <div style={styles.playHeader}>
                    <h3 style={styles.playTitle} title={play.title}>
                      {play.title}
                    </h3>
                    <div style={{ ...styles.statusBadge, backgroundColor: status.color }}>
                      <span style={styles.statusText}>{status.text}</span>
                    </div>
                  </div>

                  <div style={styles.playDetails}>
                    <div style={styles.detailItem}>
                      <IoCalendarOutline size={14} color="#666" />
                      <span style={styles.detailText}>{formatDate(play.date)}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <IoLocationOutline size={14} color="#666" />
                      <span style={styles.detailText} title={play.venue}>
                        {play.venue}
                      </span>
                    </div>
                    <div style={styles.detailItem}>
                      <MdPersonOutline size={14} color="#666" />
                      <span style={styles.detailText}>Role: {play.role || "Not specified"}</span>
                    </div>
                  </div>

                  <div style={styles.playFooter}>
                    {!play.confirmed ? (
                      <button
                        style={styles.confirmButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmPlay(play._id);
                        }}
                      >
                        <IoCheckmarkCircle size={16} color="#fff" />
                        <span style={styles.confirmButtonText}>Confirm</span>
                      </button>
                    ) : (
                      <div style={styles.confirmedTag}>
                        <IoCheckmarkCircle size={16} color="#fff" />
                        <span style={styles.confirmedText}>Confirmed</span>
                      </div>
                    )}
                    <button
                      style={styles.detailsButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(play);
                      }}
                    >
                      <IoInformationCircleOutline size={16} color="#6200EE" />
                      <span style={styles.detailsButtonText}>Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Logout Button */}
      <button style={styles.logoutButton} onClick={() => navigate("/login")}>
        <IoLogOutOutline size={22} color="#fff" />
        <span style={styles.logoutText}>Logout</span>
      </button>

      {/* Refresh button (simple alternative to pull-to-refresh) */}
      {refreshing ? (
        <div style={styles.refreshOverlay}>
          <div style={styles.spinner}></div>
        </div>
      ) : (
        <button style={styles.refreshButton} onClick={onRefresh}>
          Refresh
        </button>
      )}

      {/* Play Details Modal */}
      {modalVisible && selectedPlay && (
        <div style={styles.modalOverlay} onClick={() => setModalVisible(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButtonTop} onClick={() => setModalVisible(false)}>
              <IoClose size={24} color="#333" />
            </button>

            <div style={styles.modalScroll}>
              {selectedPlay.image && (
                <img
                  src={getFullImageUrl(selectedPlay.image)}
                  alt={selectedPlay.title}
                  style={styles.modalImage}
                />
              )}

              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>{selectedPlay.title}</h2>
                <div
                  style={{
                    ...styles.modalStatusBadge,
                    backgroundColor: getPlayStatus(selectedPlay.date).color,
                  }}
                >
                  <span style={styles.modalStatusText}>{getPlayStatus(selectedPlay.date).text}</span>
                </div>
              </div>

              <div style={styles.modalDetailsGrid}>
                <div style={styles.modalDetailItem}>
                  <IoCalendarOutline size={20} color="#6200EE" />
                  <p style={styles.modalDetailLabel}>Date & Time</p>
                  <p style={styles.modalDetailValue}>
                    {selectedPlay.date ? formatDate(selectedPlay.date) : "N/A"}
                  </p>
                </div>
                <div style={styles.modalDetailItem}>
                  <IoLocationOutline size={20} color="#6200EE" />
                  <p style={styles.modalDetailLabel}>Venue</p>
                  <p style={styles.modalDetailValue}>{selectedPlay.venue || "Not specified"}</p>
                </div>
                <div style={styles.modalDetailItem}>
                  <MdPersonOutline size={20} color="#6200EE" />
                  <p style={styles.modalDetailLabel}>Your Role</p>
                  <p style={styles.modalDetailValue}>{selectedPlay.role || "Not specified"}</p>
                </div>
                <div style={styles.modalDetailItem}>
                  <IoCashOutline size={20} color="#6200EE" />
                  <p style={styles.modalDetailLabel}>Regular</p>
                  <p style={styles.priceText}>KES {selectedPlay.regularPrice || "0"}</p>
                </div>
                <div style={styles.modalDetailItem}>
                  <IoStarOutline size={20} color="#6200EE" />
                  <p style={styles.modalDetailLabel}>VIP</p>
                  <p style={styles.priceText}>KES {selectedPlay.vipPrice || "0"}</p>
                </div>
                <div style={styles.modalDetailItem}>
                  <IoDiamondOutline size={20} color="#6200EE" />
                  <p style={styles.modalDetailLabel}>VVIP</p>
                  <p style={styles.priceText}>KES {selectedPlay.vvipPrice || "0"}</p>
                </div>
              </div>

              {selectedPlay.description && (
                <div style={styles.modalSection}>
                  <h3 style={styles.modalSectionTitle}>Description</h3>
                  <p style={styles.modalDescription}>{selectedPlay.description}</p>
                </div>
              )}

              <div style={styles.modalSection}>
                <h3 style={styles.modalSectionTitle}>Assigned Actors</h3>
                {selectedPlay.actors?.length > 0 ? (
                  selectedPlay.actors.map((a, idx) => (
                    <div key={idx} style={styles.actorItem}>
                      <IoPersonOutline size={16} color="#6200EE" />
                      <span style={styles.actorText}>{a.actor?.fullName || "Actor"} - {a.role}</span>
                      <div
                        style={{
                          ...styles.confirmBadge,
                          ...(a.confirmed ? styles.confirmedBadge : styles.pendingBadge),
                        }}
                      >
                        <span style={styles.confirmBadgeText}>
                          {a.confirmed ? "Confirmed" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={styles.noDataText}>No actors assigned</p>
                )}
              </div>

              {(() => {
                const actorRequests = selectedPlay.materialRequests?.filter(
                  (req) => req.actor === actor?._id
                ) || [];
                const hasPreparedRequests = actorRequests.some((req) => req.status === "prepared");

                return (
                  <>
                    {actorRequests.length > 0 && (
                      <div style={styles.modalSection}>
                        <h3 style={styles.modalSectionTitle}>Your Material Requests</h3>
                        {hasPreparedRequests && (
                          <div style={styles.collectionAlert}>
                            <IoCubeOutline size={20} color="#fff" />
                            <span style={styles.collectionAlertText}>
                              Items are prepared! You can collect them.
                            </span>
                          </div>
                        )}
                        {actorRequests.map((req, idx) => (
                          <div
                            key={idx}
                            style={{
                              ...styles.requestItem,
                              ...(req.status === "prepared" ? styles.preparedRequest : {}),
                            }}
                          >
                            <div style={styles.requestHeader}>
                              <IoCube size={16} color="#6200EE" />
                              <span style={styles.requestDate}>
                                Requested:{" "}
                                {new Date(req.requestedAt || req.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div style={styles.requestMaterials}>
                              {Array.isArray(req.materials) &&
                                req.materials.map((material, matIdx) => (
                                  <div key={matIdx} style={styles.materialItem}>
                                    <span style={styles.materialName}>
                                      {typeof material === "object" ? material.name : material}
                                    </span>
                                    <span style={styles.materialQuantity}>
                                      ×{typeof material === "object" ? material.quantity : 1}
                                    </span>
                                  </div>
                                ))}
                            </div>

                            <div style={styles.requestFooter}>
                              <div
                                style={{
                                  ...styles.statusBadgeSmall,
                                  ...(req.status === "approved" ? styles.statusApproved : {}),
                                  ...(req.status === "rejected" ? styles.statusRejected : {}),
                                  ...(req.status === "pending" ? styles.statusPending : {}),
                                  ...(req.status === "prepared" ? styles.statusPrepared : {}),
                                  ...(req.status === "collected" ? styles.statusCollected : {}),
                                }}
                              >
                                <span style={styles.statusTextSmall}>
                                  {req.status?.toUpperCase() || "PENDING"}
                                </span>
                              </div>

                              {req.status === "prepared" && (
                                <button
                                  style={styles.collectButton}
                                  onClick={() => handleMarkCollected(req._id)}
                                >
                                  <IoCheckmarkCircle size={16} color="#fff" />
                                  <span style={styles.collectButtonText}>Mark as Collected</span>
                                </button>
                              )}

                              {req.status === "collected" && (
                                <div style={styles.collectedBadge}>
                                  <IoCheckmarkDoneOutline size={14} color="#fff" />
                                  <span style={styles.collectedText}>
                                    {req.collectedAt
                                      ? `Collected on ${new Date(req.collectedAt).toLocaleDateString()}`
                                      : "Collected"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}

              <div style={styles.modalSection}>
                <h3 style={styles.modalSectionTitle}>Request New Items</h3>
                <p style={styles.sectionSubtitle}>Available items:</p>

                {items.length === 0 ? (
                  <div style={styles.noItemsContainer}>
                    <IoCubeOutline size={40} color="#ccc" />
                    <p style={styles.noItemsText}>No items available at the moment</p>
                  </div>
                ) : (
                  <>
                    <div style={styles.itemsContainer}>
                      {items.map((item) => {
                        const isSelected = !!selectedItems[item._id];
                        const selectedData = selectedItems[item._id];

                        return (
                          <div
                            key={item._id}
                            style={{
                              ...styles.itemCard,
                              ...(isSelected ? styles.itemCardSelected : {}),
                            }}
                            onClick={() => toggleItemSelection(item)}
                          >
                            <div style={styles.itemHeader}>
                              <div style={styles.itemInfo}>
                                <span
                                  style={{
                                    ...styles.itemName,
                                    ...(isSelected ? styles.itemNameSelected : {}),
                                  }}
                                >
                                  {item.name}
                                </span>
                                {item.category && (
                                  <span style={styles.itemCategory}>{item.category}</span>
                                )}
                              </div>
                              {isSelected && <IoCheckmarkCircle size={20} color="#fff" />}
                            </div>

                            <div style={styles.itemDetails}>
                              <div style={styles.quantityBadge}>
                                <IoCubeOutline size={12} color={isSelected ? "#fff" : "#666"} />
                                <span
                                  style={{
                                    ...styles.quantityText,
                                    ...(isSelected ? styles.quantityTextSelected : {}),
                                  }}
                                >
                                  Available: {item.quantity} {item.unit || "pcs"}
                                </span>
                              </div>

                              {item.location && (
                                <div style={styles.locationBadge}>
                                  <IoLocationOutline size={12} color={isSelected ? "#fff" : "#666"} />
                                  <span
                                    style={{
                                      ...styles.locationText,
                                      ...(isSelected ? styles.locationTextSelected : {}),
                                    }}
                                  >
                                    {item.location}
                                  </span>
                                </div>
                              )}
                            </div>

                            {isSelected && (
                              <div style={styles.quantitySelector}>
                                <button
                                  style={styles.quantityBtn}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateItemQuantity(item._id, -1);
                                  }}
                                >
                                  <IoRemove size={16} color="#fff" />
                                </button>
                                <div style={styles.quantityDisplay}>
                                  <span style={styles.quantityValue}>{selectedData.quantity}</span>
                                  <span style={styles.quantityLabel}>requesting</span>
                                </div>
                                <button
                                  style={styles.quantityBtn}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateItemQuantity(item._id, 1);
                                  }}
                                >
                                  <IoAdd size={16} color="#fff" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      style={{
                        ...styles.submitButton,
                        ...(Object.keys(selectedItems).length === 0 ? styles.submitButtonDisabled : {}),
                      }}
                      onClick={handleRequestItems}
                      disabled={Object.keys(selectedItems).length === 0}
                    >
                      <IoSendOutline size={18} color="#fff" />
                      <span style={styles.submitButtonText}>
                        Request {Object.keys(selectedItems).length} Item
                        {Object.keys(selectedItems).length !== 1 ? "s" : ""}
                      </span>
                    </button>

                    {Object.keys(selectedItems).length > 0 && (
                      <div style={styles.selectedSummary}>
                        <p style={styles.summaryTitle}>Selected Items:</p>
                        {Object.values(selectedItems).map(({ item, quantity }) => (
                          <div key={item._id} style={styles.summaryItem}>
                            <span style={styles.summaryName}>{item.name}</span>
                            <span style={styles.summaryQuantity}>×{quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline styles – fully corrected for web (no arrays)
const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5",
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
    marginTop: "15px",
    color: "#666",
    fontSize: "16px",
  },
  header: {
    padding: "20px",
    paddingTop: "40px",
    paddingBottom: "20px",
    backgroundColor: "#6200EE",
    borderBottomLeftRadius: "25px",
    borderBottomRightRadius: "25px",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  greeting: {
    color: "#fff",
    fontSize: "14px",
    opacity: 0.9,
    margin: 0,
  },
  actorName: {
    color: "#fff",
    fontSize: "24px",
    fontWeight: "700",
    marginTop: "2px",
    margin: 0,
  },
  profileButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  profileInfo: {
    marginTop: "5px",
  },
  stageNameBadge: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: "6px 12px",
    borderRadius: "20px",
    marginBottom: "8px",
  },
  stageName: {
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    marginLeft: "5px",
  },
  actorContact: {
    color: "#fff",
    fontSize: "14px",
    opacity: 0.9,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: "20px 20px 15px 20px",
    padding: "0 15px",
    height: "50px",
    borderRadius: "12px",
  },
  searchIcon: {
    marginRight: "10px",
  },
  searchInput: {
    flex: 1,
    fontSize: "16px",
    color: "#333",
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
  tabContainer: {
    display: "flex",
    margin: "0 20px 15px 20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "4px",
  },
  tabButton: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },
  tabButtonActive: {
    backgroundColor: "#6200EE",
  },
  tabText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "#fff",
  },
  listContainer: {
    padding: "0 20px 100px 20px",
  },
  playCard: {
    display: "flex",
    backgroundColor: "#fff",
    borderRadius: "16px",
    marginBottom: "15px",
    padding: "15px",
    cursor: "pointer",
  },
  playImage: {
    width: "100px",
    height: "100px",
    borderRadius: "12px",
    objectFit: "cover",
  },
  playPlaceholder: {
    width: "100px",
    height: "100px",
    borderRadius: "12px",
    backgroundColor: "#f0f0f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  playInfo: {
    flex: 1,
    marginLeft: "15px",
  },
  playHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  playTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#333",
    margin: 0,
    flex: 1,
    marginRight: "10px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    minWidth: "80px",
    textAlign: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
  },
  playDetails: {
    marginBottom: "12px",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "4px",
    gap: "6px",
  },
  detailText: {
    fontSize: "14px",
    color: "#666",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  playFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confirmButton: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    padding: "8px 15px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    gap: "6px",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
  },
  confirmedTag: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#28a745",
    padding: "6px 12px",
    borderRadius: "8px",
    gap: "6px",
  },
  confirmedText: {
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
  },
  detailsButton: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    gap: "4px",
  },
  detailsButtonText: {
    color: "#6200EE",
    fontSize: "14px",
    fontWeight: "600",
  },
  emptyContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 40px",
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#666",
    marginTop: "20px",
    marginBottom: "8px",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: "14px",
    color: "#999",
    textAlign: "center",
    lineHeight: "20px",
  },
  logoutButton: {
    position: "fixed",
    bottom: "25px",
    right: "25px",
    backgroundColor: "#6200EE",
    display: "flex",
    alignItems: "center",
    padding: "14px 20px",
    borderRadius: "30px",
    border: "none",
    cursor: "pointer",
    gap: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  logoutText: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
  },
  refreshButton: {
    position: "fixed",
    bottom: "100px",
    right: "25px",
    backgroundColor: "#fff",
    color: "#6200EE",
    padding: "10px 20px",
    borderRadius: "20px",
    border: "1px solid #6200EE",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: "25px",
    borderTopRightRadius: "25px",
    maxHeight: "90%",
    width: "100%",
    maxWidth: "600px",
    paddingTop: "20px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  closeButtonTop: {
    position: "absolute",
    top: "20px",
    right: "20px",
    zIndex: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: "20px",
    padding: "5px",
    border: "none",
    cursor: "pointer",
  },
  modalScroll: {
    overflowY: "auto",
    padding: "0 20px 20px 20px",
  },
  modalImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderTopLeftRadius: "25px",
    borderTopRightRadius: "25px",
    marginBottom: "15px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#333",
    margin: 0,
    flex: 1,
    marginRight: "10px",
  },
  modalStatusBadge: {
    padding: "6px 10px",
    borderRadius: "15px",
  },
  modalStatusText: {
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
  },
  modalDetailsGrid: {
    display: "flex",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  modalDetailItem: {
    width: "50%",
    marginBottom: "15px",
    paddingRight: "10px",
  },
  modalDetailLabel: {
    fontSize: "12px",
    color: "#999",
    margin: "4px 0 2px 0",
  },
  modalDetailValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    margin: 0,
  },
  priceText: {
    color: "#4CAF50",
    fontSize: "16px",
    fontWeight: "700",
    margin: 0,
  },
  modalSection: {
    marginBottom: "25px",
  },
  modalSectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#333",
    marginBottom: "10px",
  },
  sectionSubtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "15px",
  },
  modalDescription: {
    fontSize: "15px",
    lineHeight: "22px",
    color: "#444",
    margin: 0,
  },
  actorItem: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "8px",
  },
  actorText: {
    fontSize: "14px",
    color: "#333",
    marginLeft: "10px",
    flex: 1,
  },
  confirmBadge: {
    padding: "4px 8px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "600",
    color: "#fff",
  },
  confirmedBadge: {
    backgroundColor: "#28a745",
  },
  pendingBadge: {
    backgroundColor: "#ffc107",
  },
  confirmBadgeText: {
    color: "#fff",
    fontSize: "10px",
    fontWeight: "600",
  },
  collectionAlert: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    gap: "10px",
  },
  collectionAlertText: {
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
  },
  requestItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "12px",
  },
  preparedRequest: {
    border: "2px solid #4CAF50",
    backgroundColor: "#f0f9f0",
  },
  requestHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
    gap: "8px",
  },
  requestDate: {
    fontSize: "12px",
    color: "#666",
  },
  requestMaterials: {
    marginBottom: "10px",
  },
  materialItem: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "6px",
    paddingBottom: "6px",
    borderBottom: "1px solid #eee",
  },
  materialName: {
    fontSize: "14px",
    color: "#333",
  },
  materialQuantity: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6200EE",
  },
  requestFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadgeSmall: {
    padding: "5px 10px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#fff",
  },
  statusTextSmall: {
    color: "#fff",
    fontSize: "11px",
    fontWeight: "600",
  },
  collectButton: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    gap: "5px",
  },
  collectButtonText: {
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
  },
  collectedBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#28a745",
    padding: "5px 10px",
    borderRadius: "8px",
    gap: "5px",
  },
  collectedText: {
    color: "#fff",
    fontSize: "11px",
    fontWeight: "600",
  },
  noDataText: {
    fontSize: "14px",
    color: "#999",
    fontStyle: "italic",
  },
  itemsContainer: {
    marginBottom: "20px",
  },
  itemCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "10px",
    border: "2px solid transparent",
    cursor: "pointer",
  },
  itemCardSelected: {
    backgroundColor: "#6200EE",
    borderColor: "#6200EE",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    display: "block",
    marginBottom: "4px",
  },
  itemNameSelected: {
    color: "#fff",
  },
  itemCategory: {
    fontSize: "12px",
    color: "#666",
    backgroundColor: "#e9ecef",
    padding: "2px 8px",
    borderRadius: "4px",
    display: "inline-block",
  },
  itemDetails: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    gap: "10px",
  },
  quantityBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "4px 10px",
    borderRadius: "6px",
    gap: "4px",
  },
  quantityText: {
    fontSize: "12px",
    color: "#666",
  },
  quantityTextSelected: {
    color: "#fff",
  },
  locationBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "4px 10px",
    borderRadius: "6px",
    gap: "4px",
  },
  locationText: {
    fontSize: "12px",
    color: "#666",
  },
  locationTextSelected: {
    color: "#fff",
  },
  quantitySelector: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: "8px",
    padding: "8px",
  },
  quantityBtn: {
    backgroundColor: "rgba(255,255,255,0.3)",
    width: "36px",
    height: "36px",
    borderRadius: "18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
  },
  quantityDisplay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  quantityValue: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#fff",
  },
  quantityLabel: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.8)",
    marginTop: "2px",
  },
  noItemsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  noItemsText: {
    fontSize: "14px",
    color: "#999",
    marginTop: "10px",
    textAlign: "center",
  },
  submitButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6200EE",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    marginTop: "10px",
    gap: "8px",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
  },
  selectedSummary: {
    backgroundColor: "#f0f0f0",
    borderRadius: "12px",
    padding: "15px",
    marginTop: "15px",
  },
  summaryTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "8px",
  },
  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "6px",
    paddingBottom: "6px",
  },
  summaryName: {
    fontSize: "14px",
    color: "#555",
    flex: 1,
  },
  summaryQuantity: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6200EE",
    marginLeft: "10px",
  },
  statusApproved: { backgroundColor: "#28a745" },
  statusRejected: { backgroundColor: "#dc3545" },
  statusPending: { backgroundColor: "#ffc107" },
  statusPrepared: { backgroundColor: "#4CAF50" },
  statusCollected: { backgroundColor: "#2196f3" },
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