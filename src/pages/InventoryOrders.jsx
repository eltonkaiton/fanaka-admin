import React, { useEffect, useState } from "react";
import {
  IoCheckmarkCircleOutline,
  IoClose,
  IoCashOutline,
  IoCardOutline,
  IoBusinessOutline,
  IoCubeOutline,
  IoCalculatorOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoDocumentTextOutline,
  IoCheckmarkDoneCircle,
  IoCheckmarkDoneOutline,
  IoAlertCircleOutline,
  IoInformationCircleOutline,
  IoTimeOutline,
  IoRefresh,
  IoSearchOutline,        // NEW
  IoReceiptOutline,       // NEW
} from "react-icons/io5";
import axios from "axios";

// Inject spinner styles into document head
const styleSheet = document.createElement('style');
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #6200EE;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  .spinner-small {
    width: 20px;
    height: 20px;
    border: 3px solid #fff;
    border-top: 3px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(styleSheet);

const API_BASE_URL = "https://fanaka-server-1.onrender.com";

export default function FinanceOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentProcessingModal, setPaymentProcessingModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: "Bank Transfer",
    transactionId: "",
    amountPaid: "",
    notes: "",
  });
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState(""); // NEW search state

  const fetchOrders = async (status = "All") => {
    try {
      setLoading(true);
      if (status === "All") {
        const res = await axios.get(`${API_BASE_URL}/api/orders`);
        const allOrders = res.data.orders || [];
        const filteredOrders = allOrders.filter(
          (order) =>
            order.payment &&
            order.payment.status &&
            order.payment.status !== "Pending" &&
            order.status !== "Payment Pending"
        );
        setOrders(filteredOrders);
      } else {
        const res = await axios.get(
          `${API_BASE_URL}/api/orders/payment-status/${status}`
        );
        setOrders(res.data.orders || []);
      }
    } catch (error) {
      console.log(error.message);
      alert("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(filterStatus);
  }, [filterStatus]);

  // NEW: filter orders based on search term
  const filteredOrders = orders.filter((order) => {
    const itemName = order.item?.name || order.itemName || "";
    const supplierName = order.supplier?.fullName || order.supplierName || "";
    const id = order._id || "";
    const term = searchTerm.toLowerCase();
    return (
      itemName.toLowerCase().includes(term) ||
      supplierName.toLowerCase().includes(term) ||
      id.toLowerCase().includes(term)
    );
  });

  const handleApprovePayment = (order) => {
    setSelectedOrder(order);
    if (
      !window.confirm(
        `Approve payment of KES ${
          order.payment?.amountPaid || order.totalCost
        } for ${order.itemName}?`
      )
    )
      return;
    (async () => {
      try {
        setProcessingPayment(true);
        const userData = {
          userId: "finance_user_001",
          userName: "Finance Officer",
        };
        await axios.put(
          `${API_BASE_URL}/api/orders/${order._id}/approve-payment`,
          userData
        );
        alert("Payment request approved");
        fetchOrders(filterStatus);
        setPaymentProcessingModal(true);
        setPaymentData({
          paymentMethod: order.payment?.paymentMethod || "Bank Transfer",
          transactionId: "",
          amountPaid: order.payment?.amountPaid || order.totalCost,
          notes: "",
        });
      } catch (error) {
        console.log("Approve error:", error.response?.data || error.message);
        alert(
          error.response?.data?.message || "Failed to approve payment"
        );
      } finally {
        setProcessingPayment(false);
      }
    })();
  };

  const handleRejectPayment = (order) => {
    if (!window.confirm(`Reject payment request for ${order.itemName}?`))
      return;
    (async () => {
      try {
        await axios.put(
          `${API_BASE_URL}/api/orders/${order._id}/reject-payment`,
          {
            userId: "finance_user_001",
            userName: "Finance Officer",
            reason: "Payment request rejected by finance department",
          }
        );
        alert("Payment request rejected");
        fetchOrders(filterStatus);
      } catch (error) {
        console.log("Reject error:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Failed to reject payment");
      }
    })();
  };

  const handleProcessPayment = async () => {
    if (!selectedOrder) return;

    if (!paymentData.paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    if (paymentData.paymentMethod !== "Cash" && !paymentData.transactionId) {
      alert("Please enter a transaction/reference ID");
      return;
    }

    try {
      setProcessingPayment(true);
      const paymentDetails = {
        userId: "finance_user_001",
        userName: "Finance Officer",
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId,
        amountPaid: paymentData.amountPaid,
        notes: paymentData.notes,
      };

      await axios.put(
        `${API_BASE_URL}/api/orders/${selectedOrder._id}/process-payment`,
        paymentDetails
      );

      alert("Payment processed successfully and marked as paid");
      setPaymentProcessingModal(false);
      setPaymentData({
        paymentMethod: "Bank Transfer",
        transactionId: "",
        amountPaid: "",
        notes: "",
      });
      setSelectedOrder(null);
      fetchOrders(filterStatus);
    } catch (error) {
      console.log("Process payment error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to process payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleMarkAsPaid = (order) => {
    if (!window.confirm("Mark this payment as fully paid? This will close the order."))
      return;
    (async () => {
      try {
        setProcessingPayment(true);
        await axios.put(
          `${API_BASE_URL}/api/orders/${order._id}/mark-paid`,
          {
            paymentMethod: order.payment?.paymentMethod || "Bank Transfer",
            transactionId: order.payment?.transactionId || "",
            notes: "Marked as paid by finance department",
          }
        );
        alert("Order marked as paid");
        fetchOrders(filterStatus);
      } catch (error) {
        console.log("Mark paid error:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Failed to mark as paid");
      } finally {
        setProcessingPayment(false);
      }
    })();
  };

  // NEW: Receipt generation function
  const viewReceipt = (order) => {
    const itemName = order.item?.name || order.itemName || 'N/A';
    const supplierName = order.supplier?.fullName || order.supplierName || 'N/A';
    const total = order.totalCost || order.quantity * order.unitPrice;
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
      <html>
        <head><title>Order Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .receipt { max-width: 600px; margin: auto; border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
          h1 { color: #6200EE; margin-top: 0; }
          .details { margin-top: 20px; }
          .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
          .print-btn { background: #6200EE; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 20px; }
        </style>
        </head>
        <body>
          <div class="receipt">
            <h1>Fanaka Arts - Order Receipt</h1>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
            <div class="details">
              <div class="row"><span>Item:</span> <span>${itemName}</span></div>
              <div class="row"><span>Supplier:</span> <span>${supplierName}</span></div>
              <div class="row"><span>Quantity:</span> <span>${order.quantity}</span></div>
              <div class="row"><span>Unit Price:</span> <span>${formatCurrency(order.unitPrice)}</span></div>
              <div class="row total"><span>Total:</span> <span>${formatCurrency(total)}</span></div>
            </div>
            <p><strong>Payment Status:</strong> ${order.payment?.status || 'N/A'}</p>
            <p><em>Thank you for your business!</em></p>
            <button class="print-btn" onclick="window.print()">Print Receipt</button>
          </div>
        </body>
      </html>
    `);
    receiptWindow.document.close();
  };

  const formatCurrency = (amount) => {
    return `KES ${parseFloat(amount || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted":
        return "#f39c12";
      case "Approved":
        return "#3498db";
      case "Rejected":
        return "#e74c3c";
      case "Paid":
        return "#2ecc71";
      default:
        return "#f39c12";
    }
  };

  const getStatusCount = (status) => {
    return orders.filter((order) => order.payment?.status === status).length;
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    header: {
      padding: "15px 20px",
      backgroundColor: "#fff",
      borderBottom: "1px solid #eee",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    headerTitle: {
      fontSize: "22px",
      fontWeight: "bold",
      color: "#333",
      margin: 0,
    },
    headerSubtitle: {
      fontSize: "14px",
      color: "#666",
      marginTop: "4px",
    },
    // NEW search bar styles
    searchWrapper: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
      padding: "0 12px",
      margin: "10px 0",
    },
    searchInput: {
      border: "none",
      background: "none",
      outline: "none",
      padding: "10px",
      fontSize: "14px",
      width: "100%",
    },
    filterContainer: {
      backgroundColor: "#fff",
      padding: "12px 0",
      borderBottom: "1px solid #eee",
      overflowX: "auto",
      whiteSpace: "nowrap",
    },
    filterTabs: {
      display: "flex",
      gap: "8px",
      padding: "0 16px",
    },
    filterTab: {
      padding: "8px 16px",
      borderRadius: "20px",
      backgroundColor: "#f5f5f5",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      color: "#666",
    },
    filterTabActive: {
      backgroundColor: "#6200EE",
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
    card: {
      backgroundColor: "#fff",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "12px",
    },
    title: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#333",
      margin: 0,
    },
    orderId: {
      fontSize: "12px",
      color: "#666",
      fontFamily: "monospace",
    },
    detailRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "6px",
    },
    detailText: {
      fontSize: "15px",
      color: "#666",
    },
    totalCost: {
      fontSize: "16px",
      fontWeight: "bold",
      color: "#333",
    },
    paymentSection: {
      marginTop: "10px",
      paddingTop: "10px",
      borderTop: "1px solid #eee",
    },
    sectionTitle: {
      fontSize: "16px",
      fontWeight: "bold",
      color: "#333",
      marginBottom: "8px",
    },
    statusBadge: {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: "20px",
      color: "#fff",
      fontWeight: "bold",
      fontSize: "12px",
      marginTop: "10px",
    },
    actionButtons: {
      marginTop: "12px",
      display: "flex",
      gap: "8px",
      flexWrap: "wrap", // to accommodate extra button
    },
    actionButton: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "12px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
    },
    approveButton: {
      backgroundColor: "#2ecc71",
      color: "#fff",
    },
    rejectButton: {
      backgroundColor: "#e74c3c",
      color: "#fff",
    },
    processButton: {
      backgroundColor: "#3498db",
      color: "#fff",
    },
    markPaidButton: {
      backgroundColor: "#9b59b6",
      color: "#fff",
    },
    receiptButton: { // NEW
      backgroundColor: "#fff",
      border: "1px solid #6200EE",
      color: "#6200EE",
    },
    paidStatus: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "12px",
      backgroundColor: "#e8f6f3",
      borderRadius: "8px",
    },
    paidText: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#2ecc71",
      marginTop: "4px",
    },
    paidDate: {
      fontSize: "12px",
      color: "#666",
      marginTop: "2px",
      textAlign: "center",
    },
    rejectedStatus: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "12px",
      backgroundColor: "#fde8e8",
      borderRadius: "8px",
    },
    rejectedText: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#e74c3c",
      marginTop: "4px",
    },
    rejectedDate: {
      fontSize: "12px",
      color: "#666",
      marginTop: "2px",
      textAlign: "center",
    },
    emptyContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: "60px",
    },
    emptyText: {
      fontSize: "18px",
      color: "#777",
      fontWeight: "600",
      marginTop: "16px",
      textAlign: "center",
    },
    emptySubtext: {
      fontSize: "14px",
      color: "#aaa",
      marginTop: "8px",
      textAlign: "center",
      padding: "0 20px",
    },
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
    modalContainer: {
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
      color: "#333",
      margin: 0,
    },
    modalClose: {
      background: "none",
      border: "none",
      cursor: "pointer",
    },
    modalContent: {
      padding: "20px",
      overflowY: "auto",
      maxHeight: "500px",
    },
    paymentSummary: {
      backgroundColor: "#f8f9fa",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "20px",
    },
    paymentSummaryTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#333",
      marginBottom: "12px",
    },
    paymentDetailRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
    },
    paymentDetailLabel: {
      fontSize: "14px",
      color: "#666",
      flex: 1,
    },
    paymentDetailValue: {
      fontSize: "14px",
      color: "#333",
      fontWeight: "500",
      flex: 2,
      textAlign: "right",
    },
    inputGroup: {
      marginBottom: "20px",
    },
    inputLabel: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#333",
      marginBottom: "8px",
      display: "block",
    },
    select: {
      width: "100%",
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontSize: "16px",
      backgroundColor: "#f9f9f9",
    },
    inputWithIcon: {
      display: "flex",
      alignItems: "center",
      border: "1px solid #ddd",
      borderRadius: "8px",
      backgroundColor: "#f9f9f9",
      overflow: "hidden",
    },
    inputIcon: {
      padding: "0 16px",
    },
    input: {
      flex: 1,
      padding: "12px",
      fontSize: "16px",
      border: "none",
      outline: "none",
      background: "none",
    },
    textArea: {
      minHeight: "80px",
      resize: "vertical",
    },
    infoBox: {
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
      padding: "16px",
      backgroundColor: "#e8f4fd",
      borderRadius: "8px",
      marginTop: "10px",
    },
    infoText: {
      flex: 1,
      fontSize: "14px",
      color: "#3498db",
    },
    modalFooter: {
      display: "flex",
      padding: "20px",
      borderTop: "1px solid #eee",
      gap: "12px",
    },
    cancelButton: {
      flex: 1,
      padding: "16px",
      backgroundColor: "#f5f5f5",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      color: "#666",
      cursor: "pointer",
    },
    createButton: {
      flex: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "16px",
      backgroundColor: "#6200EE",
      border: "none",
      borderRadius: "8px",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
    },
    createButtonDisabled: {
      backgroundColor: "#b39ddb",
      opacity: 0.7,
      cursor: "not-allowed",
    },
    createButtonText: {
      color: "#fff",
    },
  };

  if (loading) {
    return (
      <div style={styles.loader}>
        <div className="spinner"></div>
        <p style={styles.loadingText}>Loading payments...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Finance - Payment Management</h1>
        <p style={styles.headerSubtitle}>All payment requests and statuses</p>

        {/* NEW Search Bar */}
        <div style={styles.searchWrapper}>
          <IoSearchOutline size={18} color="#666" />
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search by item, supplier, or order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterContainer}>
        <div style={styles.filterTabs}>
          {["All", "Submitted", "Approved", "Paid", "Rejected"].map(
            (status) => (
              <button
                key={status}
                style={{
                  ...styles.filterTab,
                  ...(filterStatus === status ? styles.filterTabActive : {}),
                }}
                onClick={() => setFilterStatus(status)}
              >
                {status}{" "}
                {status !== "All" && `(${getStatusCount(status)})`}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders List */}
      <div style={styles.listContainer}>
        {filteredOrders.length === 0 ? (
          <div style={styles.emptyContainer}>
            <IoCheckmarkCircleOutline size={60} color="#ccc" />
            <p style={styles.emptyText}>
              {filterStatus === "All"
                ? "No payment requests found"
                : `No ${filterStatus.toLowerCase()} payments`}
            </p>
            <p style={styles.emptySubtext}>
              {searchTerm
                ? "No results match your search"
                : filterStatus === "All"
                ? "All payments have been processed or no requests submitted yet"
                : "Try selecting a different filter"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const payment = order.payment || {};
            const total =
              order.totalCost || order.quantity * order.unitPrice;
            return (
              <div key={order._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.title}>
                    {order.item?.name || order.itemName || "Unknown Item"}
                  </h3>
                  <span style={styles.orderId}>
                    Order ID: {order._id?.slice(-8)}
                  </span>
                </div>

                <div style={styles.detailRow}>
                  <IoCubeOutline size={16} color="#666" />
                  <span style={styles.detailText}>
                    Quantity: {order.quantity}
                  </span>
                </div>

                <div style={styles.detailRow}>
                  <IoBusinessOutline size={16} color="#666" />
                  <span style={styles.detailText}>
                    Supplier:{" "}
                    {order.supplier?.fullName ||
                      order.supplierName ||
                      "Unknown"}
                  </span>
                </div>

                <div style={styles.detailRow}>
                  <IoCalculatorOutline size={16} color="#333" />
                  <span style={styles.totalCost}>
                    Total Amount: {formatCurrency(total)}
                  </span>
                </div>

                <div style={styles.paymentSection}>
                  <h4 style={styles.sectionTitle}>Payment Details</h4>

                  <div style={styles.detailRow}>
                    <IoPersonOutline size={16} color="#666" />
                    <span style={styles.detailText}>
                      Submitted by:{" "}
                      {payment.submittedBy?.name ||
                        payment.submittedByName ||
                        "Inventory User"}
                    </span>
                  </div>

                  <div style={styles.detailRow}>
                    <IoCalendarOutline size={16} color="#666" />
                    <span style={styles.detailText}>
                      Submitted on: {formatDate(payment.submittedAt)}
                    </span>
                  </div>

                  <div style={styles.detailRow}>
                    <IoCardOutline size={16} color="#666" />
                    <span style={styles.detailText}>
                      Method: {payment.paymentMethod || "Bank Transfer"}
                    </span>
                  </div>

                  {payment.approvedBy && (
                    <div style={styles.detailRow}>
                      <IoCheckmarkCircleOutline size={16} color="#3498db" />
                      <span style={styles.detailText}>
                        Approved by: {payment.approvedBy?.name || "Finance"}
                      </span>
                    </div>
                  )}

                  {payment.processedBy && (
                    <div style={styles.detailRow}>
                      <IoCashOutline size={16} color="#2ecc71" />
                      <span style={styles.detailText}>
                        Processed by: {payment.processedBy?.name || "Finance"}
                      </span>
                    </div>
                  )}

                  {payment.notes && (
                    <div style={styles.detailRow}>
                      <IoDocumentTextOutline size={16} color="#666" />
                      <span style={styles.detailText}>
                        Notes: {payment.notes}
                      </span>
                    </div>
                  )}
                </div>

                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(payment.status),
                  }}
                >
                  {payment.status?.toUpperCase() || "SUBMITTED"}
                </span>

                <div style={styles.actionButtons}>
                  {payment.status === "Submitted" && (
                    <>
                      <button
                        style={{ ...styles.actionButton, ...styles.approveButton }}
                        onClick={() => handleApprovePayment(order)}
                        disabled={processingPayment}
                      >
                        <IoCheckmarkCircleOutline size={18} />
                        <span>Approve</span>
                      </button>
                      <button
                        style={{ ...styles.actionButton, ...styles.rejectButton }}
                        onClick={() => handleRejectPayment(order)}
                        disabled={processingPayment}
                      >
                        <IoClose size={18} />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {payment.status === "Approved" && (
                    <>
                      <button
                        style={{ ...styles.actionButton, ...styles.processButton }}
                        onClick={() => {
                          setSelectedOrder(order);
                          setPaymentProcessingModal(true);
                          setPaymentData({
                            paymentMethod:
                              payment.paymentMethod || "Bank Transfer",
                            transactionId: "",
                            amountPaid: payment.amountPaid || total,
                            notes: "",
                          });
                        }}
                        disabled={processingPayment}
                      >
                        <IoCashOutline size={18} />
                        <span>Process Payment</span>
                      </button>
                      <button
                        style={{ ...styles.actionButton, ...styles.markPaidButton }}
                        onClick={() => handleMarkAsPaid(order)}
                        disabled={processingPayment}
                      >
                        <IoCheckmarkDoneOutline size={18} />
                        <span>Mark as Paid</span>
                      </button>
                    </>
                  )}

                  {payment.status === "Paid" && (
                    <div style={styles.paidStatus}>
                      <IoCheckmarkDoneCircle size={24} color="#2ecc71" />
                      <span style={styles.paidText}>Payment Completed</span>
                      <span style={styles.paidDate}>
                        {payment.processedAt
                          ? `Processed on: ${formatDate(payment.processedAt)}`
                          : payment.paymentDate
                          ? `Paid on: ${formatDate(payment.paymentDate)}`
                          : ""}
                      </span>
                      {payment.transactionId && (
                        <span style={styles.paidDate}>
                          Transaction ID: {payment.transactionId}
                        </span>
                      )}
                    </div>
                  )}

                  {payment.status === "Rejected" && (
                    <div style={styles.rejectedStatus}>
                      <IoAlertCircleOutline size={24} color="#e74c3c" />
                      <span style={styles.rejectedText}>Payment Rejected</span>
                      <span style={styles.rejectedDate}>
                        {payment.rejectedAt
                          ? `Rejected on: ${formatDate(payment.rejectedAt)}`
                          : ""}
                      </span>
                      {payment.rejectionReason && (
                        <span style={styles.rejectedDate}>
                          Reason: {payment.rejectionReason}
                        </span>
                      )}
                    </div>
                  )}

                  {/* NEW Receipt button - always visible */}
                  <button
                    style={{ ...styles.actionButton, ...styles.receiptButton }}
                    onClick={() => viewReceipt(order)}
                  >
                    <IoReceiptOutline size={18} />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Processing Modal */}
      {paymentProcessingModal && selectedOrder && (
        <div
          style={styles.modalOverlay}
          onClick={() => setPaymentProcessingModal(false)}
        >
          <div
            style={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Process Payment</h2>
              <button
                style={styles.modalClose}
                onClick={() => setPaymentProcessingModal(false)}
              >
                <IoClose size={24} color="#666" />
              </button>
            </div>

            <div style={styles.modalContent}>
              <div style={styles.paymentSummary}>
                <h3 style={styles.paymentSummaryTitle}>Order Details</h3>
                <div style={styles.paymentDetailRow}>
                  <span style={styles.paymentDetailLabel}>Item:</span>
                  <span style={styles.paymentDetailValue}>
                    {selectedOrder.item?.name || selectedOrder.itemName}
                  </span>
                </div>
                <div style={styles.paymentDetailRow}>
                  <span style={styles.paymentDetailLabel}>Supplier:</span>
                  <span style={styles.paymentDetailValue}>
                    {selectedOrder.supplier?.fullName ||
                      selectedOrder.supplierName}
                  </span>
                </div>
                <div style={styles.paymentDetailRow}>
                  <span style={styles.paymentDetailLabel}>Amount Due:</span>
                  <span style={styles.paymentDetailValue}>
                    {formatCurrency(
                      selectedOrder.totalCost ||
                        selectedOrder.quantity * selectedOrder.unitPrice
                    )}
                  </span>
                </div>
                <div style={styles.paymentDetailRow}>
                  <span style={styles.paymentDetailLabel}>Payment Status:</span>
                  <span
                    style={{
                      ...styles.paymentDetailValue,
                      color: getStatusColor(selectedOrder.payment?.status),
                    }}
                  >
                    {selectedOrder.payment?.status || "Submitted"}
                  </span>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Payment Method *</label>
                <select
                  style={styles.select}
                  value={paymentData.paymentMethod}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      paymentMethod: e.target.value,
                    })
                  }
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="MPesa">MPesa</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {paymentData.paymentMethod !== "Cash" && (
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>
                    Transaction/Reference ID *
                  </label>
                  <div style={styles.inputWithIcon}>
                    <IoCardOutline
                      size={20}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="Enter transaction ID or reference number"
                      value={paymentData.transactionId}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          transactionId: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Amount Paid (KES) *</label>
                <div style={styles.inputWithIcon}>
                  <IoCashOutline
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="Enter amount paid"
                    value={paymentData.amountPaid}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        amountPaid: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Payment Notes (Optional)</label>
                <div style={styles.inputWithIcon}>
                  <IoDocumentTextOutline
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <textarea
                    style={{ ...styles.input, ...styles.textArea }}
                    placeholder="Add any payment notes..."
                    value={paymentData.notes}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div style={styles.infoBox}>
                <IoInformationCircleOutline size={20} color="#3498db" />
                <span style={styles.infoText}>
                  This will process the payment and mark the order as paid.
                  Ensure payment has been successfully made before submitting.
                </span>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.cancelButton}
                onClick={() => setPaymentProcessingModal(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.createButton,
                  ...(processingPayment ? styles.createButtonDisabled : {}),
                }}
                onClick={handleProcessPayment}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <div className="spinner-small" />
                ) : (
                  <>
                    <IoCheckmarkCircleOutline size={20} />
                    <span style={styles.createButtonText}>
                      Process & Mark as Paid
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