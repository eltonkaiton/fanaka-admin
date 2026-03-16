// src/pages/Usher.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  IoFilterOutline,
  IoChatbubbleEllipsesOutline,
  IoLogOutOutline,
  IoQrCodeOutline,
  IoCheckmarkCircleOutline,
  IoClose,
  IoAppsOutline,
  IoTimeOutline,
  IoEnterOutline,
  IoCloseCircleOutline,
  IoEllipsisHorizontal,
  IoArrowBack,
  IoCalendarOutline,
  IoMailOutline,
  IoCallOutline,
  IoCheckmarkDoneCircle,
  IoWarningOutline
} from 'react-icons/io5';

export default function Usher() {
  const navigate = useNavigate();
  const [bookingRef, setBookingRef] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [todayBookings, setTodayBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusBookings, setStatusBookings] = useState([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // Toast state
  const [toasts, setToasts] = useState([]);

  // Toast functions
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    fetchTodayBookings();
    fetchAllBookings();
  }, []);

  useEffect(() => {
    filterBookingsByStatus();
  }, [selectedStatus, todayBookings, allBookings, showAllBookings]);

  const fetchTodayBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`https://fanaka-server-1.onrender.com/api/bookings?date=${today}&status=confirmed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setTodayBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching today bookings:', error);
      showToast('Failed to load today\'s bookings', 'error');
    }
  };

  const fetchAllBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://fanaka-server-1.onrender.com/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setAllBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      showToast('Failed to load all bookings', 'error');
    }
  };

  const filterBookingsByStatus = () => {
    const bookings = showAllBookings ? allBookings : todayBookings;
    if (selectedStatus === 'all') {
      setFilteredBookings(bookings);
    } else if (selectedStatus === 'checkedIn') {
      setFilteredBookings(bookings.filter(booking => booking.checkedIn));
    } else if (selectedStatus === 'notCheckedIn') {
      setFilteredBookings(bookings.filter(booking => !booking.checkedIn && booking.status === 'confirmed'));
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === selectedStatus));
    }
  };

  const verifyBooking = async () => {
    if (!bookingRef.trim()) {
      showToast('Please enter booking reference', 'warning');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://fanaka-server-1.onrender.com/api/bookings/verify/${bookingRef}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBookingData(response.data.booking);
        setShowBookingDetails(true);
      } else {
        showToast('Booking reference not found', 'error');
        setBookingData(null);
      }
    } catch (error) {
      showToast(error.response?.data?.msg || 'Failed to verify booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkInCustomer = async () => {
    if (!bookingData) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`https://fanaka-server-1.onrender.com/api/bookings/${bookingData.id}/checkin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        showToast('Customer checked in successfully!', 'success');
        setBookingData({ ...bookingData, checkedIn: true, checkInTime: new Date() });
        fetchTodayBookings();
        fetchAllBookings();
        setTimeout(() => {
          setBookingRef('');
          setBookingData(null);
          setShowBookingDetails(false);
        }, 1500);
      }
    } catch (error) {
      showToast(error.response?.data?.msg || 'Failed to check in', 'error');
    }
  };

  const handleBack = () => {
    setShowBookingDetails(false);
    setBookingData(null);
    setBookingRef('');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    showToast('Logged out successfully', 'success');
    navigate('/login', { replace: true });
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#F44336';
      case 'checked_in': return '#2196F3';
      default: return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      case 'checked_in': return 'Checked In';
      default: return status || 'Unknown';
    }
  };

  const handleScanQR = () => {
    showToast('QR scanning would be implemented here', 'info');
  };

  const showStatusBookings = (status) => {
    const bookings = showAllBookings ? allBookings : todayBookings;
    let filtered = [];

    if (status === 'checkedIn') {
      filtered = bookings.filter(booking => booking.checkedIn);
      setSelectedStatusFilter('Checked In');
    } else if (status === 'notCheckedIn') {
      filtered = bookings.filter(booking => !booking.checkedIn && booking.status === 'confirmed');
      setSelectedStatusFilter('Not Checked In');
    } else {
      filtered = bookings.filter(booking => booking.status === status);
      setSelectedStatusFilter(getStatusText(status));
    }

    setStatusBookings(filtered);
    setStatusModalVisible(true);
  };

  // Toast Component
  const ToastContainer = () => (
    <div style={styles.toastContainer}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            ...styles.toast,
            ...(toast.type === 'success' && styles.toastSuccess),
            ...(toast.type === 'error' && styles.toastError),
            ...(toast.type === 'warning' && styles.toastWarning),
            ...(toast.type === 'info' && styles.toastInfo),
          }}
        >
          <span>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} style={styles.toastClose}>
            <IoClose size={18} color="#fff" />
          </button>
        </div>
      ))}
    </div>
  );

  // Logout Confirmation Modal
  const LogoutModal = () => (
    showLogoutModal && (
      <div style={styles.modalOverlay} onClick={cancelLogout}>
        <div style={styles.confirmModal} onClick={e => e.stopPropagation()}>
          <div style={styles.confirmModalHeader}>
            <IoWarningOutline size={32} color="#F44336" />
            <h3>Confirm Logout</h3>
          </div>
          <p style={styles.confirmModalText}>Are you sure you want to logout?</p>
          <div style={styles.confirmModalButtons}>
            <button style={styles.confirmModalCancel} onClick={cancelLogout}>Cancel</button>
            <button style={styles.confirmModalConfirm} onClick={confirmLogout}>Logout</button>
          </div>
        </div>
      </div>
    )
  );

  // Sidebar component (used in modal)
  const StatusSidebar = () => (
    <div style={styles.sidebar}>
      <button style={styles.sidebarCloseButton} onClick={() => setSidebarVisible(false)}>
        <IoClose size={24} color="#333" />
      </button>
      <h3 style={styles.sidebarTitle}>Filter by Status</h3>
      <button
        style={{ ...styles.sidebarItem, ...(selectedStatus === 'all' && styles.sidebarItemActive) }}
        onClick={() => { setSelectedStatus('all'); setSidebarVisible(false); }}
      >
        <IoAppsOutline size={20} color={selectedStatus === 'all' ? '#6200EE' : '#666'} />
        <span style={{ ...styles.sidebarItemText, ...(selectedStatus === 'all' && styles.sidebarItemTextActive) }}>All Bookings</span>
      </button>
      <div style={styles.sidebarItem}>
        <button
          style={{ ...styles.sidebarItemContent, ...(selectedStatus === 'confirmed' && styles.sidebarItemActive) }}
          onClick={() => { setSelectedStatus('confirmed'); setSidebarVisible(false); }}
        >
          <IoCheckmarkCircleOutline size={20} color={selectedStatus === 'confirmed' ? '#4CAF50' : '#666'} />
          <span style={{ ...styles.sidebarItemText, ...(selectedStatus === 'confirmed' && styles.sidebarItemTextActive) }}>Confirmed</span>
        </button>
        <button onClick={() => showStatusBookings('confirmed')} style={styles.sidebarItemIcon}>
          <IoEllipsisHorizontal size={20} color="#999" />
        </button>
      </div>
      <div style={styles.sidebarItem}>
        <button
          style={{ ...styles.sidebarItemContent, ...(selectedStatus === 'pending' && styles.sidebarItemActive) }}
          onClick={() => { setSelectedStatus('pending'); setSidebarVisible(false); }}
        >
          <IoTimeOutline size={20} color={selectedStatus === 'pending' ? '#FF9800' : '#666'} />
          <span style={{ ...styles.sidebarItemText, ...(selectedStatus === 'pending' && styles.sidebarItemTextActive) }}>Pending</span>
        </button>
        <button onClick={() => showStatusBookings('pending')} style={styles.sidebarItemIcon}>
          <IoEllipsisHorizontal size={20} color="#999" />
        </button>
      </div>
      <div style={styles.sidebarItem}>
        <button
          style={{ ...styles.sidebarItemContent, ...(selectedStatus === 'checkedIn' && styles.sidebarItemActive) }}
          onClick={() => { setSelectedStatus('checkedIn'); setSidebarVisible(false); }}
        >
          <IoEnterOutline size={20} color={selectedStatus === 'checkedIn' ? '#2196F3' : '#666'} />
          <span style={{ ...styles.sidebarItemText, ...(selectedStatus === 'checkedIn' && styles.sidebarItemTextActive) }}>Checked In</span>
        </button>
        <button onClick={() => showStatusBookings('checkedIn')} style={styles.sidebarItemIcon}>
          <IoEllipsisHorizontal size={20} color="#999" />
        </button>
      </div>
      <div style={styles.sidebarItem}>
        <button
          style={{ ...styles.sidebarItemContent, ...(selectedStatus === 'notCheckedIn' && styles.sidebarItemActive) }}
          onClick={() => { setSelectedStatus('notCheckedIn'); setSidebarVisible(false); }}
        >
          <IoLogOutOutline size={20} color={selectedStatus === 'notCheckedIn' ? '#FF9800' : '#666'} />
          <span style={{ ...styles.sidebarItemText, ...(selectedStatus === 'notCheckedIn' && styles.sidebarItemTextActive) }}>Not Checked In</span>
        </button>
        <button onClick={() => showStatusBookings('notCheckedIn')} style={styles.sidebarItemIcon}>
          <IoEllipsisHorizontal size={20} color="#999" />
        </button>
      </div>
      <div style={styles.sidebarItem}>
        <button
          style={{ ...styles.sidebarItemContent, ...(selectedStatus === 'cancelled' && styles.sidebarItemActive) }}
          onClick={() => { setSelectedStatus('cancelled'); setSidebarVisible(false); }}
        >
          <IoCloseCircleOutline size={20} color={selectedStatus === 'cancelled' ? '#F44336' : '#666'} />
          <span style={{ ...styles.sidebarItemText, ...(selectedStatus === 'cancelled' && styles.sidebarItemTextActive) }}>Cancelled</span>
        </button>
        <button onClick={() => showStatusBookings('cancelled')} style={styles.sidebarItemIcon}>
          <IoEllipsisHorizontal size={20} color="#999" />
        </button>
      </div>
    </div>
  );

  // Booking Details Modal
  const BookingDetailsModal = () => (
    showBookingDetails && (
      <div style={styles.detailsModalOverlay} onClick={handleBack}>
        <div style={styles.detailsModalContent} onClick={e => e.stopPropagation()}>
          <div style={styles.detailsModalHeader}>
            <button onClick={handleBack} style={styles.iconButton}>
              <IoArrowBack size={24} color="#333" />
            </button>
            <h3 style={styles.detailsModalTitle}>Booking Details</h3>
            <div style={{ width: 24 }} />
          </div>
          <div style={styles.detailsModalBody}>
            {bookingData && (
              <>
                <div style={styles.detailsSection}>
                  <p style={styles.detailsSectionTitle}>BOOKING INFORMATION</p>
                  <p style={styles.detailsBookingRef}>{bookingData.bookingReference}</p>
                  <div style={styles.detailsStatusRow}>
                    <span style={{ ...styles.detailsStatusBadge, backgroundColor: bookingData.checkedIn ? '#4CAF50' : '#FF9800' }}>
                      {bookingData.checkedIn ? 'CHECKED IN' : 'NOT CHECKED IN'}
                    </span>
                    <span style={{ ...styles.detailsStatusBadge, backgroundColor: getStatusColor(bookingData.status) }}>
                      {bookingData.status?.toUpperCase() || 'PENDING'}
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
                    <IoTimeOutline size={18} color="#666" />
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
                      <span style={styles.detailsGridLabel}>Ticket Type</span>
                      <span style={styles.detailsGridValue}>{bookingData.ticketType?.toUpperCase()}</span>
                    </div>
                    <div style={styles.detailsGridItem}>
                      <span style={styles.detailsGridLabel}>Quantity</span>
                      <span style={styles.detailsGridValue}>{bookingData.quantity} persons</span>
                    </div>
                    <div style={styles.detailsGridItem}>
                      <span style={styles.detailsGridLabel}>Total Price</span>
                      <span style={{ ...styles.detailsGridValue, color: '#6200EE' }}>KES {bookingData.totalPrice}</span>
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
                      <span style={styles.detailsGridLabel}>Payment Method</span>
                      <span style={styles.detailsGridValue}>{bookingData.paymentMethod?.toUpperCase()}</span>
                    </div>
                    <div style={styles.detailsGridItem}>
                      <span style={styles.detailsGridLabel}>Payment Status</span>
                      <span style={{ ...styles.detailsStatusBadge, backgroundColor: bookingData.paymentStatus === 'approved' ? '#4CAF50' : '#FF9800' }}>
                        {bookingData.paymentStatus?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                  </div>
                  {bookingData.paymentCode && (
                    <>
                      <p style={styles.detailsSectionSubtitle}>Payment Code</p>
                      <code style={styles.paymentCode}>{bookingData.paymentCode}</code>
                    </>
                  )}
                </div>

                {bookingData.checkedIn && bookingData.checkInTime && (
                  <div style={styles.detailsSection}>
                    <p style={styles.detailsSectionTitle}>CHECK-IN INFORMATION</p>
                    <div style={styles.detailsRow}>
                      <IoCheckmarkDoneCircle size={18} color="#4CAF50" />
                      <span style={{ ...styles.detailsRowText, color: '#4CAF50' }}>
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
              </>
            )}
          </div>
        </div>
      </div>
    )
  );

  return (
    <div style={styles.safeArea}>
      {/* Toast notifications */}
      <ToastContainer />

      {/* Logout confirmation modal */}
      <LogoutModal />

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
            <button style={styles.messageButton} onClick={() => navigate('/employee-inbox')}>
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
              <span style={styles.verifyButtonText}>Loading...</span>
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
              {selectedStatus === 'all' ? 'All' :
                selectedStatus === 'checkedIn' ? 'Checked In' :
                selectedStatus === 'notCheckedIn' ? 'Not Checked In' :
                getStatusText(selectedStatus)} ({filteredBookings.length})
            </h3>
            <button style={styles.toggleButton} onClick={() => setShowAllBookings(!showAllBookings)}>
              <span style={styles.toggleButtonText}>{showAllBookings ? 'Today' : 'All'}</span>
            </button>
          </div>
          <div style={styles.bookingsList}>
            {filteredBookings.map((booking) => (
              <button
                key={booking.id}
                style={styles.bookingItem}
                onClick={() => {
                  setBookingRef(booking.bookingReference);
                  verifyBooking();
                }}
              >
                <div style={styles.bookingItemLeft}>
                  <span style={styles.bookingItemRef}>{booking.bookingReference}</span>
                  <span style={styles.bookingItemCustomer}>{booking.customerName}</span>
                  <div style={styles.bookingItemDetails}>
                    <span style={styles.bookingItemPlay}>{booking.playTitle}</span>
                    <span style={styles.bookingItemDate}>{formatDate(booking.playDate)} {formatTime(booking.playDate)}</span>
                  </div>
                </div>
                <div style={styles.bookingItemRight}>
                  <span style={styles.bookingItemQuantity}>{booking.quantity} pax</span>
                  <span style={{ ...styles.bookingItemStatus, backgroundColor: booking.checkedIn ? '#4CAF50' : getStatusColor(booking.status) }}>
                    {booking.checkedIn ? 'In' : booking.status || 'Pending'}
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
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <StatusSidebar />
          </div>
        </div>
      )}

      {/* Status Bookings Modal */}
      {statusModalVisible && (
        <div style={styles.statusModalOverlay} onClick={() => setStatusModalVisible(false)}>
          <div style={styles.statusModalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.statusModalHeader}>
              <h3 style={styles.statusModalTitle}>{selectedStatusFilter} Bookings ({statusBookings.length})</h3>
              <button onClick={() => setStatusModalVisible(false)} style={styles.iconButton}>
                <IoClose size={24} color="#333" />
              </button>
            </div>
            <div style={styles.statusModalList}>
              {statusBookings.map((booking) => (
                <button
                  key={booking.id}
                  style={styles.statusModalItem}
                  onClick={() => {
                    setBookingRef(booking.bookingReference);
                    verifyBooking();
                    setStatusModalVisible(false);
                  }}
                >
                  <span style={styles.statusModalRef}>{booking.bookingReference}</span>
                  <span style={styles.statusModalCustomer}>{booking.customerName}</span>
                  <span style={styles.statusModalPlay}>{booking.playTitle}</span>
                  <span style={styles.statusModalTime}>{formatTime(booking.playDate)} • {booking.quantity} seats</span>
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

// Styles (converted from React Native StyleSheet)
const styles = {
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  container: {
    padding: 16,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuButton: {
    padding: 8,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  headerCenter: {
    flex: 1,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageButton: {
    padding: 8,
    marginRight: 8,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  logoutButton: {
    padding: 8,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  searchBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
    outline: 'none',
  },
  scanButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButton: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#6200EE',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bookingsSection: {
    flex: 1,
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  toggleButton: {
    backgroundColor: '#6200EE',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    border: 'none',
    cursor: 'pointer',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  bookingsList: {
    maxHeight: 'calc(100vh - 300px)',
    overflowY: 'auto',
  },
  bookingItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
  },
  bookingItemLeft: {
    flex: 1,
  },
  bookingItemRef: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    display: 'block',
  },
  bookingItemCustomer: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    display: 'block',
  },
  bookingItemDetails: {
    marginTop: 8,
  },
  bookingItemPlay: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    display: 'block',
  },
  bookingItemDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    display: 'block',
  },
  bookingItemRight: {
    alignItems: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
  },
  bookingItemQuantity: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  bookingItemStatus: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
  // Sidebar
  sidebar: {
    width: 280,
    backgroundColor: '#fff',
    height: '100%',
    padding: 20,
    paddingTop: 50,
    position: 'relative',
  },
  sidebarCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 0,
  },
  sidebarItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
  },
  sidebarItemContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  sidebarItemActive: {
    backgroundColor: '#6200EE10',
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
    borderLeftStyle: 'solid',
  },
  sidebarItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    textAlign: 'left',
  },
  sidebarItemTextActive: {
    color: '#6200EE',
    fontWeight: '600',
  },
  sidebarItemIcon: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
  },
  // Modal overlay
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  modalContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
  },
  // Status modal
  statusModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  statusModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    width: '100%',
  },
  statusModalHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
  },
  statusModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  statusModalList: {
    padding: 20,
    maxHeight: 'calc(80vh - 80px)',
    overflowY: 'auto',
  },
  statusModalItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
  },
  statusModalRef: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    display: 'block',
  },
  statusModalCustomer: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    display: 'block',
  },
  statusModalPlay: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    display: 'block',
  },
  statusModalTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    display: 'block',
  },
  statusModalEmpty: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    padding: 20,
  },
  // Booking Details Modal
  detailsModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  detailsModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    width: '100%',
  },
  detailsModalHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
  },
  detailsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  detailsModalBody: {
    padding: 20,
    maxHeight: 'calc(90vh - 80px)',
    overflowY: 'auto',
  },
  detailsSection: {
    marginBottom: 25,
  },
  detailsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    margin: '0 0 12px 0',
  },
  detailsSectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 5,
  },
  detailsBookingRef: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    margin: '0 0 12px 0',
  },
  detailsStatusRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 15,
  },
  detailsStatusBadge: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsPlayTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    margin: '0 0 10px 0',
  },
  detailsCustomerName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
    margin: '0 0 10px 0',
  },
  detailsRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsRowText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  detailsGridItem: {
    width: '48%',
    marginBottom: 12,
  },
  detailsGridLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    display: 'block',
  },
  detailsGridValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  seatsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  seatChip: {
    backgroundColor: '#6200EE',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    color: '#fff',
    fontSize: 14,
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
    display: 'block',
  },
  detailsActions: {
    marginTop: 20,
    marginBottom: 10,
  },
  checkInButtonLarge: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  checkInButtonLargeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Toast styles
  toastContainer: {
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '250px',
    maxWidth: '400px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: 'slideIn 0.3s ease',
  },
  toastSuccess: {
    backgroundColor: '#4CAF50',
  },
  toastError: {
    backgroundColor: '#F44336',
  },
  toastWarning: {
    backgroundColor: '#FF9800',
  },
  toastInfo: {
    backgroundColor: '#2196F3',
  },
  toastClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '12px',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  // Logout confirmation modal
  confirmModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: '400px',
    margin: 'auto',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  },
  confirmModalHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmModalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmModalButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  confirmModalCancel: {
    flex: 1,
    padding: '12px',
    borderRadius: 8,
    border: '1px solid #ddd',
    backgroundColor: '#f5f5f5',
    fontSize: 16,
    fontWeight: '500',
    cursor: 'pointer',
  },
  confirmModalConfirm: {
    flex: 1,
    padding: '12px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#F44336',
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    cursor: 'pointer',
  },
};

// Add keyframes for toast animation (can be added globally in CSS)
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`, styleSheet.cssRules.length);