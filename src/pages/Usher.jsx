import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  IoFilterOutline,
  IoChatbubbleEllipsesOutline,
  IoLogOutOutline,
  IoQrCodeOutline,
  IoCheckmarkCircleOutline,
  IoEnterOutline,
  IoClose,
  IoAppsOutline,
  IoCheckmarkCircleOutline as IoCheckmarkCircleOutline2,
  IoTimeOutline,
  IoEnterOutline as IoEnterOutline2,
  IoLogOutOutline as IoLogOutOutline2,
  IoCloseCircleOutline,
  IoEllipsisHorizontal,
  IoArrowBack,
  IoCalendarOutline,
  IoTimeOutline as IoTimeOutline2,
  IoMailOutline,
  IoCallOutline,
  IoCheckmarkDoneCircle,
} from "react-icons/io5";

const API_BASE_URL = "https://fanaka-server-1.onrender.com";

export default function Usher() {
  const navigate = useNavigate();

  const [bookingRef, setBookingRef] = useState("");
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [todayBookings, setTodayBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusBookings, setStatusBookings] = useState([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  useEffect(() => {
    fetchTodayBookings();
    fetchAllBookings();
  }, []);

  useEffect(() => {
    filterBookingsByStatus();
  }, [selectedStatus, todayBookings, allBookings, showAllBookings]);

  const fetchTodayBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const today = new Date().toISOString().split("T")[0];
      const response = await axios.get(
        `${API_BASE_URL}/api/bookings?date=${today}&status=confirmed`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) setTodayBookings(response.data.bookings);
    } catch (error) {
      console.error("Error fetching today bookings:", error);
      alert("Error: Failed to load today's bookings");
    }
  };

  const fetchAllBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) setAllBookings(response.data.bookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
    }
  };

  const filterBookingsByStatus = () => {
    const bookings = showAllBookings ? allBookings : todayBookings;
    if (selectedStatus === "all") {
      setFilteredBookings(bookings);
    } else if (selectedStatus === "checkedIn") {
      setFilteredBookings(bookings.filter((booking) => booking.checkedIn));
    } else if (selectedStatus === "notCheckedIn") {
      setFilteredBookings(
        bookings.filter((booking) => !booking.checkedIn && booking.status === "confirmed")
      );
    } else {
      setFilteredBookings(
        bookings.filter((booking) => booking.status === selectedStatus)
      );
    }
  };

  const verifyBooking = async () => {
    if (!bookingRef.trim()) {
      alert("Please enter booking reference");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/bookings/verify/${bookingRef}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setBookingData(response.data.booking);
        setShowBookingDetails(true);
      } else {
        alert("Booking reference not found");
        setBookingData(null);
      }
    } catch (error) {
      alert(error.response?.data?.msg || "Failed to verify booking");
    } finally {
      setLoading(false);
    }
  };

  const checkInCustomer = async () => {
    if (!bookingData) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/api/bookings/${bookingData._id}/checkin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        alert("Customer checked in successfully!");
        setBookingData({ ...bookingData, checkedIn: true, checkInTime: new Date() });
        fetchTodayBookings();
        fetchAllBookings();
        setTimeout(() => {
          setBookingRef("");
          setBookingData(null);
          setShowBookingDetails(false);
        }, 1500);
      }
    } catch (error) {
      alert(error.response?.data?.msg || "Failed to check in");
    }
  };

  const handleBack = () => {
    setShowBookingDetails(false);
    setBookingData(null);
    setBookingRef("");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      alert("Logged out successfully");
      navigate("/login");
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      case "checked_in":
        return "#2196F3";
      default:
        return "#757575";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      case "checked_in":
        return "Checked In";
      default:
        return status || "Unknown";
    }
  };

  const handleScanQR = () => {
    alert("QR scanning would be implemented here");
  };

  const showStatusBookings = (status) => {
    const bookings = showAllBookings ? allBookings : todayBookings;
    let filtered = [];

    if (status === "checkedIn") {
      filtered = bookings.filter((booking) => booking.checkedIn);
      setSelectedStatusFilter("Checked In");
    } else if (status === "notCheckedIn") {
      filtered = bookings.filter(
        (booking) => !booking.checkedIn && booking.status === "confirmed"
      );
      setSelectedStatusFilter("Not Checked In");
    } else {
      filtered = bookings.filter((booking) => booking.status === status);
      setSelectedStatusFilter(getStatusText(status));
    }

    setStatusBookings(filtered);
    setStatusModalVisible(true);
  };

  const StatusSidebar = () => (
    <div style={styles.sidebar}>
      <button style={styles.sidebarCloseButton} onClick={() => setSidebarVisible(false)}>
        <IoClose size={24} color="#333" />
      </button>
      <h3 style={styles.sidebarTitle}>Filter by Status</h3>
      <button
        style={{ ...styles.sidebarItem, ...(selectedStatus === "all" ? styles.sidebarItemActive : {}) }}
        onClick={() => {
          setSelectedStatus("all");
          setSidebarVisible(false);
        }}
      >
        <IoAppsOutline size={20} color={selectedStatus === "all" ? "#6200EE" : "#666"} />
        <span style={{ ...styles.sidebarItemText, ...(selectedStatus === "all" ? styles.sidebarItemTextActive : {}) }}>
          All Bookings
        </span>
      </button>
      <div style={styles.sidebarItem}>
        <IoCheckmarkCircleOutline2 size={20} color={selectedStatus === "confirmed" ? "#4CAF50" : "#666"} />
        <button
          style={{ ...styles.sidebarItemText, flex: 1, textAlign: "left", background: "none", border: "none", ...(selectedStatus === "confirmed" ? styles.sidebarItemTextActive : {}) }}
          onClick={() => {
            setSelectedStatus("confirmed");
            setSidebarVisible(false);
          }}
        >
          Confirmed
        </button>
        <button onClick={() => showStatusBookings("confirmed")} style={styles.sidebarEllipsis}>
          <IoEllipsisHorizontal size={20} color="#999" />
        </button>
      </div>
      <div style={styles.sidebarItem}>
        <IoTimeOutline2 size={20} color={selectedStatus === "pending" ? "#FF9800" : "#666"} />
        <button
          style={{ ...styles.sidebarItemText, flex: 1, textAlign: "left", background: "none", border: "none", ...(selectedStatus === "pending" ? styles.sidebarItemTextActive : {}) }}
          onClick={() => {
            setSelectedStatus("pending");
            setSidebarVisible(false);
          }}
        >
          Pending
        </button>
        <button onClick={() => showStatusBookings("pending")} style={styles.sidebarEllipsis}>
          <IoEllipsisHorizontal size={20} color="#999" />
        </button>
      </div>
      <div style={styles.sidebarItem}>
        <IoEnterOutline2 size={20} color={selectedStatus === "checkedIn" ? "#2196F3" : "#666"} />
        <button
          style={{ ...styles.sidebarItemText, flex: 1, textAlign: "left", background: "none", border: "none", ...(selectedStatus === "checkedIn" ? styles.sidebarItemTextActive : {}) }}
          onClick={() => {
            setSelectedStatus("checkedIn");
            setSidebarVisible(false);
          }}
        >
          Checked In
        </button>
        <button onClick={() => showStatusBookings("checkedIn")} style={styles.sidebarEllipsis}>
          <IoEllipsisHorizontal size={20} color="#999" />
        </button>
      </div>
      <div style={styles.sidebarItem}>
        <IoLogOutOutline2 size={20} color={selectedStatus === "notCheckedIn" ? "#FF9800" : "#666"} />
        <button
          style={{ ...styles.sidebarItemText, flex: 1, textAlign: "left", background: "none", border: "none", ...(selectedStatus === "notCheckedIn" ? styles.sidebarItemTextActive : {}) }}
          onClick={() => {
            setSelectedStatus("notCheckedIn");
            setSidebarVisible(false);
          }}
        >
          Not Checked In
        </button>
        <button onClick={() => showStatusBookings("notCheckedIn")} style={styles.sidebarEllipsis}>
          <IoEllipsisHorizontal size={20} color="#999" />
        </button>
      </div>
      <div style={styles.sidebarItem}>
        <IoCloseCircleOutline size={20} color={selectedStatus === "cancelled" ? "#F44336" : "#666"} />
        <button
          style={{ ...styles.sidebarItemText, flex: 1, textAlign: "left", background: "none", border: "none", ...(selectedStatus === "cancelled" ? styles.sidebarItemTextActive : {}) }}
          onClick={() => {
            setSelectedStatus("cancelled");
            setSidebarVisible(false);
          }}
        >
          Cancelled
        </button>
        <button onClick={() => showStatusBookings("cancelled")} style={styles.sidebarEllipsis}>
          <IoEllipsisHorizontal size={20} color="#999" />
        </button>
      </div>
    </div>
  );

  const BookingDetailsModal = () =>
    showBookingDetails && bookingData ? (
      <div style={styles.detailsModalOverlay} onClick={handleBack}>
        <div style={styles.detailsModalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.detailsModalHeader}>
            <button onClick={handleBack} style={styles.iconButton}>
              <IoArrowBack size={24} color="#333" />
            </button>
            <h3 style={styles.detailsModalTitle}>Booking Details</h3>
            <div style={{ width: 24 }} />
          </div>
          <div style={styles.detailsModalBody}>
            <div style={styles.detailsSection}>
              <p style={styles.detailsSectionTitle}>BOOKING INFORMATION</p>
              <p style={styles.detailsBookingRef}>{bookingData.bookingReference}</p>
              <div style={styles.detailsStatusRow}>
                <span style={{ ...styles.detailsStatusBadge, backgroundColor: bookingData.checkedIn ? "#4CAF50" : "#FF9800" }}>
                  {bookingData.checkedIn ? "CHECKED IN" : "NOT CHECKED IN"}
                </span>
                <span style={{ ...styles.detailsStatusBadge, backgroundColor: getStatusColor(bookingData.status) }}>
                  {bookingData.status?.toUpperCase() || "PENDING"}
                </span>
              </div>
            </div>

            <div style={styles.detailsSection}>
              <p style={styles.detailsSectionTitle}>PLAY INFORMATION</p>
              <p style={styles.detailsPlayTitle}>{bookingData.playTitle}</p>
              <div style={styles.detailsRow}>
                <IoCalendarOutline size={18} color="#666" />
                <span style={styles.detailsRowText}>Date: {formatDate(bookingData.playDate)}</span>
              </div>
              <div style={styles.detailsRow}>
                <IoTimeOutline2 size={18} color="#666" />
                <span style={styles.detailsRowText}>Time: {formatTime(bookingData.playDate)}</span>
              </div>
            </div>

            <div style={styles.detailsSection}>
              <p style={styles.detailsSectionTitle}>CUSTOMER INFORMATION</p>
              <p style={styles.detailsCustomerName}>{bookingData.customerName}</p>
              <div style={styles.detailsRow}>
                <IoMailOutline size={18} color="#666" />
                <span style={styles.detailsRowText}>{bookingData.customerEmail}</span>
              </div>
              {bookingData.customerPhone && (
                <div style={styles.detailsRow}>
                  <IoCallOutline size={18} color="#666" />
                  <span style={styles.detailsRowText}>{bookingData.customerPhone}</span>
                </div>
              )}
            </div>

            <div style={styles.detailsSection}>
              <p style={styles.detailsSectionTitle}>TICKET DETAILS</p>
              <div style={styles.detailsGrid}>
                <div style={styles.detailsGridItem}>
                  <p style={styles.detailsGridLabel}>Ticket Type</p>
                  <p style={styles.detailsGridValue}>{bookingData.ticketType?.toUpperCase()}</p>
                </div>
                <div style={styles.detailsGridItem}>
                  <p style={styles.detailsGridLabel}>Quantity</p>
                  <p style={styles.detailsGridValue}>{bookingData.quantity} persons</p>
                </div>
                <div style={styles.detailsGridItem}>
                  <p style={styles.detailsGridLabel}>Total Price</p>
                  <p style={{ ...styles.detailsGridValue, color: "#6200EE" }}>KES {bookingData.totalPrice}</p>
                </div>
              </div>

              {bookingData.allocatedSeats?.length > 0 && (
                <>
                  <p style={styles.detailsSectionSubtitle}>Assigned Seats</p>
                  <div style={styles.seatsContainer}>
                    {bookingData.allocatedSeats.map((seat, index) => (
                      <span key={index} style={styles.seatChip}>
                        {seat.number}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div style={styles.detailsSection}>
              <p style={styles.detailsSectionTitle}>PAYMENT INFORMATION</p>
              <div style={styles.detailsGrid}>
                <div style={styles.detailsGridItem}>
                  <p style={styles.detailsGridLabel}>Payment Method</p>
                  <p style={styles.detailsGridValue}>{bookingData.paymentMethod?.toUpperCase()}</p>
                </div>
                <div style={styles.detailsGridItem}>
                  <p style={styles.detailsGridLabel}>Payment Status</p>
                  <span style={{ ...styles.detailsStatusBadge, backgroundColor: bookingData.paymentStatus === "approved" ? "#4CAF50" : "#FF9800" }}>
                    {bookingData.paymentStatus?.toUpperCase() || "PENDING"}
                  </span>
                </div>
              </div>
              {bookingData.paymentCode && (
                <>
                  <p style={styles.detailsSectionSubtitle}>Payment Code</p>
                  <p style={styles.paymentCode}>{bookingData.paymentCode}</p>
                </>
              )}
            </div>

            {bookingData.checkedIn && bookingData.checkInTime && (
              <div style={styles.detailsSection}>
                <p style={styles.detailsSectionTitle}>CHECK-IN INFORMATION</p>
                <div style={styles.detailsRow}>
                  <IoCheckmarkDoneCircle size={18} color="#4CAF50" />
                  <span style={{ ...styles.detailsRowText, color: "#4CAF50" }}>
                    Checked in at {formatDateTime(bookingData.checkInTime)}
                  </span>
                </div>
              </div>
            )}

            {!bookingData.checkedIn && (
              <div style={styles.detailsActions}>
                <button style={styles.checkInButtonLarge} onClick={checkInCustomer}>
                  <IoEnterOutline size={22} color="#fff" />
                  <span style={styles.checkInButtonLargeText}>Check In Customer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div style={styles.safeArea}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.menuButton} onClick={() => setSidebarVisible(true)}>
            <IoFilterOutline size={24} color="#6200EE" />
          </button>
          <div style={styles.headerCenter}>
            <h1 style={styles.title}>Ticket Verification</h1>
            <p style={styles.subtitle}>Verify and check-in customers</p>
          </div>
          <div style={styles.headerRight}>
            <button
              style={styles.messageButton}
              onClick={() => navigate("/employee-inbox")}
            >
              <IoChatbubbleEllipsesOutline size={24} color="#6200EE" />
            </button>
            <button style={styles.logoutButton} onClick={handleLogout}>
              <IoLogOutOutline size={24} color="#F44336" />
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div style={styles.searchContainer}>
          <div style={styles.searchBox}>
            <input
              type="text"
              style={styles.input}
              placeholder="Enter Booking Reference"
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value)}
              autoCapitalize="characters"
            />
            <button style={styles.scanButton} onClick={handleScanQR}>
              <IoQrCodeOutline size={24} color="#6200EE" />
            </button>
          </div>
          <button style={styles.verifyButton} onClick={verifyBooking} disabled={loading}>
            {loading ? (
              <div style={styles.spinner}></div>
            ) : (
              <>
                <IoCheckmarkCircleOutline size={20} color="#fff" />
                <span style={styles.verifyButtonText}>Verify Ticket</span>
              </>
            )}
          </button>
        </div>

        {/* Bookings List */}
        <div style={styles.bookingsSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              {selectedStatus === "all"
                ? "All"
                : selectedStatus === "checkedIn"
                ? "Checked In"
                : selectedStatus === "notCheckedIn"
                ? "Not Checked In"
                : getStatusText(selectedStatus)}{" "}
              ({filteredBookings.length})
            </h3>
            <button style={styles.toggleButton} onClick={() => setShowAllBookings(!showAllBookings)}>
              <span style={styles.toggleButtonText}>{showAllBookings ? "Today" : "All"}</span>
            </button>
          </div>
          <div style={styles.bookingsList}>
            {filteredBookings.map((booking) => (
              <button
                key={booking._id}
                style={styles.bookingItem}
                onClick={() => {
                  setBookingRef(booking.bookingReference);
                  verifyBooking();
                }}
              >
                <div style={styles.bookingItemLeft}>
                  <p style={styles.bookingItemRef}>{booking.bookingReference}</p>
                  <p style={styles.bookingItemCustomer}>{booking.customerName}</p>
                  <div style={styles.bookingItemDetails}>
                    <p style={styles.bookingItemPlay}>{booking.playTitle}</p>
                    <p style={styles.bookingItemDate}>
                      {formatDate(booking.playDate)} {formatTime(booking.playDate)}
                    </p>
                  </div>
                </div>
                <div style={styles.bookingItemRight}>
                  <p style={styles.bookingItemQuantity}>{booking.quantity} pax</p>
                  <span
                    style={{
                      ...styles.bookingItemStatus,
                      backgroundColor: booking.checkedIn ? "#4CAF50" : getStatusColor(booking.status),
                    }}
                  >
                    {booking.checkedIn ? "In" : booking.status || "Pending"}
                  </span>
                </div>
              </button>
            ))}
            {filteredBookings.length === 0 && <p style={styles.emptyText}>No bookings found</p>}
          </div>
        </div>
      </div>

      {/* Sidebar Modal */}
      {sidebarVisible && (
        <div style={styles.modalOverlay} onClick={() => setSidebarVisible(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <StatusSidebar />
          </div>
        </div>
      )}

      {/* Status Bookings Modal */}
      {statusModalVisible && (
        <div style={styles.statusModalOverlay} onClick={() => setStatusModalVisible(false)}>
          <div style={styles.statusModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.statusModalHeader}>
              <h3 style={styles.statusModalTitle}>
                {selectedStatusFilter} Bookings ({statusBookings.length})
              </h3>
              <button onClick={() => setStatusModalVisible(false)} style={styles.iconButton}>
                <IoClose size={24} color="#333" />
              </button>
            </div>
            <div style={styles.statusModalList}>
              {statusBookings.map((booking) => (
                <button
                  key={booking._id}
                  style={styles.statusModalItem}
                  onClick={() => {
                    setBookingRef(booking.bookingReference);
                    verifyBooking();
                    setStatusModalVisible(false);
                  }}
                >
                  <p style={styles.statusModalRef}>{booking.bookingReference}</p>
                  <p style={styles.statusModalCustomer}>{booking.customerName}</p>
                  <p style={styles.statusModalPlay}>{booking.playTitle}</p>
                  <p style={styles.statusModalTime}>
                    {formatTime(booking.playDate)} • {booking.quantity} seats
                  </p>
                </button>
              ))}
              {statusBookings.length === 0 && <p style={styles.statusModalEmpty}>No bookings found</p>}
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal />
    </div>
  );
}

// Inline styles
const styles = {
  safeArea: {
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  container: {
    padding: "16px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  menuButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
  },
  headerCenter: {
    flex: 1,
    textAlign: "center",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#333",
    margin: 0,
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    margin: "4px 0 0",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  messageButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
  },
  logoutButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
  },
  searchContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
  },
  input: {
    flex: 1,
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "16px",
    marginRight: "10px",
    outline: "none",
  },
  scanButton: {
    background: "#f0f0f0",
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "#6200EE",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    width: "100%",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  verifyButtonText: {
    marginLeft: "8px",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTop: "3px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  bookingsSection: {
    flex: 1,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    margin: 0,
  },
  toggleButton: {
    backgroundColor: "#6200EE",
    borderRadius: "20px",
    padding: "6px 15px",
    border: "none",
    cursor: "pointer",
  },
  toggleButtonText: {
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
  },
  bookingsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "60vh",
    overflowY: "auto",
  },
  bookingItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "16px",
    border: "none",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  bookingItemLeft: {
    flex: 1,
  },
  bookingItemRef: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 2px",
  },
  bookingItemCustomer: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 4px",
  },
  bookingItemDetails: {
    marginTop: "4px",
  },
  bookingItemPlay: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    margin: "0 0 2px",
  },
  bookingItemDate: {
    fontSize: "12px",
    color: "#999",
    margin: 0,
  },
  bookingItemRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  bookingItemQuantity: {
    fontSize: "14px",
    color: "#333",
    margin: "0 0 4px",
  },
  bookingItemStatus: {
    borderRadius: "12px",
    padding: "4px 10px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: "16px",
    marginTop: "20px",
  },
  // Sidebar styles
  sidebar: {
    width: "280px",
    backgroundColor: "#fff",
    height: "100%",
    padding: "20px",
    paddingTop: "50px",
    position: "relative",
  },
  sidebarCloseButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "10px",
  },
  sidebarTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px 15px",
    marginBottom: "8px",
    borderRadius: "8px",
    backgroundColor: "#f8f9fa",
    width: "100%",
    border: "none",
  },
  sidebarItemActive: {
    backgroundColor: "#6200EE10",
    borderLeft: "4px solid #6200EE",
  },
  sidebarItemText: {
    fontSize: "16px",
    color: "#333",
    marginLeft: "12px",
    flex: 1,
  },
  sidebarItemTextActive: {
    color: "#6200EE",
    fontWeight: "600",
  },
  sidebarEllipsis: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px",
  },
  // Modal overlays
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  modalContent: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
  },
  statusModalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 1000,
  },
  statusModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    maxHeight: "80%",
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
  },
  statusModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #eee",
  },
  statusModalTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
    margin: 0,
  },
  statusModalList: {
    padding: "20px",
    maxHeight: "calc(80vh - 80px)",
    overflowY: "auto",
  },
  statusModalItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "10px",
    border: "none",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
  },
  statusModalRef: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 4px",
  },
  statusModalCustomer: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 4px",
  },
  statusModalPlay: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    margin: "0 0 4px",
  },
  statusModalTime: {
    fontSize: "12px",
    color: "#999",
    margin: 0,
  },
  statusModalEmpty: {
    textAlign: "center",
    color: "#999",
    fontSize: "16px",
    padding: "20px",
  },
  // Booking details modal
  detailsModalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 1100,
  },
  detailsModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    maxHeight: "90%",
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    overflow: "hidden",
  },
  detailsModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #eee",
  },
  detailsModalTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
    margin: 0,
  },
  detailsModalBody: {
    padding: "20px",
    maxHeight: "calc(90vh - 80px)",
    overflowY: "auto",
  },
  detailsSection: {
    marginBottom: "25px",
  },
  detailsSectionTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#666",
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  detailsSectionSubtitle: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    marginBottom: "8px",
    marginTop: "5px",
  },
  detailsBookingRef: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "12px",
  },
  detailsStatusRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  detailsStatusBadge: {
    borderRadius: "15px",
    padding: "6px 12px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
  },
  detailsPlayTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "10px",
  },
  detailsCustomerName: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#333",
    marginBottom: "10px",
  },
  detailsRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
  },
  detailsRowText: {
    fontSize: "16px",
    color: "#666",
  },
  detailsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "15px",
  },
  detailsGridItem: {
    width: "calc(50% - 5px)",
    marginBottom: "12px",
  },
  detailsGridLabel: {
    fontSize: "12px",
    color: "#666",
    marginBottom: "4px",
  },
  detailsGridValue: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
    margin: 0,
  },
  seatsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },
  seatChip: {
    backgroundColor: "#6200EE",
    borderRadius: "6px",
    padding: "6px 12px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
  },
  paymentCode: {
    fontSize: "16px",
    fontFamily: "monospace",
    color: "#333",
    backgroundColor: "#f8f9fa",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "5px",
  },
  detailsActions: {
    marginTop: "20px",
    marginBottom: "10px",
  },
  checkInButtonLarge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    backgroundColor: "#4CAF50",
    borderRadius: "10px",
    padding: "18px",
    border: "none",
    width: "100%",
    cursor: "pointer",
  },
  checkInButtonLargeText: {
    color: "#fff",
    fontSize: "18px",
    fontWeight: "600",
  },
  iconButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
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