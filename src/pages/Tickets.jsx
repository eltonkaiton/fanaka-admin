import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  IoList,
  IoTime,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTicket,
  IoCloseCircleOutline,
  IoSearch,
  IoRefresh,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoCalendarOutline,
  IoTicketOutline,
  IoPeopleOutline,
  IoLocationOutline,
  IoCashOutline,
  IoCardOutline,
  IoCheckmarkDoneCircle,
  IoAlertCircle,
  IoCheckmark,
  IoClose,
} from "react-icons/io5";

const API_BASE_URL = "http://localhost:5000";

export default function Tickets() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionType, setActionType] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const searchRef = useRef(null);

  const fetchTickets = async () => {
    try {
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/api/bookings`);
      if (res.data?.success && res.data.bookings) {
        setTickets(res.data.bookings);
      } else {
        setTickets([]);
        setError("Unexpected response format");
      }
    } catch (error) {
      console.error("Fetch error:", error.message);
      setError("Failed to load tickets. Please check your connection.");
      alert("Error: Failed to load tickets");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filter tickets by selected tab
  const filterTickets = () => {
    return tickets.filter((ticket) => {
      if (selectedTab === "pending") return ticket.paymentStatus === "pending";
      if (selectedTab === "approved") return ticket.paymentStatus === "approved";
      if (selectedTab === "rejected") return ticket.paymentStatus === "rejected";
      if (selectedTab === "confirmed") return ticket.status === "confirmed";
      if (selectedTab === "cancelled") return ticket.status === "cancelled";
      return true; // "all"
    });
  };

  // Search tickets by name, email, play title, or reference
  const searchTickets = (ticketsToSearch) => {
    if (!searchQuery.trim()) return ticketsToSearch;
    const query = searchQuery.toLowerCase().trim();
    return ticketsToSearch.filter(
      (ticket) =>
        (ticket.customerName && ticket.customerName.toLowerCase().includes(query)) ||
        (ticket.customerEmail && ticket.customerEmail.toLowerCase().includes(query)) ||
        (ticket.playTitle && ticket.playTitle.toLowerCase().includes(query)) ||
        (ticket.bookingReference && ticket.bookingReference.toLowerCase().includes(query))
    );
  };

  const filteredTickets = searchTickets(filterTickets());

  const updatePaymentStatus = async (ticketId, status) => {
    try {
      setUpdatingStatus(true);
      const response = await axios.put(`${API_BASE_URL}/api/bookings/${ticketId}`, {
        paymentStatus: status,
      });
      if (response.data.success) {
        alert(`Payment ${status} successfully`);
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.id === ticketId || ticket._id === ticketId
              ? { ...ticket, paymentStatus: status }
              : ticket
          )
        );
        setModalVisible(false);
      } else {
        alert(response.data.msg || "Failed to update status");
      }
    } catch (error) {
      console.error("Update status error:", error.message);
      alert("Error: Failed to update payment status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusAction = (ticket, action) => {
    setSelectedTicket(ticket);
    setActionType(action);
    setModalVisible(true);
  };

  const confirmAction = () => {
    if (selectedTicket && actionType) {
      updatePaymentStatus(selectedTicket.id || selectedTicket._id, actionType);
    }
  };

  const getStatusColor = (paymentStatus, bookingStatus) => {
    switch (paymentStatus) {
      case "approved":
        return "#10B981";
      case "rejected":
        return "#EF4444";
      case "pending":
        return "#F59E0B";
      default:
        switch (bookingStatus) {
          case "confirmed":
            return "#10B981";
          case "cancelled":
            return "#EF4444";
          default:
            return "#6B7280";
        }
    }
  };

  const getStatusText = (paymentStatus, bookingStatus) => {
    if (paymentStatus) return paymentStatus.toUpperCase();
    return bookingStatus ? bookingStatus.toUpperCase() : "UNKNOWN";
  };

  const formatSeats = (allocatedSeats) => {
    if (!allocatedSeats) return "N/A";
    if (Array.isArray(allocatedSeats)) {
      if (allocatedSeats.length > 0) {
        if (typeof allocatedSeats[0] === "string") return allocatedSeats.join(", ");
        if (typeof allocatedSeats[0] === "object")
          return allocatedSeats
            .map((seat) => seat.number || seat.id || "Unknown")
            .join(", ");
      }
      return allocatedSeats.join(", ");
    }
    return "N/A";
  };

  const renderTicket = (item) => {
    const seats = formatSeats(item.allocatedSeats);
    const playDate = item.playDate
      ? new Date(item.playDate).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Date not set";
    const bookingDate = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString()
      : new Date().toLocaleDateString();
    const totalPrice = item.totalPrice || 0;
    const quantity = item.quantity || 0;
    const ticketType = item.ticketType || "regular";
    const statusColor = getStatusColor(item.paymentStatus, item.status);
    const statusText = getStatusText(item.paymentStatus, item.status);
    const bookingRef =
      item.bookingReference || `REF-${item.id?.substring(0, 8) || "N/A"}`;
    const paymentMethod = item.paymentMethod || "Unknown";

    return (
      <div key={item.id || item._id} style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ flex: 1 }}>
            <h3 style={styles.playTitle}>{item.playTitle || "Untitled Play"}</h3>
            <p style={styles.bookingRef}>Ref: {bookingRef}</p>
          </div>
          <div style={{ ...styles.statusBadge, backgroundColor: statusColor }}>
            <span style={styles.statusText}>{statusText}</span>
          </div>
        </div>

        <div style={styles.customerSection}>
          <div style={styles.customerRow}>
            <IoPersonOutline size={16} color="#666" />
            <span style={styles.customerLabel}>Name:</span>
            <span style={styles.customerValue}>{item.customerName || "Customer"}</span>
          </div>
          <div style={styles.customerRow}>
            <IoMailOutline size={16} color="#666" />
            <span style={styles.customerLabel}>Email:</span>
            <span style={styles.customerValue}>{item.customerEmail || "Email not available"}</span>
          </div>
          {item.customerPhone && (
            <div style={styles.customerRow}>
              <IoCallOutline size={16} color="#666" />
              <span style={styles.customerLabel}>Phone:</span>
              <span style={styles.customerValue}>{item.customerPhone}</span>
            </div>
          )}
        </div>

        <div style={styles.detailsContainer}>
          <div style={styles.detailRow}>
            <IoCalendarOutline size={16} color="#666" />
            <span style={styles.detailLabel}>Event:</span>
            <span style={styles.detailValue}>{playDate}</span>
          </div>
          <div style={styles.detailRow}>
            <IoTicketOutline size={16} color="#666" />
            <span style={styles.detailLabel}>Type:</span>
            <span style={styles.detailValue}>{ticketType.toUpperCase()}</span>
          </div>
          <div style={styles.detailRow}>
            <IoPeopleOutline size={16} color="#666" />
            <span style={styles.detailLabel}>Qty:</span>
            <span style={styles.detailValue}>
              {quantity} ticket{quantity !== 1 ? "s" : ""}
            </span>
          </div>
          <div style={styles.detailRow}>
            <IoLocationOutline size={16} color="#666" />
            <span style={styles.detailLabel}>Seats:</span>
            <span style={styles.detailValue}>{seats}</span>
          </div>
          <div style={styles.detailRow}>
            <IoCashOutline size={16} color="#666" />
            <span style={styles.detailLabel}>Total:</span>
            <span style={styles.detailValue}>KES {totalPrice.toLocaleString()}</span>
          </div>
          <div style={styles.detailRow}>
            <IoCardOutline size={16} color="#666" />
            <span style={styles.detailLabel}>Payment:</span>
            <span style={styles.detailValue}>{paymentMethod.toUpperCase()}</span>
          </div>
        </div>

        {item.paymentStatus === "pending" && (
          <div style={styles.actionButtons}>
            <button
              style={{ ...styles.actionButton, ...styles.approveButton }}
              onClick={() => handleStatusAction(item, "approved")}
            >
              <IoCheckmarkCircle size={18} color="#fff" />
              <span style={styles.actionButtonText}>Approve</span>
            </button>
            <button
              style={{ ...styles.actionButton, ...styles.rejectButton }}
              onClick={() => handleStatusAction(item, "rejected")}
            >
              <IoCloseCircle size={18} color="#fff" />
              <span style={styles.actionButtonText}>Reject</span>
            </button>
          </div>
        )}

        {item.paymentStatus === "approved" && (
          <div style={styles.statusIndicator}>
            <IoCheckmarkDoneCircle size={18} color="#10B981" />
            <span style={styles.statusIndicatorText}>Payment Approved</span>
          </div>
        )}
        {item.paymentStatus === "rejected" && (
          <div style={styles.statusIndicator}>
            <IoAlertCircle size={18} color="#EF4444" />
            <span style={styles.statusIndicatorText}>Payment Rejected</span>
          </div>
        )}

        <div style={styles.cardFooter}>
          <p style={styles.bookingDate}>Booked on {bookingDate}</p>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div style={styles.emptyState}>
      <IoTicketOutline size={80} color="#D1D5DB" />
      <h2 style={styles.emptyStateTitle}>No Tickets Found</h2>
      <p style={styles.emptyStateText}>
        {searchQuery
          ? `No results for "${searchQuery}"`
          : selectedTab !== "all"
          ? `No ${selectedTab} tickets found`
          : "No bookings available"}
      </p>
      {(searchQuery || selectedTab !== "all") && (
        <button
          style={styles.clearButton}
          onClick={() => {
            setSearchQuery("");
            setSelectedTab("all");
          }}
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  const renderTabButton = (tab, label, icon) => {
    const IconComponent = icon;
    return (
      <button
        style={{
          ...styles.tabButton,
          ...(selectedTab === tab ? styles.tabButtonActive : {}),
        }}
        onClick={() => setSelectedTab(tab)}
      >
        <IconComponent
          size={18}
          color={selectedTab === tab ? "#fff" : "#6B7280"}
          style={styles.tabIcon}
        />
        <span
          style={{
            ...styles.tabButtonText,
            ...(selectedTab === tab ? styles.tabButtonTextActive : {}),
          }}
        >
          {label}
        </span>
      </button>
    );
  };

  if (loading && !refreshing) {
    return (
      <div style={styles.loader}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading tickets...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.headerTitle}>Tickets Management</h1>
            <p style={styles.headerSubtitle}>
              {filteredTickets.length} of {tickets.length} tickets
            </p>
          </div>
          <div style={styles.headerActions}>
            <button
              style={styles.headerButton}
              onClick={() => setIsSearchVisible(!isSearchVisible)}
            >
              {isSearchVisible ? <IoClose size={24} color="#fff" /> : <IoSearch size={24} color="#fff" />}
            </button>
            <button style={styles.headerButton} onClick={fetchTickets}>
              <IoRefresh size={24} color="#fff" />
            </button>
          </div>
        </div>
      </div>

      {/* Search bar (animated) */}
      <div
        style={{
          ...styles.searchContainer,
          maxHeight: isSearchVisible ? "60px" : "0",
          opacity: isSearchVisible ? 1 : 0,
          padding: isSearchVisible ? "8px 16px" : "0 16px",
          transition: "max-height 0.3s ease, opacity 0.2s ease, padding 0.2s ease",
        }}
      >
        <div style={styles.searchInputContainer}>
          <IoSearch size={20} color="#666" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, email, play, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <button style={styles.clearSearch} onClick={() => setSearchQuery("")}>
              <IoClose size={20} color="#999" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <div style={styles.tabsContent}>
          {renderTabButton("all", "All", IoList)}
          {renderTabButton("pending", "Pending", IoTime)}
          {renderTabButton("approved", "Approved", IoCheckmarkCircle)}
          {renderTabButton("rejected", "Rejected", IoCloseCircle)}
          {renderTabButton("confirmed", "Confirmed", IoTicket)}
          {renderTabButton("cancelled", "Cancelled", IoCloseCircleOutline)}
        </div>
      </div>

      {/* Ticket list */}
      <div style={styles.listContainer}>
        {filteredTickets.length === 0 ? (
          renderEmptyState()
        ) : (
          <div style={styles.listContent}>
            {filteredTickets.map((ticket) => renderTicket(ticket))}
          </div>
        )}
      </div>

      {/* Refresh indicator */}
      {refreshing && (
        <div style={styles.refreshOverlay}>
          <div style={styles.spinner}></div>
        </div>
      )}

      {/* Modal */}
      {modalVisible && (
        <div style={styles.modalOverlay} onClick={() => setModalVisible(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              {actionType === "approved" ? (
                <IoCheckmarkCircle size={40} color="#10B981" />
              ) : (
                <IoAlertCircle size={40} color="#EF4444" />
              )}
              <h2 style={styles.modalTitle}>
                {actionType === "approved" ? "Approve Payment" : "Reject Payment"}
              </h2>
              <p style={styles.modalSubtitle}>
                {actionType === "approved"
                  ? "Are you sure you want to approve this payment?"
                  : "Are you sure you want to reject this payment?"}
              </p>
            </div>

            {selectedTicket && (
              <div style={styles.modalTicketInfo}>
                <h4 style={styles.modalTicketTitle}>{selectedTicket.playTitle}</h4>
                <p style={styles.modalTicketDetail}>
                  Customer: {selectedTicket.customerName}
                </p>
                <p style={styles.modalTicketDetail}>
                  Amount: KES {selectedTicket.totalPrice?.toLocaleString()}
                </p>
                <p style={styles.modalTicketDetail}>
                  Reference: {selectedTicket.bookingReference}
                </p>
              </div>
            )}

            <div style={styles.modalButtons}>
              <button
                style={{ ...styles.modalButton, ...styles.modalCancelButton }}
                onClick={() => setModalVisible(false)}
                disabled={updatingStatus}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.modalButton,
                  ...(actionType === "approved"
                    ? styles.modalApproveButton
                    : styles.modalRejectButton),
                }}
                onClick={confirmAction}
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <div style={styles.spinnerSmall}></div>
                ) : (
                  <>
                    {actionType === "approved" ? (
                      <IoCheckmark size={20} color="#fff" />
                    ) : (
                      <IoClose size={20} color="#fff" />
                    )}
                    <span style={styles.modalButtonText}>
                      {actionType === "approved" ? "Approve" : "Reject"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline styles
const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    backgroundColor: "#6200EE",
    padding: "20px",
    paddingTop: "30px",
    paddingBottom: "15px",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#fff",
    margin: 0,
  },
  headerSubtitle: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.9)",
    margin: "2px 0 0",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    backgroundColor: "#fff",
    overflow: "hidden",
    borderBottom: "1px solid #E5E7EB",
  },
  searchInputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "16px",
    padding: "8px 0",
    color: "#333",
  },
  clearSearch: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
  },
  tabsContainer: {
    backgroundColor: "#fff",
    borderBottom: "1px solid #E5E7EB",
    overflowX: "auto",
  },
  tabsContent: {
    display: "flex",
    gap: "8px",
    padding: "8px 16px",
  },
  tabButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "20px",
    backgroundColor: "#F3F4F6",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  tabButtonActive: {
    backgroundColor: "#6200EE",
  },
  tabIcon: {
    marginRight: "4px",
  },
  tabButtonText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6B7280",
  },
  tabButtonTextActive: {
    color: "#fff",
  },
  loader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "80vh",
  },
  loadingText: {
    marginTop: "12px",
    fontSize: "16px",
    color: "#666",
  },
  listContainer: {
    padding: "16px",
  },
  listContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #f0f0f0",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: "1px solid #F3F4F6",
  },
  playTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1F2937",
    margin: "0 0 4px",
  },
  bookingRef: {
    fontSize: "12px",
    color: "#6B7280",
    fontFamily: "monospace",
    margin: 0,
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    minWidth: "100px",
    textAlign: "center",
  },
  statusText: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: "0.5px",
  },
  customerSection: {
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: "1px solid #F3F4F6",
  },
  customerRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    fontSize: "14px",
  },
  customerLabel: {
    color: "#6B7280",
    width: "50px",
  },
  customerValue: {
    color: "#1F2937",
    fontWeight: "500",
    flex: 1,
  },
  detailsContainer: {
    marginBottom: "16px",
  },
  detailRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
    fontSize: "14px",
  },
  detailLabel: {
    color: "#6B7280",
    width: "60px",
  },
  detailValue: {
    color: "#1F2937",
    fontWeight: "500",
    flex: 1,
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
  },
  actionButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
  approveButton: {
    backgroundColor: "#10B981",
  },
  rejectButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: "14px",
  },
  statusIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
    backgroundColor: "#F3F4F6",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  statusIndicatorText: {
    fontSize: "14px",
    fontWeight: "600",
  },
  cardFooter: {
    paddingTop: "12px",
    borderTop: "1px solid #F3F4F6",
  },
  bookingDate: {
    fontSize: "12px",
    color: "#9CA3AF",
    textAlign: "right",
    margin: 0,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  emptyStateTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: "16px",
    marginBottom: "8px",
  },
  emptyStateText: {
    fontSize: "16px",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: "24px",
    lineHeight: "22px",
  },
  clearButton: {
    backgroundColor: "#6200EE",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
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
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #6200EE",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  spinnerSmall: {
    width: "20px",
    height: "20px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    padding: "24px",
    maxWidth: "400px",
    width: "100%",
  },
  modalHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "24px",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: "12px",
    marginBottom: "8px",
  },
  modalSubtitle: {
    fontSize: "16px",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: "22px",
    margin: 0,
  },
  modalTicketInfo: {
    backgroundColor: "#F9FAFB",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "24px",
  },
  modalTicketTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1F2937",
    margin: "0 0 8px",
  },
  modalTicketDetail: {
    fontSize: "14px",
    color: "#6B7280",
    margin: "4px 0",
  },
  modalButtons: {
    display: "flex",
    gap: "12px",
  },
  modalButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
  modalCancelButton: {
    backgroundColor: "#F3F4F6",
    border: "1px solid #E5E7EB",
    color: "#6B7280",
  },
  modalApproveButton: {
    backgroundColor: "#10B981",
    color: "#fff",
  },
  modalRejectButton: {
    backgroundColor: "#EF4444",
    color: "#fff",
  },
  modalButtonText: {
    fontSize: "16px",
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