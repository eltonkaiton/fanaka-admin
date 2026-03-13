import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  IoRefreshOutline,
  IoSearchOutline,
  IoEyeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTicketOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoMailOutline,
  IoCallOutline,
  IoClose,
} from 'react-icons/io5';

const API_BASE_URL = 'http://localhost:5000';

export default function ManagerBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    revenue: 0,
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Ensure each booking has an 'id' field (if API uses _id, map it)
        const bookingsData = response.data.bookings.map((b) => ({
          ...b,
          id: b.id || b._id, // fallback to _id if id missing
        }));
        setBookings(bookingsData);
        calculateStats(bookingsData);
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
      alert('Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const confirmed = data.filter((b) => b.status === 'confirmed').length;
    const pending = data.filter((b) => b.status === 'pending').length;
    const cancelled = data.filter((b) => b.status === 'cancelled').length;
    const revenue = data
      .filter((b) => b.status === 'confirmed' && b.paymentStatus === 'approved')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    setStats({ total, confirmed, pending, cancelled, revenue });
  };

  const handleApprovePayment = async (bookingId) => {
    if (!window.confirm('Approve payment for this booking?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/api/bookings/${bookingId}/approve-payment`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Payment approved');
      fetchBookings();
    } catch (err) {
      console.error('Approve payment error:', err);
      alert('Failed to approve payment');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Booking cancelled');
      fetchBookings();
    } catch (err) {
      console.error('Cancel booking error:', err);
      alert('Failed to cancel booking');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.playTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    const colors = { confirmed: '#4CAF50', pending: '#FF9800', cancelled: '#F44336' };
    return colors[status] || '#757575';
  };

  const getPaymentColor = (paymentStatus) => {
    const colors = { approved: '#4CAF50', pending: '#FF9800', rejected: '#F44336' };
    return colors[paymentStatus] || '#757575';
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#666',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      backgroundColor: '#fff',
      borderBottom: '1px solid #eee',
    },
    headerLeft: {},
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      margin: 0,
    },
    subtitle: {
      fontSize: 14,
      color: '#666',
      marginTop: 2,
    },
    refreshButton: {
      padding: 8,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    },
    statsScroll: {
      backgroundColor: '#fff',
      padding: '15px 0',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
    },
    statsContainer: {
      display: 'flex',
      gap: 10,
      padding: '0 15px',
    },
    statCard: {
      backgroundColor: '#f8f9fa',
      borderRadius: 12,
      padding: 15,
      minWidth: 100,
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: '#666',
    },
    filterContainer: {
      backgroundColor: '#fff',
      padding: 15,
      borderBottom: '1px solid #eee',
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      borderRadius: 8,
      padding: '0 15px',
      marginBottom: 15,
    },
    searchIcon: {
      marginRight: 10,
      color: '#666',
    },
    searchInput: {
      flex: 1,
      padding: '12px 0',
      fontSize: 16,
      border: 'none',
      outline: 'none',
      background: 'none',
    },
    filterRow: {
      marginBottom: 5,
    },
    filterGroup: {
      marginBottom: 10,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: '#333',
      marginBottom: 8,
    },
    filterChips: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      paddingBottom: 5,
    },
    filterChip: {
      backgroundColor: '#f8f9fa',
      borderRadius: 20,
      padding: '8px 15px',
      fontSize: 14,
      color: '#666',
      border: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    filterChipActive: {
      backgroundColor: '#6200EE',
      color: '#fff',
    },
    listContainer: {
      padding: 15,
    },
    bookingCard: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    bookingHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    bookingRef: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    statusBadge: {
      backgroundColor: '#f8f9fa',
      borderRadius: 15,
      padding: '4px 10px',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
    },
    playTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      marginBottom: 5,
    },
    customerInfo: {
      fontSize: 14,
      color: '#666',
      marginBottom: 10,
    },
    bookingDetails: {
      marginBottom: 10,
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 5,
      gap: 8,
    },
    detailText: {
      fontSize: 14,
      color: '#666',
    },
    bookingFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 10,
      borderTop: '1px solid #eee',
    },
    paymentBadge: {
      borderRadius: 15,
      padding: '4px 10px',
    },
    paymentText: {
      fontSize: 12,
      fontWeight: '500',
    },
    actionButtons: {
      display: 'flex',
      gap: 10,
    },
    actionButton: {
      padding: 8,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    },
    emptyContainer: {
      textAlign: 'center',
      padding: 50,
      color: '#999',
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 10,
    },
    emptySubtext: {
      fontSize: 14,
      marginTop: 5,
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '90%',
      width: '100%',
      maxWidth: 600,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottom: '1px solid #eee',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
    },
    modalClose: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    },
    modalSection: {
      padding: 20,
      borderBottom: '1px solid #eee',
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: '#666',
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    modalPlayTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
    },
    modalText: {
      fontSize: 16,
      color: '#333',
      marginBottom: 5,
    },
    modalDetailRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 5,
      gap: 8,
    },
    modalDetailText: {
      fontSize: 14,
      color: '#666',
    },
    modalGrid: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    modalGridItem: {
      flex: 1,
    },
    modalLabel: {
      fontSize: 14,
      color: '#666',
      marginBottom: 5,
    },
    modalValue: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
    },
    seatsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
    },
    seatChip: {
      backgroundColor: '#6200EE',
      borderRadius: 8,
      padding: '5px 10px',
    },
    seatText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '500',
    },
    paymentCode: {
      fontSize: 16,
      fontFamily: 'monospace',
      color: '#333',
      backgroundColor: '#f8f9fa',
      padding: 10,
      borderRadius: 8,
      marginTop: 5,
    },
    modalActions: {
      display: 'flex',
      padding: 20,
    },
    modalButton: {
      flex: 1,
      padding: 15,
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer',
      fontSize: 16,
      fontWeight: '500',
    },
    secondaryButton: {
      backgroundColor: '#f8f9fa',
      color: '#333',
    },
  };

  if (loading && !refreshing) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner"></div>
        <p style={styles.loadingText}>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Bookings Management</h1>
          <p style={styles.subtitle}>Manage all bookings</p>
        </div>
        <button style={styles.refreshButton} onClick={fetchBookings}>
          <IoRefreshOutline size={24} color="#6200EE" />
        </button>
      </div>

      {/* Stats cards */}
      <div style={styles.statsScroll}>
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#4CAF50' }}>{stats.confirmed}</div>
            <div style={styles.statLabel}>Confirmed</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#FF9800' }}>{stats.pending}</div>
            <div style={styles.statLabel}>Pending</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#F44336' }}>{stats.cancelled}</div>
            <div style={styles.statLabel}>Cancelled</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#6200EE' }}>{formatCurrency(stats.revenue)}</div>
            <div style={styles.statLabel}>Revenue</div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div style={styles.filterContainer}>
        <div style={styles.searchContainer}>
          <IoSearchOutline size={20} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search bookings..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <div style={styles.filterLabel}>Status:</div>
            <div style={styles.filterChips}>
              {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
                <button
                  key={status}
                  style={{
                    ...styles.filterChip,
                    ...(filterStatus === status ? styles.filterChipActive : {}),
                  }}
                  onClick={() => setFilterStatus(status)}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bookings list */}
      <div style={styles.listContainer}>
        {filteredBookings.length === 0 ? (
          <div style={styles.emptyContainer}>
            <IoTicketOutline size={60} color="#ccc" />
            <p style={styles.emptyText}>No bookings found</p>
            <p style={styles.emptySubtext}>Try changing your filters</p>
          </div>
        ) : (
          filteredBookings.map((item) => (
            <div key={item.id} style={styles.bookingCard}>
              <div style={styles.bookingHeader}>
                <span style={styles.bookingRef}>{item.bookingReference}</span>
                <span style={styles.statusBadge}>
                  <span style={{ ...styles.statusText, color: getStatusColor(item.status) }}>
                    {item.status?.toUpperCase()}
                  </span>
                </span>
              </div>
              <div style={styles.playTitle}>{item.playTitle}</div>
              <div style={styles.customerInfo}>
                {item.customerName} • {item.customerEmail}
              </div>
              <div style={styles.bookingDetails}>
                <div style={styles.detailItem}>
                  <IoTicketOutline size={16} color="#666" />
                  <span style={styles.detailText}>
                    {item.quantity} seat(s) • {item.ticketType}
                  </span>
                </div>
                <div style={styles.detailItem}>
                  <IoCashOutline size={16} color="#666" />
                  <span style={styles.detailText}>{formatCurrency(item.totalPrice)}</span>
                </div>
                <div style={styles.detailItem}>
                  <IoCalendarOutline size={16} color="#666" />
                  <span style={styles.detailText}>{formatDate(item.playDate)}</span>
                </div>
              </div>
              <div style={styles.bookingFooter}>
                <span style={{ ...styles.paymentBadge, backgroundColor: `${getPaymentColor(item.paymentStatus)}20` }}>
                  <span style={{ ...styles.paymentText, color: getPaymentColor(item.paymentStatus) }}>
                    {item.paymentStatus?.toUpperCase()}
                  </span>
                </span>
                <div style={styles.actionButtons}>
                  <button
                    style={styles.actionButton}
                    onClick={() => {
                      setSelectedBooking(item);
                      setViewModalVisible(true);
                    }}
                  >
                    <IoEyeOutline size={20} color="#2196F3" />
                  </button>
                  {item.paymentStatus === 'pending' && (
                    <button
                      style={styles.actionButton}
                      onClick={() => handleApprovePayment(item.id)}
                    >
                      <IoCheckmarkCircleOutline size={20} color="#4CAF50" />
                    </button>
                  )}
                  {item.status !== 'cancelled' && (
                    <button
                      style={styles.actionButton}
                      onClick={() => handleCancelBooking(item.id)}
                    >
                      <IoCloseCircleOutline size={20} color="#F44336" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for booking details */}
      {viewModalVisible && selectedBooking && (
        <div style={styles.modalOverlay} onClick={() => setViewModalVisible(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Booking Details</h2>
              <button style={styles.modalClose} onClick={() => setViewModalVisible(false)}>
                <IoClose size={24} color="#333" />
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {/* Play Information */}
              <div style={styles.modalSection}>
                <div style={styles.sectionTitle}>PLAY INFORMATION</div>
                <div style={styles.modalPlayTitle}>{selectedBooking.playTitle}</div>
                <div style={styles.modalDetailRow}>
                  <IoCalendarOutline size={16} color="#666" />
                  <span style={styles.modalDetailText}>{formatDate(selectedBooking.playDate)}</span>
                </div>
              </div>

              {/* Customer Information */}
              <div style={styles.modalSection}>
                <div style={styles.sectionTitle}>CUSTOMER INFORMATION</div>
                <div style={styles.modalText}>{selectedBooking.customerName}</div>
                <div style={styles.modalDetailRow}>
                  <IoMailOutline size={16} color="#666" />
                  <span style={styles.modalDetailText}>{selectedBooking.customerEmail}</span>
                </div>
                {selectedBooking.customerPhone && (
                  <div style={styles.modalDetailRow}>
                    <IoCallOutline size={16} color="#666" />
                    <span style={styles.modalDetailText}>{selectedBooking.customerPhone}</span>
                  </div>
                )}
              </div>

              {/* Ticket Details */}
              <div style={styles.modalSection}>
                <div style={styles.sectionTitle}>TICKET DETAILS</div>
                <div style={styles.modalGrid}>
                  <div style={styles.modalGridItem}>
                    <div style={styles.modalLabel}>Type</div>
                    <div style={styles.modalValue}>{selectedBooking.ticketType?.toUpperCase()}</div>
                  </div>
                  <div style={styles.modalGridItem}>
                    <div style={styles.modalLabel}>Quantity</div>
                    <div style={styles.modalValue}>{selectedBooking.quantity}</div>
                  </div>
                  <div style={styles.modalGridItem}>
                    <div style={styles.modalLabel}>Total</div>
                    <div style={{ ...styles.modalValue, color: '#6200EE' }}>
                      {formatCurrency(selectedBooking.totalPrice)}
                    </div>
                  </div>
                </div>
                <div style={styles.modalLabel}>Allocated Seats</div>
                <div style={styles.seatsContainer}>
                  {selectedBooking.allocatedSeats?.map((seat, index) => (
                    <span key={index} style={styles.seatChip}>
                      <span style={styles.seatText}>{seat.number}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div style={styles.modalSection}>
                <div style={styles.sectionTitle}>PAYMENT INFORMATION</div>
                <div style={styles.modalGrid}>
                  <div style={styles.modalGridItem}>
                    <div style={styles.modalLabel}>Method</div>
                    <div style={styles.modalValue}>{selectedBooking.paymentMethod?.toUpperCase()}</div>
                  </div>
                  <div style={styles.modalGridItem}>
                    <div style={styles.modalLabel}>Status</div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: `${getPaymentColor(selectedBooking.paymentStatus)}20`,
                        display: 'inline-block',
                      }}
                    >
                      <span
                        style={{
                          ...styles.paymentText,
                          color: getPaymentColor(selectedBooking.paymentStatus),
                        }}
                      >
                        {selectedBooking.paymentStatus?.toUpperCase()}
                      </span>
                    </span>
                  </div>
                </div>
                {selectedBooking.paymentCode && (
                  <>
                    <div style={styles.modalLabel}>Payment Code</div>
                    <div style={styles.paymentCode}>{selectedBooking.paymentCode}</div>
                  </>
                )}
              </div>

              <div style={styles.modalActions}>
                <button
                  style={{ ...styles.modalButton, ...styles.secondaryButton }}
                  onClick={() => setViewModalVisible(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}