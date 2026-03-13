import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  IoCalendarOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoPeopleOutline,
  IoInformationCircleOutline,
  IoFilmOutline,
  IoClose,
  IoPerson,
  IoMail,
  IoCall,
  IoRemove,
  IoAdd,
  IoChevronUp,
  IoChevronDown,
  IoStar,
  IoDiamond,
  IoCheckmarkCircle,
  IoArrowForward,
  IoPhonePortrait,
  IoCard,
  IoCash,
} from "react-icons/io5";

const API_BASE_URL = "https://fanaka-server-1.onrender.com";

export default function PlayDetails() {
  const { id } = useParams(); // playId from route /play-details/:id
  const navigate = useNavigate();
  const [play, setPlay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedTicketType, setSelectedTicketType] = useState("regular");
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showSeatDisplay, setShowSeatDisplay] = useState(false);
  const [availableSeats, setAvailableSeats] = useState({
    regular: [],
    vip: [],
    vvip: [],
  });
  const [allocatedSeats, setAllocatedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [paymentCode, setPaymentCode] = useState("");

  useEffect(() => {
    fetchPlay();
    fetchUserData();
  }, [id]);

  const fetchPlay = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/plays/${id}`);
      setPlay(response.data);
      generateSeatData();
    } catch (error) {
      alert("Failed to load play details");
    } finally {
      setLoading(false);
    }
  };

  const generateSeatData = () => {
    const seatData = { regular: [], vip: [], vvip: [] };
    for (let i = 1; i <= 20; i++) {
      seatData.regular.push({ id: i, number: `A${i}`, type: "regular", available: Math.random() > 0.1 });
    }
    for (let i = 1; i <= 20; i++) {
      seatData.vip.push({ id: i + 20, number: `B${i}`, type: "vip", available: Math.random() > 0.2 });
    }
    for (let i = 1; i <= 10; i++) {
      seatData.vvip.push({ id: i + 40, number: `C${i}`, type: "vvip", available: Math.random() > 0.3 });
    }
    setAvailableSeats(seatData);
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });
        setUserData(response.data);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
      }
      setUserData(null);
    }
  };

  useEffect(() => {
    if (play) {
      const priceMap = {
        regular: play.regularPrice || 0,
        vip: play.vipPrice || 0,
        vvip: play.vvipPrice || 0,
      };
      setTotalPrice(priceMap[selectedTicketType] * quantity);
      allocateSeatsAutomatically();
    }
  }, [selectedTicketType, quantity, play, availableSeats]);

  const allocateSeatsAutomatically = () => {
    const seatType = selectedTicketType;
    const seatsToAllocate = quantity;
    const availableSeatsForType = availableSeats[seatType] || [];
    const freeSeats = availableSeatsForType.filter((seat) => seat.available);
    const allocated = freeSeats.slice(0, seatsToAllocate).map((seat) => ({
      id: seat.id,
      number: seat.number,
      type: seat.type,
    }));
    setAllocatedSeats(allocated);
  };

  const handleBookTicket = () => {
    if (!userData) {
      alert("Please login to book tickets");
      navigate("/login");
      return;
    }
    const seatType = selectedTicketType;
    const seatsNeeded = quantity;
    const availableSeatsForType = availableSeats[seatType] || [];
    const freeSeats = availableSeatsForType.filter((seat) => seat.available);
    if (freeSeats.length < seatsNeeded) {
      alert(`Only ${freeSeats.length} ${seatType.toUpperCase()} seats available.`);
      return;
    }
    setBookingModal(true);
  };

  const handleConfirmBooking = () => {
    if (allocatedSeats.length !== quantity) {
      alert("Could not allocate enough seats. Please try again.");
      allocateSeatsAutomatically();
      return;
    }
    setPaymentModal(true);
  };

  const processPayment = async () => {
    if (!paymentCode.trim()) {
      alert("Please enter your payment code");
      return;
    }
    if (allocatedSeats.length === 0) {
      alert("No seats allocated. Please try again.");
      return;
    }

    setProcessingPayment(true);
    try {
      const bookingData = {
        playId: id,
        playTitle: play.title,
        ticketType: selectedTicketType,
        quantity,
        allocatedSeats: allocatedSeats.map((s) => s.number),
        totalPrice,
        paymentMethod,
        paymentCode,
        bookingDate: new Date().toISOString(),
        playDate: play.date,
        customerName: userData?.fullName,
        customerEmail: userData?.email,
        customerPhone: userData?.phone,
        userId: userData?._id,
      };

      const response = await axios.post(`${API_BASE_URL}/api/bookings`, bookingData);
      if (response.data.success) {
        alert(
          `Booking Successful!\n\nYour booking for "${play.title}" has been confirmed!\n\n• Tickets: ${quantity} × ${selectedTicketType.toUpperCase()}\n• Seats: ${allocatedSeats.map((s) => s.number).join(", ")}\n• Total: KES ${totalPrice}\n• Payment: ${paymentMethod.toUpperCase()}\n• Booking Reference: ${response.data.booking?.bookingReference || "N/A"}`
        );
        resetBookingState();
        navigate("/home/my-bookings");
      }
    } catch (error) {
      let errorMessage = "Payment failed. Please try again.";
      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map((err) => err.msg).join(", ");
      } else if (error.message === "Network Error") {
        errorMessage = "Network error. Please check your connection.";
      }
      alert(errorMessage);
    } finally {
      setProcessingPayment(false);
    }
  };

  const resetBookingState = () => {
    setSelectedTicketType("regular");
    setQuantity(1);
    setAllocatedSeats([]);
    setShowSeatDisplay(false);
    setPaymentMethod("mpesa");
    setPaymentCode("");
    setBookingModal(false);
    setPaymentModal(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTicketPrice = (type) => {
    if (!play) return 0;
    switch (type) {
      case "regular":
        return play.regularPrice || 0;
      case "vip":
        return play.vipPrice || 0;
      case "vvip":
        return play.vvipPrice || 0;
      default:
        return 0;
    }
  };

  const imageUrl = play?.image ? `${API_BASE_URL}${play.image}` : null;
  const isPastEvent = play ? new Date(play.date) <= new Date() : false;
  const allSeats = [
    ...(availableSeats.regular || []),
    ...(availableSeats.vip || []),
    ...(availableSeats.vvip || []),
  ];

  // Styles object (converted from React Native StyleSheet)
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
      height: "100vh",
      padding: "20px",
    },
    loadingText: {
      marginTop: "10px",
      fontSize: "16px",
      color: "#666",
    },
    noDataText: {
      fontSize: "16px",
      color: "#666",
      marginTop: "10px",
      marginBottom: "20px",
    },
    retryButton: {
      backgroundColor: "#6200EE",
      padding: "12px 30px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "600",
    },
    imageContainer: {
      width: "100%",
      height: "300px",
      position: "relative",
      backgroundColor: "#e0e0e0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    noImageText: {
      color: "#666",
      fontSize: "16px",
      marginTop: "10px",
    },
    pastEventOverlay: {
      position: "absolute",
      top: "20px",
      right: "20px",
      backgroundColor: "rgba(244,67,54,0.9)",
      padding: "8px 15px",
      borderRadius: "20px",
    },
    pastEventText: {
      color: "#fff",
      fontSize: "12px",
      fontWeight: "bold",
    },
    detailsContainer: {
      padding: "20px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#1a1a1a",
      marginBottom: "15px",
      textAlign: "center",
    },
    infoBar: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "25px",
      padding: "15px",
      backgroundColor: "#fff",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    infoItem: {
      display: "flex",
      alignItems: "center",
      flex: 1,
    },
    infoItemText: {
      fontSize: "14px",
      color: "#333",
      marginLeft: "8px",
      flex: 1,
    },
    section: {
      marginBottom: "30px",
    },
    sectionTitle: {
      fontSize: "22px",
      fontWeight: "bold",
      color: "#1a1a1a",
      marginBottom: "15px",
    },
    pricesSection: {
      backgroundColor: "#fff",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "25px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    pricesGrid: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "10px",
      gap: "10px",
    },
    priceCard: {
      flex: 1,
      backgroundColor: "#f8f9fa",
      padding: "15px",
      borderRadius: "10px",
      textAlign: "center",
    },
    priceCardVip: {
      backgroundColor: "#FFF3E0",
      border: "1px solid #FF9800",
    },
    priceCardVvip: {
      backgroundColor: "#E3F2FD",
      border: "1px solid #2196F3",
    },
    priceType: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#333",
      marginBottom: "5px",
    },
    priceValue: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#6200EE",
      marginBottom: "5px",
    },
    priceDesc: {
      fontSize: "12px",
      color: "#666",
    },
    description: {
      fontSize: "16px",
      lineHeight: "24px",
      color: "#444",
      textAlign: "justify",
    },
    castScroll: {
      display: "flex",
      overflowX: "auto",
      gap: "20px",
      paddingBottom: "10px",
    },
    actorCard: {
      alignItems: "center",
      width: "100px",
    },
    actorAvatar: {
      width: "70px",
      height: "70px",
      borderRadius: "35px",
      backgroundColor: "#f0f0f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "10px",
    },
    actorName: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#333",
      textAlign: "center",
    },
    actorRole: {
      fontSize: "12px",
      color: "#666",
      textAlign: "center",
      marginTop: "2px",
    },
    detailsGrid: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    detailCard: {
      width: "48%",
      backgroundColor: "#fff",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "15px",
      textAlign: "center",
      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    },
    detailCardTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#333",
      marginTop: "10px",
      marginBottom: "5px",
    },
    detailCardValue: {
      fontSize: "16px",
      color: "#666",
    },
    statusUpcoming: { color: "#4CAF50" },
    statusPast: { color: "#F44336" },
    bookingContainer: {
      marginTop: "20px",
      marginBottom: "20px",
    },
    bookButton: {
      backgroundColor: "#6200EE",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "18px",
      borderRadius: "12px",
      border: "none",
      cursor: "pointer",
      color: "#fff",
      fontSize: "18px",
      fontWeight: "bold",
      gap: "10px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    },
    bookButtonDisabled: {
      backgroundColor: "#9E9E9E",
      cursor: "not-allowed",
    },
    bookingNote: {
      textAlign: "center",
      color: "#F44336",
      marginTop: "10px",
      fontSize: "14px",
    },

    // Modal styles
    modalOverlay: {
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
    modalContent: {
      backgroundColor: "#fff",
      borderTopLeftRadius: "20px",
      borderTopRightRadius: "20px",
      maxHeight: "90%",
      width: "100%",
      maxWidth: "600px",
      display: "flex",
      flexDirection: "column",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px",
      borderBottom: "1px solid #eee",
    },
    modalTitle: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#1a1a1a",
      margin: 0,
    },
    modalBody: {
      padding: "20px",
      overflowY: "auto",
    },
    playTitleModal: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#333",
      marginBottom: "20px",
      textAlign: "center",
    },
    userInfo: {
      backgroundColor: "#f8f9fa",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "20px",
    },
    userInfoItem: {
      display: "flex",
      alignItems: "center",
      marginBottom: "8px",
    },
    userInfoText: {
      fontSize: "14px",
      color: "#333",
      marginLeft: "10px",
    },
    ticketTypeButtons: {
      display: "flex",
      gap: "10px",
      marginBottom: "20px",
    },
    ticketTypeButton: {
      flex: 1,
      padding: "15px",
      textAlign: "center",
      borderRadius: "10px",
      backgroundColor: "#f8f9fa",
      border: "1px solid #ddd",
      cursor: "pointer",
    },
    ticketTypeButtonActive: {
      backgroundColor: "#6200EE",
      borderColor: "#6200EE",
      color: "#fff",
    },
    ticketTypeButtonText: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#333",
    },
    ticketTypeButtonTextActive: { color: "#fff" },
    ticketTypePrice: {
      fontSize: "12px",
      color: "#666",
      marginTop: "5px",
    },
    inputGroup: {
      marginBottom: "20px",
    },
    inputLabel: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#333",
      marginBottom: "8px",
      display: "block",
    },
    quantitySelector: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "0 15px",
      height: "50px",
    },
    quantityButton: {
      background: "none",
      border: "none",
      cursor: "pointer",
    },
    quantityText: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#333",
    },
    quantityHelper: {
      fontSize: "12px",
      color: "#666",
      marginTop: "5px",
      textAlign: "center",
    },
    seatToggle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#f8f9fa",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "20px",
      cursor: "pointer",
    },
    seatToggleText: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#6200EE",
    },
    seatDisplay: {
      marginBottom: "20px",
    },
    seatDisplayTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#333",
      marginBottom: "10px",
    },
    seatLegend: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      marginBottom: "15px",
      backgroundColor: "#f8f9fa",
      padding: "10px",
      borderRadius: "8px",
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: "5px",
    },
    legendColor: {
      width: "15px",
      height: "15px",
      borderRadius: "3px",
    },
    legendRegular: {
      backgroundColor: "#e3f2fd",
      border: "1px solid #2196F3",
    },
    legendVip: {
      backgroundColor: "#FFF3E0",
      border: "1px solid #FF9800",
    },
    legendVvip: {
      backgroundColor: "#E8F5E8",
      border: "1px solid #4CAF50",
    },
    legendAllocated: {
      backgroundColor: "#6200EE",
      border: "1px solid #6200EE",
    },
    legendUnavailable: {
      backgroundColor: "#f5f5f5",
      border: "1px solid #ddd",
    },
    legendText: {
      fontSize: "12px",
      color: "#666",
    },
    seatAllocationInfo: {
      backgroundColor: "#f0f7ff",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "15px",
    },
    seatAllocationText: {
      fontSize: "14px",
      color: "#333",
      fontWeight: "600",
    },
    allocatedSeatsText: {
      fontSize: "16px",
      color: "#6200EE",
      fontWeight: "bold",
      marginTop: "5px",
    },
    seatsGrid: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "6px",
      marginBottom: "15px",
    },
    seat: {
      width: "35px",
      height: "35px",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #2196F3",
      backgroundColor: "#e3f2fd",
      position: "relative",
    },
    seatVip: {
      borderColor: "#FF9800",
      backgroundColor: "#FFF3E0",
    },
    seatVvip: {
      borderColor: "#4CAF50",
      backgroundColor: "#E8F5E8",
    },
    seatAllocated: {
      backgroundColor: "#6200EE",
      borderColor: "#6200EE",
    },
    seatUnavailable: {
      backgroundColor: "#f5f5f5",
      borderColor: "#ddd",
    },
    seatText: {
      fontSize: "10px",
      fontWeight: "600",
      color: "#333",
    },
    seatTextAllocated: { color: "#fff" },
    seatTextUnavailable: { color: "#999" },
    seatCheckmark: {
      position: "absolute",
      top: "-3px",
      right: "-3px",
    },
    stageIndicator: {
      backgroundColor: "#333",
      padding: "10px",
      borderRadius: "8px",
      textAlign: "center",
      marginTop: "10px",
    },
    stageText: {
      color: "#fff",
      fontSize: "14px",
      fontWeight: "bold",
    },
    priceSummary: {
      backgroundColor: "#f8f9fa",
      padding: "20px",
      borderRadius: "12px",
    },
    priceRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "10px",
    },
    priceLabel: {
      fontSize: "16px",
      color: "#666",
    },
    priceValue: {
      fontSize: "16px",
      color: "#333",
      fontWeight: "600",
    },
    divider: {
      height: "1px",
      backgroundColor: "#ddd",
      marginVertical: "10px",
    },
    totalRow: {
      marginTop: "10px",
    },
    totalLabel: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#333",
    },
    totalValue: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#6200EE",
    },
    modalFooter: {
      display: "flex",
      padding: "20px",
      borderTop: "1px solid #eee",
      gap: "10px",
    },
    cancelButton: {
      flex: 1,
      padding: "15px",
      backgroundColor: "#f5f5f5",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "600",
      color: "#666",
      cursor: "pointer",
    },
    confirmButton: {
      flex: 2,
      padding: "15px",
      backgroundColor: "#6200EE",
      border: "none",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
    },
    confirmButtonDisabled: {
      backgroundColor: "#9E9E9E",
      cursor: "not-allowed",
    },
    paymentAmount: {
      fontSize: "36px",
      fontWeight: "bold",
      color: "#6200EE",
      textAlign: "center",
      marginBottom: "20px",
    },
    paymentMethods: {
      display: "flex",
      gap: "10px",
      marginBottom: "20px",
    },
    paymentMethod: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "15px",
      borderRadius: "10px",
      backgroundColor: "#f8f9fa",
      border: "1px solid #ddd",
      cursor: "pointer",
    },
    paymentMethodActive: {
      backgroundColor: "#6200EE10",
      borderColor: "#6200EE",
    },
    paymentMethodText: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#333",
      marginTop: "5px",
    },
    paymentMethodTextActive: { color: "#6200EE" },
    mpesaInstructions: {
      backgroundColor: "#f0f7ff",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "20px",
    },
    instructionsTitle: {
      fontSize: "16px",
      fontWeight: "bold",
      color: "#333",
      marginBottom: "10px",
    },
    instructionsText: {
      fontSize: "14px",
      color: "#666",
      marginBottom: "5px",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      fontSize: "16px",
      backgroundColor: "#f9f9f9",
    },
    inputHelper: {
      fontSize: "12px",
      color: "#666",
      marginTop: "5px",
    },
    paymentSummary: {
      backgroundColor: "#f8f9fa",
      padding: "20px",
      borderRadius: "12px",
    },
    paymentSummaryTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#333",
      marginBottom: "15px",
    },
    paymentRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "10px",
    },
    paymentLabel: {
      fontSize: "14px",
      color: "#666",
    },
    paymentValue: {
      fontSize: "14px",
      color: "#333",
      fontWeight: "600",
    },
    paymentTotal: {
      marginTop: "10px",
    },
    paymentTotalLabel: {
      fontSize: "16px",
      fontWeight: "bold",
      color: "#333",
    },
    paymentTotalValue: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#6200EE",
    },
  };

  if (loading) {
    return (
      <div style={styles.centered}>
        <div className="spinner"></div>
        <p style={styles.loadingText}>Loading play details...</p>
      </div>
    );
  }

  if (!play) {
    return (
      <div style={styles.centered}>
        <IoTheater size={60} color="#666" />
        <p style={styles.noDataText}>Play not found</p>
        <button style={styles.retryButton} onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Hero Image */}
      <div style={styles.imageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt={play.title} style={styles.image} />
        ) : (
          <>
            <IoTheater size={60} color="#666" />
            <p style={styles.noImageText}>No Image Available</p>
          </>
        )}
        {isPastEvent && (
          <div style={styles.pastEventOverlay}>
            <span style={styles.pastEventText}>PAST EVENT</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div style={styles.detailsContainer}>
        <h1 style={styles.title}>{play.title}</h1>

        <div style={styles.infoBar}>
          <div style={styles.infoItem}>
            <IoCalendarOutline size={20} color="#6200EE" />
            <span style={styles.infoItemText}>{formatDate(play.date)}</span>
          </div>
          <div style={styles.infoItem}>
            <IoLocationOutline size={20} color="#6200EE" />
            <span style={styles.infoItemText}>{play.venue || "Venue not specified"}</span>
          </div>
        </div>

        {/* Ticket Prices */}
        <div style={styles.pricesSection}>
          <h2 style={styles.sectionTitle}>Ticket Prices</h2>
          <div style={styles.pricesGrid}>
            <div style={styles.priceCard}>
              <div style={styles.priceType}>Regular</div>
              <div style={styles.priceValue}>KES {play.regularPrice || 0}</div>
              <div style={styles.priceDesc}>Standard seating</div>
            </div>
            <div style={{ ...styles.priceCard, ...styles.priceCardVip }}>
              <div style={styles.priceType}>VIP</div>
              <div style={styles.priceValue}>KES {play.vipPrice || 0}</div>
              <div style={styles.priceDesc}>Premium seating</div>
            </div>
            <div style={{ ...styles.priceCard, ...styles.priceCardVvip }}>
              <div style={styles.priceType}>VVIP</div>
              <div style={styles.priceValue}>KES {play.vvipPrice || 0}</div>
              <div style={styles.priceDesc}>Front row seating</div>
            </div>
          </div>
        </div>

        {/* About */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>About the Play</h2>
          <p style={styles.description}>{play.description}</p>
        </div>

        {/* Cast */}
        {play.actors && play.actors.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Cast</h2>
            <div style={styles.castScroll}>
              {play.actors.map((actor, index) => (
                <div key={index} style={styles.actorCard}>
                  <div style={styles.actorAvatar}>
                    <IoPerson size={50} color="#6200EE" />
                  </div>
                  <div style={styles.actorName}>
                    {actor.actor?.fullName || actor.actor?.name || "Actor"}
                  </div>
                  <div style={styles.actorRole}>{actor.role || "Role"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Details */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Details</h2>
          <div style={styles.detailsGrid}>
            <div style={styles.detailCard}>
              <IoTimeOutline size={24} color="#6200EE" />
              <div style={styles.detailCardTitle}>Duration</div>
              <div style={styles.detailCardValue}>2-3 hours</div>
            </div>
            <div style={styles.detailCard}>
              <IoPeopleOutline size={24} color="#6200EE" />
              <div style={styles.detailCardTitle}>Rating</div>
              <div style={styles.detailCardValue}>PG-13</div>
            </div>
            <div style={styles.detailCard}>
              <IoInformationCircleOutline size={24} color="#6200EE" />
              <div style={styles.detailCardTitle}>Status</div>
              <div
                style={{
                  ...styles.detailCardValue,
                  ...(isPastEvent ? styles.statusPast : styles.statusUpcoming),
                }}
              >
                {isPastEvent ? "Past Event" : "Upcoming Event"}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Button */}
        <div style={styles.bookingContainer}>
          <button
            style={{
              ...styles.bookButton,
              ...(isPastEvent ? styles.bookButtonDisabled : {}),
            }}
            onClick={handleBookTicket}
            disabled={isPastEvent}
          >
            <IoTheater size={24} />
            <span>{isPastEvent ? "Event Ended" : "Book Tickets"}</span>
          </button>
          {isPastEvent && <p style={styles.bookingNote}>This event has already taken place</p>}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModal && (
        <div style={styles.modalOverlay} onClick={() => setBookingModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Book Tickets</h2>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setBookingModal(false)}>
                <IoClose size={24} color="#666" />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.playTitleModal}>{play.title}</div>

              {/* User Info */}
              <div style={styles.userInfo}>
                <div style={styles.userInfoItem}>
                  <IoPerson size={16} color="#666" />
                  <span style={styles.userInfoText}>{userData?.fullName || "User"}</span>
                </div>
                <div style={styles.userInfoItem}>
                  <IoMail size={16} color="#666" />
                  <span style={styles.userInfoText}>{userData?.email || "No email"}</span>
                </div>
                <div style={styles.userInfoItem}>
                  <IoCall size={16} color="#666" />
                  <span style={styles.userInfoText}>{userData?.phone || "No phone"}</span>
                </div>
              </div>

              {/* Ticket Type Selector */}
              <div style={styles.ticketTypeButtons}>
                {["regular", "vip", "vvip"].map((type) => (
                  <div
                    key={type}
                    style={{
                      ...styles.ticketTypeButton,
                      ...(selectedTicketType === type ? styles.ticketTypeButtonActive : {}),
                    }}
                    onClick={() => setSelectedTicketType(type)}
                  >
                    <div
                      style={{
                        ...styles.ticketTypeButtonText,
                        ...(selectedTicketType === type ? styles.ticketTypeButtonTextActive : {}),
                      }}
                    >
                      {type.toUpperCase()}
                    </div>
                    <div style={styles.ticketTypePrice}>KES {getTicketPrice(type)}</div>
                  </div>
                ))}
              </div>

              {/* Quantity */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Quantity</label>
                <div style={styles.quantitySelector}>
                  <button style={styles.quantityButton} onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <IoRemove size={24} color="#6200EE" />
                  </button>
                  <span style={styles.quantityText}>{quantity}</span>
                  <button style={styles.quantityButton} onClick={() => setQuantity(quantity + 1)}>
                    <IoAdd size={24} color="#6200EE" />
                  </button>
                </div>
                <div style={styles.quantityHelper}>{allocatedSeats.length} seat(s) allocated automatically</div>
              </div>

              {/* Toggle Seat Map */}
              <div style={styles.seatToggle} onClick={() => setShowSeatDisplay(!showSeatDisplay)}>
                <span style={styles.seatToggleText}>{showSeatDisplay ? "Hide Seat Map" : "View Seat Map"}</span>
                {showSeatDisplay ? <IoChevronUp size={20} color="#6200EE" /> : <IoChevronDown size={20} color="#6200EE" />}
              </div>

              {/* Seat Map */}
              {showSeatDisplay && (
                <div style={styles.seatDisplay}>
                  <div style={styles.seatDisplayTitle}>Seat Map</div>
                  <div style={styles.seatLegend}>
                    <div style={styles.legendItem}>
                      <div style={{ ...styles.legendColor, ...styles.legendRegular }} />
                      <span style={styles.legendText}>Regular</span>
                    </div>
                    <div style={styles.legendItem}>
                      <div style={{ ...styles.legendColor, ...styles.legendVip }} />
                      <span style={styles.legendText}>VIP</span>
                    </div>
                    <div style={styles.legendItem}>
                      <div style={{ ...styles.legendColor, ...styles.legendVvip }} />
                      <span style={styles.legendText}>VVIP</span>
                    </div>
                    <div style={styles.legendItem}>
                      <div style={{ ...styles.legendColor, ...styles.legendAllocated }} />
                      <span style={styles.legendText}>Your Seats</span>
                    </div>
                    <div style={styles.legendItem}>
                      <div style={{ ...styles.legendColor, ...styles.legendUnavailable }} />
                      <span style={styles.legendText}>Taken</span>
                    </div>
                  </div>
                  <div style={styles.seatAllocationInfo}>
                    <div style={styles.seatAllocationText}>Your allocated seats ({selectedTicketType.toUpperCase()} section):</div>
                    <div style={styles.allocatedSeatsText}>
                      {allocatedSeats.length > 0 ? allocatedSeats.map((s) => s.number).join(", ") : "No seats allocated yet"}
                    </div>
                  </div>
                  <div style={styles.seatsGrid}>
                    {allSeats.map((seat) => {
                      const isAllocated = allocatedSeats.some((s) => s.id === seat.id);
                      const isUnavailable = !seat.available;
                      let seatStyle = styles.seat;
                      if (seat.type === "vip") seatStyle = { ...seatStyle, ...styles.seatVip };
                      if (seat.type === "vvip") seatStyle = { ...seatStyle, ...styles.seatVvip };
                      if (isAllocated) seatStyle = { ...seatStyle, ...styles.seatAllocated };
                      if (isUnavailable) seatStyle = { ...seatStyle, ...styles.seatUnavailable };
                      return (
                        <div key={seat.id} style={seatStyle}>
                          <span
                            style={{
                              ...styles.seatText,
                              ...(isAllocated ? styles.seatTextAllocated : {}),
                              ...(isUnavailable ? styles.seatTextUnavailable : {}),
                            }}
                          >
                            {seat.number}
                          </span>
                          {seat.type !== "regular" && (
                            <div style={{ position: "absolute", bottom: 2, right: 2 }}>
                              {seat.type === "vip" ? (
                                <IoStar size={8} color={isAllocated ? "#fff" : isUnavailable ? "#999" : "#666"} />
                              ) : (
                                <IoDiamond size={8} color={isAllocated ? "#fff" : isUnavailable ? "#999" : "#666"} />
                              )}
                            </div>
                          )}
                          {isAllocated && (
                            <IoCheckmarkCircle size={12} color="#fff" style={styles.seatCheckmark} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={styles.stageIndicator}>
                    <span style={styles.stageText}>🎭 STAGE 🎭</span>
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div style={styles.priceSummary}>
                <div style={styles.priceRow}>
                  <span style={styles.priceLabel}>Ticket Price</span>
                  <span style={styles.priceValue}>KES {getTicketPrice(selectedTicketType)}</span>
                </div>
                <div style={styles.priceRow}>
                  <span style={styles.priceLabel}>Quantity</span>
                  <span style={styles.priceValue}>× {quantity}</span>
                </div>
                <div style={styles.divider} />
                <div style={{ ...styles.priceRow, ...styles.totalRow }}>
                  <span style={styles.totalLabel}>Total Amount</span>
                  <span style={styles.totalValue}>KES {totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setBookingModal(false)}>
                Cancel
              </button>
              <button
                style={{
                  ...styles.confirmButton,
                  ...(allocatedSeats.length === 0 ? styles.confirmButtonDisabled : {}),
                }}
                onClick={handleConfirmBooking}
                disabled={allocatedSeats.length === 0}
              >
                <IoArrowForward size={20} />
                <span>Proceed to Pay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal && (
        <div style={styles.modalOverlay} onClick={() => setPaymentModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Complete Payment</h2>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setPaymentModal(false)}>
                <IoClose size={24} color="#666" />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.playTitleModal}>{play.title}</div>
              <div style={styles.paymentAmount}>KES {totalPrice}</div>

              {/* Payment Methods */}
              <div style={styles.paymentMethods}>
                <div
                  style={{
                    ...styles.paymentMethod,
                    ...(paymentMethod === "mpesa" ? styles.paymentMethodActive : {}),
                  }}
                  onClick={() => setPaymentMethod("mpesa")}
                >
                  <IoPhonePortrait size={24} color={paymentMethod === "mpesa" ? "#6200EE" : "#666"} />
                  <span
                    style={{
                      ...styles.paymentMethodText,
                      ...(paymentMethod === "mpesa" ? styles.paymentMethodTextActive : {}),
                    }}
                  >
                    M-Pesa
                  </span>
                </div>
                <div
                  style={{
                    ...styles.paymentMethod,
                    ...(paymentMethod === "card" ? styles.paymentMethodActive : {}),
                  }}
                  onClick={() => setPaymentMethod("card")}
                >
                  <IoCard size={24} color={paymentMethod === "card" ? "#6200EE" : "#666"} />
                  <span
                    style={{
                      ...styles.paymentMethodText,
                      ...(paymentMethod === "card" ? styles.paymentMethodTextActive : {}),
                    }}
                  >
                    Card
                  </span>
                </div>
                <div
                  style={{
                    ...styles.paymentMethod,
                    ...(paymentMethod === "cash" ? styles.paymentMethodActive : {}),
                  }}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <IoCash size={24} color={paymentMethod === "cash" ? "#6200EE" : "#666"} />
                  <span
                    style={{
                      ...styles.paymentMethodText,
                      ...(paymentMethod === "cash" ? styles.paymentMethodTextActive : {}),
                    }}
                  >
                    Cash
                  </span>
                </div>
              </div>

              {/* M-Pesa Instructions */}
              {paymentMethod === "mpesa" && (
                <div style={styles.mpesaInstructions}>
                  <div style={styles.instructionsTitle}>M-Pesa Instructions:</div>
                  <div style={styles.instructionsText}>1. Go to M-Pesa menu</div>
                  <div style={styles.instructionsText}>2. Select Lipa na M-Pesa</div>
                  <div style={styles.instructionsText}>3. Enter Paybill: 123456</div>
                  <div style={styles.instructionsText}>4. Account: TICKET{id.slice(-6)}</div>
                  <div style={styles.instructionsText}>5. Enter amount: KES {totalPrice}</div>
                  <div style={styles.instructionsText}>6. Enter your M-Pesa PIN</div>
                </div>
              )}

              {/* Payment Code Input */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Payment Code *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={paymentCode}
                  onChange={(e) => setPaymentCode(e.target.value)}
                  placeholder={paymentMethod === "mpesa" ? "Enter M-Pesa transaction code" : "Enter payment reference"}
                />
                <div style={styles.inputHelper}>Enter the transaction code received after payment</div>
              </div>

              {/* Booking Summary */}
              <div style={styles.paymentSummary}>
                <div style={styles.paymentSummaryTitle}>Booking Summary</div>
                <div style={styles.paymentRow}>
                  <span style={styles.paymentLabel}>Event:</span>
                  <span style={styles.paymentValue}>{play.title}</span>
                </div>
                <div style={styles.paymentRow}>
                  <span style={styles.paymentLabel}>Tickets:</span>
                  <span style={styles.paymentValue}>
                    {quantity} × {selectedTicketType.toUpperCase()}
                  </span>
                </div>
                <div style={styles.paymentRow}>
                  <span style={styles.paymentLabel}>Seats:</span>
                  <span style={styles.paymentValue}>{allocatedSeats.map((s) => s.number).join(", ")}</span>
                </div>
                <div style={styles.paymentRow}>
                  <span style={styles.paymentLabel}>Method:</span>
                  <span style={styles.paymentValue}>{paymentMethod.toUpperCase()}</span>
                </div>
                <div style={styles.divider} />
                <div style={{ ...styles.paymentRow, ...styles.paymentTotal }}>
                  <span style={styles.paymentTotalLabel}>Total Amount:</span>
                  <span style={styles.paymentTotalValue}>KES {totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setPaymentModal(false)}>
                Back
              </button>
              <button
                style={{
                  ...styles.confirmButton,
                  ...(processingPayment ? styles.confirmButtonDisabled : {}),
                }}
                onClick={processPayment}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <div className="spinner-small" />
                ) : (
                  <>
                    <IoCheckmarkCircle size={20} />
                    <span>Confirm Booking</span>
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