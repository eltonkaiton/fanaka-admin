import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  IoFilmOutline, IoCalendarOutline, IoLocationOutline, IoPersonOutline,
  IoCheckmarkCircle, IoInformationCircleOutline, IoClose, IoCashOutline,
  IoStarOutline, IoDiamondOutline, IoCubeOutline, IoSendOutline, IoSearch,
  IoCloseCircle, IoLogOutOutline, IoPersonCircle, IoStar, IoMailOutline,
  IoAdd, IoRemove, IoCheckmarkDoneOutline, IoCube,
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
  // Toast
  const [toasts, setToasts] = useState([]);
  const showToast = (msg, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  };
  const removeToast = id => setToasts(p => p.filter(t => t.id !== id));
  // Collect confirmation modal
  const [collectConfirm, setCollectConfirm] = useState({ show: false, requestId: null });

  const fetchDashboard = async () => {
    if (!actorId) {
      showToast("Actor ID missing. Please log in again.", "error");
      navigate("/login");
      return;
    }
    try {
      const [dashboardRes, itemsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/actors/${actorId}/dashboard`),
        axios.get(`${API_BASE_URL}/api/items`),
      ]);
      setActor(dashboardRes.data.actor);
      setAssignedPlays(
        dashboardRes.data.plays.map(p => ({
          ...p,
          confirmed: p.actors.find(a => a.actor === actorId)?.confirmed || false,
        }))
      );
      setItems(itemsRes.data.filter(i => i.quantity > 0));
    } catch (error) {
      console.log("Fetch Error:", error?.response?.data || error);
      showToast("Failed to load data. Please try again.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchDashboard(); };

  const confirmPlay = async playId => {
    try {
      await axios.patch(`${API_BASE_URL}/api/actors/${playId}/confirm`, { actorId: actor._id });
      setAssignedPlays(p => p.map(p => p._id === playId ? { ...p, confirmed: true } : p));
      showToast("Availability confirmed!", "success");
    } catch (error) {
      showToast("Could not confirm play.", "error");
    }
  };

  const markCollected = async requestId => {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/plays/${selectedPlay._id}/material-requests/${requestId}/collect`,
        { actorId: actor._id }
      );
      showToast("Items marked as collected!", "success");
      setSelectedPlay(prev => ({
        ...prev,
        materialRequests: prev.materialRequests.map(req =>
          req._id === requestId
            ? { ...req, status: "collected", collectedAt: new Date().toISOString(), ...res.data.request }
            : req
        ),
      }));
      fetchDashboard();
    } catch (error) {
      let msg = "Could not mark as collected.";
      if (error.response?.status === 404) msg = "Collect endpoint not found.";
      else if (error.response?.data?.message) msg = error.response.data.message;
      else if (error.response?.data?.error) msg = error.response.data.error;
      showToast(msg, "error");
    } finally {
      setCollectConfirm({ show: false, requestId: null });
    }
  };

  const openModal = play => {
    setSelectedPlay(play);
    setSelectedItems({});
    setModalVisible(true);
  };

  const toggleItem = item => {
    setSelectedItems(prev =>
      prev[item._id]
        ? { ...prev, [item._id]: undefined }
        : { ...prev, [item._id]: { item, quantity: 1, max: item.quantity } }
    );
  };

  const updateQty = (itemId, delta) => {
    setSelectedItems(prev => {
      const cur = prev[itemId];
      if (!cur) return prev;
      const newQty = cur.quantity + delta;
      if (newQty < 1 || newQty > cur.max) return prev;
      return { ...prev, [itemId]: { ...cur, quantity: newQty } };
    });
  };

  const requestItems = async () => {
    const selected = Object.values(selectedItems).filter(Boolean);
    if (!selected.length) {
      showToast("Please select at least one item.", "warning");
      return;
    }
    try {
      const materials = selected.map(({ item, quantity }) => ({ name: item.name, quantity }));
      await axios.post(`${API_BASE_URL}/api/actors/${selectedPlay._id}/request-materials`, {
        actorId: actor._id,
        materials,
      });
      showToast("Item request sent!", "success");
      fetchDashboard();
      setModalVisible(false);
    } catch (error) {
      console.error("Request Items Error:", error.response?.data || error);
      showToast(error.response?.data?.error || "Could not send request.", "error");
    }
  };

  const getPlayStatus = playDate => {
    const now = new Date();
    const diff = (new Date(playDate) - now) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { text: "Past Event", color: "#dc3545" };
    if (diff === 0) return { text: "Today", color: "#ff9800" };
    if (diff <= 7) return { text: "This Week", color: "#4caf50" };
    return { text: "Upcoming", color: "#2196f3" };
  };

  const formatDate = date =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const imgUrl = path =>
    !path ? null : path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const filtered = assignedPlays.filter(p => {
    const matches = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const upcoming = new Date(p.date) > new Date();
    return activeTab === "upcoming" ? matches && upcoming : matches && !upcoming;
  });

  if (loading && !refreshing) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  const ToastContainer = () => (
    <div style={styles.toastContainer}>
      {toasts.map(t => (
        <div key={t.id} style={{ ...styles.toast, ...styles[`toast${t.type}`] }}>
          <span>{t.msg}</span>
          <button onClick={() => removeToast(t.id)} style={styles.toastClose}>✕</button>
        </div>
      ))}
    </div>
  );

  const CollectModal = () => collectConfirm.show && (
    <div style={styles.modalOverlay} onClick={() => setCollectConfirm({ show: false, requestId: null })}>
      <div style={styles.confirmModal} onClick={e => e.stopPropagation()}>
        <h3>Confirm Collection</h3>
        <p>Are you sure you have collected all the items?</p>
        <div style={styles.confirmButtons}>
          <button style={styles.cancelBtn} onClick={() => setCollectConfirm({ show: false, requestId: null })}>Cancel</button>
          <button style={styles.confirmBtn} onClick={() => markCollected(collectConfirm.requestId)}>Confirm</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <ToastContainer />
      <CollectModal />

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

      <div style={styles.searchContainer}>
        <IoSearch size={20} color="#666" style={styles.searchIcon} />
        <input type="text" style={styles.searchInput} placeholder="Search plays..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        {searchQuery && <button style={styles.clearButton} onClick={() => setSearchQuery("")}><IoCloseCircle size={20} color="#666" /></button>}
      </div>

      <div style={styles.tabContainer}>
        {["upcoming", "past"].map(tab => (
          <button key={tab} style={{ ...styles.tabButton, ...(activeTab === tab && styles.tabButtonActive) }} onClick={() => setActiveTab(tab)}>
            <span style={{ ...styles.tabText, ...(activeTab === tab && styles.tabTextActive) }}>{tab[0].toUpperCase() + tab.slice(1)}</span>
          </button>
        ))}
      </div>

      <div style={styles.listContainer}>
        {!filtered.length ? (
          <div style={styles.emptyContainer}>
            <IoCalendarOutline size={80} color="#e0e0e0" />
            <p style={styles.emptyTitle}>No {activeTab} plays</p>
            <p style={styles.emptySubtitle}>{searchQuery ? "Try different search" : "No assigned plays"}</p>
          </div>
        ) : (
          filtered.map(p => {
            const status = getPlayStatus(p.date);
            const image = imgUrl(p.image);
            return (
              <div key={p._id} style={styles.playCard} onClick={() => openModal(p)}>
                {image ? <img src={image} alt={p.title} style={styles.playImage} /> : <div style={styles.playPlaceholder}><IoFilmOutline size={40} color="#777" /></div>}
                <div style={styles.playInfo}>
                  <div style={styles.playHeader}>
                    <h3 style={styles.playTitle}>{p.title}</h3>
                    <div style={{ ...styles.statusBadge, backgroundColor: status.color }}><span style={styles.statusText}>{status.text}</span></div>
                  </div>
                  <div style={styles.playDetails}>
                    <div style={styles.detailItem}><IoCalendarOutline size={14} color="#666" /><span style={styles.detailText}>{formatDate(p.date)}</span></div>
                    <div style={styles.detailItem}><IoLocationOutline size={14} color="#666" /><span style={styles.detailText}>{p.venue}</span></div>
                    <div style={styles.detailItem}><MdPersonOutline size={14} color="#666" /><span style={styles.detailText}>Role: {p.role || "Not specified"}</span></div>
                  </div>
                  <div style={styles.playFooter}>
                    {!p.confirmed ? (
                      <button style={styles.confirmButton} onClick={e => { e.stopPropagation(); confirmPlay(p._id); }}>
                        <IoCheckmarkCircle size={16} color="#fff" /><span style={styles.confirmButtonText}>Confirm</span>
                      </button>
                    ) : (
                      <div style={styles.confirmedTag}><IoCheckmarkCircle size={16} color="#fff" /><span style={styles.confirmedText}>Confirmed</span></div>
                    )}
                    <button style={styles.detailsButton} onClick={e => { e.stopPropagation(); openModal(p); }}>
                      <IoInformationCircleOutline size={16} color="#6200EE" /><span style={styles.detailsButtonText}>Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button style={styles.logoutButton} onClick={() => navigate("/login")}>
        <IoLogOutOutline size={22} color="#fff" /><span style={styles.logoutText}>Logout</span>
      </button>
      {refreshing ? (
        <div style={styles.refreshOverlay}><div style={styles.spinner} /></div>
      ) : (
        <button style={styles.refreshButton} onClick={onRefresh}>Refresh</button>
      )}

      {modalVisible && selectedPlay && (
        <div style={styles.modalOverlay} onClick={() => setModalVisible(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button style={styles.closeButtonTop} onClick={() => setModalVisible(false)}><IoClose size={24} color="#333" /></button>
            <div style={styles.modalScroll}>
              {imgUrl(selectedPlay.image) && <img src={imgUrl(selectedPlay.image)} alt={selectedPlay.title} style={styles.modalImage} />}
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>{selectedPlay.title}</h2>
                <div style={{ ...styles.modalStatusBadge, backgroundColor: getPlayStatus(selectedPlay.date).color }}>
                  <span style={styles.modalStatusText}>{getPlayStatus(selectedPlay.date).text}</span>
                </div>
              </div>

              <div style={styles.modalDetailsGrid}>
                {[
                  { icon: IoCalendarOutline, label: "Date & Time", value: formatDate(selectedPlay.date) },
                  { icon: IoLocationOutline, label: "Venue", value: selectedPlay.venue || "N/A" },
                  { icon: MdPersonOutline, label: "Your Role", value: selectedPlay.role || "N/A" },
                  { icon: IoCashOutline, label: "Regular", value: `KES ${selectedPlay.regularPrice || 0}` },
                  { icon: IoStarOutline, label: "VIP", value: `KES ${selectedPlay.vipPrice || 0}` },
                  { icon: IoDiamondOutline, label: "VVIP", value: `KES ${selectedPlay.vvipPrice || 0}` },
                ].map((item, i) => (
                  <div key={i} style={styles.modalDetailItem}>
                    <item.icon size={20} color="#6200EE" />
                    <p style={styles.modalDetailLabel}>{item.label}</p>
                    <p style={i >= 3 ? styles.priceText : styles.modalDetailValue}>{item.value}</p>
                  </div>
                ))}
              </div>

              {selectedPlay.description && (
                <div style={styles.modalSection}>
                  <h3 style={styles.modalSectionTitle}>Description</h3>
                  <p style={styles.modalDescription}>{selectedPlay.description}</p>
                </div>
              )}

              <div style={styles.modalSection}>
                <h3 style={styles.modalSectionTitle}>Assigned Actors</h3>
                {selectedPlay.actors?.length ? (
                  selectedPlay.actors.map((a, i) => (
                    <div key={i} style={styles.actorItem}>
                      <IoPersonOutline size={16} color="#6200EE" />
                      <span style={styles.actorText}>{a.actor?.fullName || "Actor"} - {a.role}</span>
                      <div style={{ ...styles.confirmBadge, ...(a.confirmed ? styles.confirmedBadge : styles.pendingBadge) }}>
                        <span style={styles.confirmBadgeText}>{a.confirmed ? "Confirmed" : "Pending"}</span>
                      </div>
                    </div>
                  ))
                ) : <p style={styles.noDataText}>No actors assigned</p>}
              </div>

              {(() => {
                const actorReqs = selectedPlay.materialRequests?.filter(r => r.actor === actor?._id) || [];
                const hasPrepared = actorReqs.some(r => r.status === "prepared");
                return actorReqs.length ? (
                  <div style={styles.modalSection}>
                    <h3 style={styles.modalSectionTitle}>Your Material Requests</h3>
                    {hasPrepared && (
                      <div style={styles.collectionAlert}>
                        <IoCubeOutline size={20} color="#fff" />
                        <span style={styles.collectionAlertText}>Items are prepared! You can collect them.</span>
                      </div>
                    )}
                    {actorReqs.map((req, idx) => (
                      <div key={idx} style={{ ...styles.requestItem, ...(req.status === "prepared" && styles.preparedRequest) }}>
                        <div style={styles.requestHeader}>
                          <IoCube size={16} color="#6200EE" />
                          <span style={styles.requestDate}>Requested: {new Date(req.requestedAt || req.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={styles.requestMaterials}>
                          {Array.isArray(req.materials) && req.materials.map((m, i) => (
                            <div key={i} style={styles.materialItem}>
                              <span style={styles.materialName}>{typeof m === "object" ? m.name : m}</span>
                              <span style={styles.materialQuantity}>×{typeof m === "object" ? m.quantity : 1}</span>
                            </div>
                          ))}
                        </div>
                        <div style={styles.requestFooter}>
                          <div style={{ ...styles.statusBadgeSmall, ...styles[`status${req.status}`] }}>
                            <span style={styles.statusTextSmall}>{req.status?.toUpperCase() || "PENDING"}</span>
                          </div>
                          {req.status === "prepared" && (
                            <button style={styles.collectButton} onClick={() => setCollectConfirm({ show: true, requestId: req._id })}>
                              <IoCheckmarkCircle size={16} color="#fff" /><span style={styles.collectButtonText}>Mark as Collected</span>
                            </button>
                          )}
                          {req.status === "collected" && (
                            <div style={styles.collectedBadge}>
                              <IoCheckmarkDoneOutline size={14} color="#fff" />
                              <span style={styles.collectedText}>{req.collectedAt ? `Collected on ${new Date(req.collectedAt).toLocaleDateString()}` : "Collected"}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}

              <div style={styles.modalSection}>
                <h3 style={styles.modalSectionTitle}>Request New Items</h3>
                <p style={styles.sectionSubtitle}>Available items:</p>
                {!items.length ? (
                  <div style={styles.noItemsContainer}>
                    <IoCubeOutline size={40} color="#ccc" />
                    <p style={styles.noItemsText}>No items available at the moment</p>
                  </div>
                ) : (
                  <>
                    {items.map(item => {
                      const sel = selectedItems[item._id];
                      return (
                        <div key={item._id} style={{ ...styles.itemCard, ...(sel && styles.itemCardSelected) }} onClick={() => toggleItem(item)}>
                          <div style={styles.itemHeader}>
                            <div style={styles.itemInfo}>
                              <span style={{ ...styles.itemName, ...(sel && styles.itemNameSelected) }}>{item.name}</span>
                              {item.category && <span style={styles.itemCategory}>{item.category}</span>}
                            </div>
                            {sel && <IoCheckmarkCircle size={20} color="#fff" />}
                          </div>
                          <div style={styles.itemDetails}>
                            <div style={styles.quantityBadge}>
                              <IoCubeOutline size={12} color={sel ? "#fff" : "#666"} />
                              <span style={{ ...styles.quantityText, ...(sel && styles.quantityTextSelected) }}>Available: {item.quantity} {item.unit || "pcs"}</span>
                            </div>
                            {item.location && (
                              <div style={styles.locationBadge}>
                                <IoLocationOutline size={12} color={sel ? "#fff" : "#666"} />
                                <span style={{ ...styles.locationText, ...(sel && styles.locationTextSelected) }}>{item.location}</span>
                              </div>
                            )}
                          </div>
                          {sel && (
                            <div style={styles.quantitySelector}>
                              <button style={styles.quantityBtn} onClick={e => { e.stopPropagation(); updateQty(item._id, -1); }}><IoRemove size={16} color="#fff" /></button>
                              <div style={styles.quantityDisplay}>
                                <span style={styles.quantityValue}>{sel.quantity}</span>
                                <span style={styles.quantityLabel}>requesting</span>
                              </div>
                              <button style={styles.quantityBtn} onClick={e => { e.stopPropagation(); updateQty(item._id, 1); }}><IoAdd size={16} color="#fff" /></button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button style={{ ...styles.submitButton, ...(!Object.values(selectedItems).filter(Boolean).length && styles.submitButtonDisabled) }} onClick={requestItems} disabled={!Object.values(selectedItems).filter(Boolean).length}>
                      <IoSendOutline size={18} color="#fff" /><span style={styles.submitButtonText}>Request {Object.values(selectedItems).filter(Boolean).length} Item{Object.values(selectedItems).filter(Boolean).length !== 1 && "s"}</span>
                    </button>
                    {Object.values(selectedItems).filter(Boolean).length > 0 && (
                      <div style={styles.selectedSummary}>
                        <p style={styles.summaryTitle}>Selected Items:</p>
                        {Object.values(selectedItems).filter(Boolean).map(({ item, quantity }) => (
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

const styles = {
  container: { flex: 1, backgroundColor: "#f5f5f5", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" },
  centered: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#f5f5f5" },
  spinner: { width: 40, height: 40, border: "4px solid #f3f3f3", borderTop: "4px solid #6200EE", borderRadius: "50%", animation: "spin 1s linear infinite" },
  loadingText: { marginTop: 15, color: "#666", fontSize: 16 },
  header: { padding: "20px 20px 20px 20px", paddingTop: 40, backgroundColor: "#6200EE", borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  greeting: { color: "#fff", fontSize: 14, opacity: 0.9, margin: 0 },
  actorName: { color: "#fff", fontSize: 24, fontWeight: 700, margin: 0 },
  profileButton: { background: "transparent", border: "none", cursor: "pointer" },
  profileInfo: { marginTop: 5 },
  stageNameBadge: { display: "inline-flex", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", padding: "6px 12px", borderRadius: 20, marginBottom: 8 },
  stageName: { color: "#fff", fontSize: 14, fontWeight: 600, marginLeft: 5 },
  actorContact: { color: "#fff", fontSize: 14, opacity: 0.9, margin: 0, display: "flex", alignItems: "center", gap: 5 },
  searchContainer: { display: "flex", alignItems: "center", backgroundColor: "#fff", margin: "20px 20px 15px 20px", padding: "0 15px", height: 50, borderRadius: 12 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#333", border: "none", outline: "none", background: "transparent" },
  clearButton: { background: "transparent", border: "none", cursor: "pointer", padding: 4 },
  tabContainer: { display: "flex", margin: "0 20px 15px 20px", backgroundColor: "#fff", borderRadius: 10, padding: 4 },
  tabButton: { flex: 1, padding: 10, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer" },
  tabButtonActive: { backgroundColor: "#6200EE" },
  tabText: { fontSize: 14, fontWeight: 600, color: "#666" },
  tabTextActive: { color: "#fff" },
  listContainer: { padding: "0 20px 100px 20px" },
  playCard: { display: "flex", backgroundColor: "#fff", borderRadius: 16, marginBottom: 15, padding: 15, cursor: "pointer" },
  playImage: { width: 100, height: 100, borderRadius: 12, objectFit: "cover" },
  playPlaceholder: { width: 100, height: 100, borderRadius: 12, backgroundColor: "#f0f0f0", display: "flex", justifyContent: "center", alignItems: "center" },
  playInfo: { flex: 1, marginLeft: 15 },
  playHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  playTitle: { fontSize: 18, fontWeight: 700, color: "#333", margin: 0, flex: 1, marginRight: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  statusBadge: { padding: "4px 8px", borderRadius: 12, minWidth: 80, textAlign: "center" },
  statusText: { color: "#fff", fontSize: 12, fontWeight: 600 },
  playDetails: { marginBottom: 12 },
  detailItem: { display: "flex", alignItems: "center", marginBottom: 4, gap: 6 },
  detailText: { fontSize: 14, color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  playFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  confirmButton: { display: "flex", alignItems: "center", backgroundColor: "#4CAF50", padding: "8px 15px", borderRadius: 8, border: "none", cursor: "pointer", gap: 6 },
  confirmButtonText: { color: "#fff", fontSize: 14, fontWeight: 600 },
  confirmedTag: { display: "flex", alignItems: "center", backgroundColor: "#28a745", padding: "6px 12px", borderRadius: 8, gap: 6 },
  confirmedText: { color: "#fff", fontSize: 14, fontWeight: 600 },
  detailsButton: { display: "flex", alignItems: "center", backgroundColor: "#f0f0f0", padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", gap: 4 },
  detailsButtonText: { color: "#6200EE", fontSize: 14, fontWeight: 600 },
  emptyContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 40px" },
  emptyTitle: { fontSize: 18, fontWeight: 600, color: "#666", marginTop: 20, marginBottom: 8, textAlign: "center" },
  emptySubtitle: { fontSize: 14, color: "#999", textAlign: "center", lineHeight: 20 },
  logoutButton: { position: "fixed", bottom: 25, right: 25, backgroundColor: "#6200EE", display: "flex", alignItems: "center", padding: "14px 20px", borderRadius: 30, border: "none", cursor: "pointer", gap: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: 600 },
  refreshButton: { position: "fixed", bottom: 100, right: 25, backgroundColor: "#fff", color: "#6200EE", padding: "10px 20px", borderRadius: 20, border: "1px solid #6200EE", cursor: "pointer", fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  refreshOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "flex-end", zIndex: 1000 },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: "90%", width: "100%", maxWidth: 600, paddingTop: 20, overflow: "hidden", display: "flex", flexDirection: "column" },
  closeButtonTop: { position: "absolute", top: 20, right: 20, zIndex: 10, backgroundColor: "#f0f0f0", borderRadius: 20, padding: 5, border: "none", cursor: "pointer" },
  modalScroll: { overflowY: "auto", padding: "0 20px 20px 20px" },
  modalImage: { width: "100%", height: 200, objectFit: "cover", borderTopLeftRadius: 25, borderTopRightRadius: 25, marginBottom: 15 },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  modalTitle: { fontSize: 24, fontWeight: 700, color: "#333", margin: 0, flex: 1, marginRight: 10 },
  modalStatusBadge: { padding: "6px 10px", borderRadius: 15 },
  modalStatusText: { color: "#fff", fontSize: 12, fontWeight: 600 },
  modalDetailsGrid: { display: "flex", flexWrap: "wrap", marginBottom: 20 },
  modalDetailItem: { width: "50%", marginBottom: 15, paddingRight: 10 },
  modalDetailLabel: { fontSize: 12, color: "#999", margin: "4px 0 2px 0" },
  modalDetailValue: { fontSize: 14, fontWeight: 600, color: "#333", margin: 0 },
  priceText: { color: "#4CAF50", fontSize: 16, fontWeight: 700, margin: 0 },
  modalSection: { marginBottom: 25 },
  modalSectionTitle: { fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 10 },
  sectionSubtitle: { fontSize: 14, color: "#666", marginBottom: 15 },
  modalDescription: { fontSize: 15, lineHeight: 22, color: "#444", margin: 0 },
  actorItem: { display: "flex", alignItems: "center", backgroundColor: "#f8f9fa", padding: 12, borderRadius: 8, marginBottom: 8 },
  actorText: { fontSize: 14, color: "#333", marginLeft: 10, flex: 1 },
  confirmBadge: { padding: "4px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600, color: "#fff" },
  confirmedBadge: { backgroundColor: "#28a745" },
  pendingBadge: { backgroundColor: "#ffc107" },
  confirmBadgeText: { color: "#fff", fontSize: 10, fontWeight: 600 },
  collectionAlert: { display: "flex", alignItems: "center", backgroundColor: "#4CAF50", padding: 12, borderRadius: 8, marginBottom: 15, gap: 10 },
  collectionAlertText: { color: "#fff", fontSize: 14, fontWeight: 600 },
  requestItem: { backgroundColor: "#f8f9fa", borderRadius: 12, padding: 15, marginBottom: 12 },
  preparedRequest: { border: "2px solid #4CAF50", backgroundColor: "#f0f9f0" },
  requestHeader: { display: "flex", alignItems: "center", marginBottom: 8, gap: 8 },
  requestDate: { fontSize: 12, color: "#666" },
  requestMaterials: { marginBottom: 10 },
  materialItem: { display: "flex", justifyContent: "space-between", paddingTop: 6, paddingBottom: 6, borderBottom: "1px solid #eee" },
  materialName: { fontSize: 14, color: "#333" },
  materialQuantity: { fontSize: 14, fontWeight: 600, color: "#6200EE" },
  requestFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  statusBadgeSmall: { padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, color: "#fff" },
  statusTextSmall: { color: "#fff", fontSize: 11, fontWeight: 600 },
  statusapproved: { backgroundColor: "#28a745" },
  statusrejected: { backgroundColor: "#dc3545" },
  statuspending: { backgroundColor: "#ffc107" },
  statusprepared: { backgroundColor: "#4CAF50" },
  statuscollected: { backgroundColor: "#2196f3" },
  collectButton: { display: "flex", alignItems: "center", backgroundColor: "#4CAF50", padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", gap: 5 },
  collectButtonText: { color: "#fff", fontSize: 12, fontWeight: 600 },
  collectedBadge: { display: "flex", alignItems: "center", backgroundColor: "#28a745", padding: "5px 10px", borderRadius: 8, gap: 5 },
  collectedText: { color: "#fff", fontSize: 11, fontWeight: 600 },
  noDataText: { fontSize: 14, color: "#999", fontStyle: "italic" },
  itemsContainer: { marginBottom: 20 },
  itemCard: { backgroundColor: "#f8f9fa", borderRadius: 12, padding: 16, marginBottom: 10, border: "2px solid transparent", cursor: "pointer" },
  itemCardSelected: { backgroundColor: "#6200EE", borderColor: "#6200EE" },
  itemHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 600, color: "#333", display: "block", marginBottom: 4 },
  itemNameSelected: { color: "#fff" },
  itemCategory: { fontSize: 12, color: "#666", backgroundColor: "#e9ecef", padding: "2px 8px", borderRadius: 4, display: "inline-block" },
  itemDetails: { display: "flex", alignItems: "center", marginBottom: 10, gap: 10 },
  quantityBadge: { display: "flex", alignItems: "center", backgroundColor: "#fff", padding: "4px 10px", borderRadius: 6, gap: 4 },
  quantityText: { fontSize: 12, color: "#666" },
  quantityTextSelected: { color: "#fff" },
  locationBadge: { display: "flex", alignItems: "center", backgroundColor: "#fff", padding: "4px 10px", borderRadius: 6, gap: 4 },
  locationText: { fontSize: 12, color: "#666" },
  locationTextSelected: { color: "#fff" },
  quantitySelector: { display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, padding: 8 },
  quantityBtn: { backgroundColor: "rgba(255,255,255,0.3)", width: 36, height: 36, borderRadius: 18, display: "flex", justifyContent: "center", alignItems: "center", border: "none", cursor: "pointer" },
  quantityDisplay: { display: "flex", flexDirection: "column", alignItems: "center" },
  quantityValue: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  quantityLabel: { fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  noItemsContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 },
  noItemsText: { fontSize: 14, color: "#999", marginTop: 10, textAlign: "center" },
  submitButton: { display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#6200EE", padding: 14, borderRadius: 12, border: "none", cursor: "pointer", marginTop: 10, gap: 8 },
  submitButtonDisabled: { backgroundColor: "#ccc", cursor: "not-allowed" },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: 600 },
  selectedSummary: { backgroundColor: "#f0f0f0", borderRadius: 12, padding: 15, marginTop: 15 },
  summaryTitle: { fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 8 },
  summaryItem: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6, paddingBottom: 6 },
  summaryName: { fontSize: 14, color: "#555", flex: 1 },
  summaryQuantity: { fontSize: 14, fontWeight: 600, color: "#6200EE", marginLeft: 10 },
  // Toast
  toastContainer: { position: "fixed", top: 20, right: 20, zIndex: 2000, display: "flex", flexDirection: "column", gap: 10 },
  toast: { display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 250, maxWidth: 400, padding: "12px 16px", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 500, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", animation: "slideIn 0.3s ease" },
  toastClose: { background: "none", border: "none", cursor: "pointer", marginLeft: 12, padding: 0, color: "#fff", fontSize: 18, lineHeight: 1 },
  toastinfo: { backgroundColor: "#2196F3" },
  toastsuccess: { backgroundColor: "#4CAF50" },
  toasterror: { backgroundColor: "#F44336" },
  toastwarning: { backgroundColor: "#FF9800" },
  // Confirmation modal
  confirmModal: { backgroundColor: "#fff", borderRadius: 12, padding: 24, maxWidth: 400, width: "90%", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", margin: "auto" },
  confirmButtons: { display: "flex", justifyContent: "space-between", gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, border: "1px solid #ddd", backgroundColor: "#f5f5f5", fontSize: 16, fontWeight: 500, cursor: "pointer" },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 8, border: "none", backgroundColor: "#4CAF50", color: "#fff", fontSize: 16, fontWeight: 500, cursor: "pointer" },
};

// Global keyframes
(() => {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `;
  document.head.appendChild(style);
})();