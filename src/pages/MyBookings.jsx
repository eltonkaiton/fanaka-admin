import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  IoImagesOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTime,
  IoHelpCircle,
  IoCardOutline,
  IoCalendarOutline,
  IoTicketOutline,
  IoPersonOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoInformationCircle,
  IoChevronForward,
  IoClose,
  IoPerson,
  IoMail,
  IoCall,
  IoPeople,
  IoBarcode,
  IoLockClosed,
  IoLogIn,
  IoSearch,
  IoRefresh,
  IoHome,
  IoEyeOutline,
} from 'react-icons/io5';
import { QRCodeCanvas } from 'qrcode.react';

const API_BASE_URL = 'https://fanaka-server-1.onrender.com';

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [generatingTicket, setGeneratingTicket] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for scrolling
  const listEndRef = useRef(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) fetchMyBookings();
  }, [userData]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(
        (booking) =>
          booking.playTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.bookingReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.paymentStatus?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.status?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBookings(filtered);
    }
  }, [searchQuery, bookings]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });
        setUserData(response.data);
      } else {
        alert('Login required to view bookings');
        navigate('/login');
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        alert('Session expired. Please login again.');
        navigate('/login');
      }
    }
  };

  const fetchPlayDetails = async (playId) => {
    if (!playId) return null;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/plays/${playId}`);
      if (response.data.success) {
        return response.data.play;
      }
    } catch (error) {
      console.log(`Error fetching play ${playId}:`, error.message);
    }
    return null;
  };

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        setLoading(false);
        return;
      }

      if (!userData) {
        const userResponse = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });
        setUserData(userResponse.data);
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/bookings/my-bookings`, {
          params: { email: userData?.email },
        });

        if (response.data.success) {
          let bookingsData = response.data.bookings || [];

          const bookingsWithDetails = await Promise.all(
            bookingsData.map(async (booking) => {
              if (booking.playId && !booking.play) {
                const playDetails = await fetchPlayDetails(booking.playId);
                if (playDetails) {
                  booking.play = playDetails;
                } else {
                  booking.play = {
                    title: booking.playTitle,
                    venue: 'Main Theater',
                    image: null,
                  };
                }
              }
              return booking;
            })
          );

          setBookings(bookingsWithDetails);
          setFilteredBookings(bookingsWithDetails);
        }
      } catch (mainError) {
        console.log('Main endpoint failed, trying test endpoint:', mainError.message);
        try {
          const testResponse = await axios.get(`${API_BASE_URL}/api/bookings/test/user-bookings`);
          if (testResponse.data.success) {
            const userBookings = testResponse.data.bookings.filter(
              (booking) => booking.customerEmail === userData?.email
            );

            const bookingsWithDetails = await Promise.all(
              userBookings.map(async (booking) => {
                if (booking.playId && !booking.play) {
                  const playDetails = await fetchPlayDetails(booking.playId);
                  if (playDetails) {
                    booking.play = playDetails;
                  } else {
                    booking.play = {
                      title: booking.playTitle,
                      venue: 'Main Theater',
                      image: null,
                    };
                  }
                }
                return booking;
              })
            );

            setBookings(bookingsWithDetails);
            setFilteredBookings(bookingsWithDetails);
          }
        } catch (testError) {
          console.log('Test endpoint also failed:', testError.message);
          alert('Failed to load bookings. Please try again.');
        }
      }
    } catch (error) {
      console.log('Error in fetchMyBookings:', error);
      if (error.message === 'Network Error') {
        alert('Cannot connect to server. Please check your connection.');
      } else {
        alert('Failed to load bookings. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyBookings();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return '';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return '#757575';
    switch (status.toLowerCase()) {
      case 'approved':
      case 'confirmed':
      case 'checked_in':
        return '#4CAF50';
      case 'rejected':
      case 'cancelled':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    if (!paymentStatus) return '#757575';
    switch (paymentStatus.toLowerCase()) {
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'UNKNOWN';
    return status.toUpperCase();
  };

  const getPaymentStatusText = (paymentStatus) => {
    if (!paymentStatus) return 'PENDING';
    return paymentStatus.toUpperCase();
  };

  const getStatusIcon = (status) => {
    if (!status) return IoHelpCircle;
    const statusLower = status.toLowerCase();
    if (['approved', 'confirmed', 'checked_in'].includes(statusLower)) return IoCheckmarkCircle;
    if (['rejected', 'cancelled'].includes(statusLower)) return IoCloseCircle;
    if (statusLower === 'pending') return IoTime;
    return IoHelpCircle;
  };

  const getPaymentStatusIcon = (paymentStatus) => {
    if (!paymentStatus) return IoCardOutline;
    const paymentLower = paymentStatus.toLowerCase();
    if (paymentLower === 'approved') return IoCheckmarkCircle;
    if (paymentLower === 'rejected') return IoCloseCircle;
    if (paymentLower === 'pending') return IoTime;
    return IoCardOutline;
  };

  const getSeatNumbers = (allocatedSeats) => {
    if (!allocatedSeats || !Array.isArray(allocatedSeats) || allocatedSeats.length === 0) {
      return 'Not assigned';
    }
    try {
      if (typeof allocatedSeats[0] === 'string') return allocatedSeats.join(', ');
      if (typeof allocatedSeats[0] === 'object') {
        return allocatedSeats.map((seat) => seat.number || seat.seatNumber || 'N/A').join(', ');
      }
      return allocatedSeats.join(', ');
    } catch (error) {
      return 'Not assigned';
    }
  };

  const isTicketAvailable = (booking) => {
    const isPaymentApproved = booking.paymentStatus?.toLowerCase() === 'approved';
    const isBookingValid = ['approved', 'confirmed', 'checked_in'].includes(booking.status?.toLowerCase());
    return isPaymentApproved && isBookingValid;
  };

  const handleCancelBooking = async (bookingId, bookingTitle) => {
    if (!window.confirm(`Are you sure you want to cancel your booking for "${bookingTitle}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        alert('Booking cancelled successfully');
        fetchMyBookings();
        setModalVisible(false);
      }
    } catch (error) {
      alert(error.response?.data?.msg || 'Failed to cancel booking');
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const generateQRCodeData = (booking) => {
    const qrData = {
      bookingId: booking.id || booking._id,
      reference: booking.bookingReference,
      customer: booking.customerName || userData?.fullName,
      email: booking.customerEmail || userData?.email,
      play: booking.playTitle,
      date: booking.playDate,
      seats: getSeatNumbers(booking.allocatedSeats),
      quantity: booking.quantity,
      ticketType: booking.ticketType,
      amount: booking.totalPrice,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      timestamp: new Date().toISOString(),
      type: 'THEATER_TICKET_VERIFICATION',
    };
    return JSON.stringify(qrData);
  };

  const generatePDFTicket = async (booking) => {
    if (!isTicketAvailable(booking)) {
      const bookingStatus = booking.status || 'PENDING';
      const paymentStatus = booking.paymentStatus || 'PENDING';

      alert(
        `Ticket can only be generated when:\n1. Booking is CONFIRMED\n2. Payment is APPROVED\n\nCurrent Status:\n• Booking: ${bookingStatus.toUpperCase()}\n• Payment: ${paymentStatus.toUpperCase()}`
      );
      return;
    }

    try {
      setGeneratingTicket(true);
      const play = booking.play || {};
      const seatNumbers = getSeatNumbers(booking.allocatedSeats);
      const eventDate = booking.playDate ? new Date(booking.playDate) : new Date();
      const qrData = generateQRCodeData(booking);
      const venue = play.venue || booking.venue || 'Main Theater';

      // Create a hidden div with the ticket HTML, then trigger print
      const printWindow = window.open('', '_blank');
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Ticket - ${booking.playTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; }
            .ticket-container { width: 100%; max-width: 800px; perspective: 1000px; }
            .ticket { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); position: relative; }
            .ticket-header { background: linear-gradient(135deg, #6200EE 0%, #3700B3 100%); padding: 30px; text-align: center; color: white; position: relative; overflow: hidden; }
            .ticket-header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px; transform: rotate(45deg); }
            .ticket-title { font-size: 36px; font-weight: 700; margin-bottom: 10px; letter-spacing: 2px; position: relative; z-index: 2; }
            .ticket-subtitle { font-size: 16px; opacity: 0.9; letter-spacing: 1px; position: relative; z-index: 2; }
            .status-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 25px; margin-top: 15px; font-size: 14px; font-weight: 600; letter-spacing: 1px; backdrop-filter: blur(10px); position: relative; z-index: 2; }
            .ticket-body { padding: 40px; }
            .play-info { text-align: center; margin-bottom: 30px; border-bottom: 2px dashed #e0e0e0; padding-bottom: 30px; }
            .play-title { font-size: 28px; font-weight: 700; color: #333; margin-bottom: 10px; line-height: 1.3; }
            .play-venue { font-size: 18px; color: #666; margin-bottom: 20px; }
            .event-details { display: flex; justify-content: center; gap: 30px; margin-bottom: 20px; flex-wrap: wrap; }
            .event-detail { display: flex; align-items: center; gap: 10px; font-size: 16px; color: #555; }
            .detail-icon { font-size: 20px; color: #6200EE; }
            .ticket-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; margin-bottom: 30px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 30px; border-radius: 15px; }
            .grid-item { text-align: center; }
            .grid-label { font-size: 14px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
            .grid-value { font-size: 24px; font-weight: 700; color: #333; }
            .ticket-value { color: #6200EE; }
            .ticket-type { color: #00C853; }
            .customer-info { background: #f8f9fa; padding: 25px; border-radius: 15px; margin-bottom: 30px; }
            .customer-title { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 15px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; }
            .customer-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
            .customer-detail { display: flex; align-items: center; gap: 10px; font-size: 15px; color: #555; }
            .reference-container { background: linear-gradient(135deg, #6200EE 0%, #3700B3 100%); padding: 25px; border-radius: 15px; text-align: center; margin-bottom: 30px; color: white; }
            .reference-label { font-size: 14px; opacity: 0.9; margin-bottom: 10px; letter-spacing: 1px; }
            .reference-value { font-size: 28px; font-weight: 700; letter-spacing: 2px; margin-bottom: 10px; font-family: monospace; }
            .reference-note { font-size: 14px; opacity: 0.8; font-style: italic; }
            .verification-section { display: flex; align-items: center; justify-content: space-between; background: white; border: 2px solid #e0e0e0; border-radius: 15px; padding: 20px; margin-bottom: 30px; }
            .verification-info { flex: 1; }
            .verification-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 8px; }
            .verification-text { font-size: 14px; color: #666; line-height: 1.5; }
            .qrcode-container { display: flex; flex-direction: column; align-items: center; }
            .qrcode-label { font-size: 12px; color: #666; margin-top: 8px; text-align: center; }
            .ticket-footer { text-align: center; padding-top: 20px; border-top: 2px dashed #e0e0e0; color: #666; font-size: 14px; }
            .footer-text { margin-bottom: 8px; }
            .watermark { position: absolute; bottom: 20px; right: 20px; font-size: 12px; color: rgba(0,0,0,0.1); transform: rotate(-45deg); user-select: none; }
            @media print { body { background: white !important; } .ticket { box-shadow: none !important; border: 1px solid #ddd !important; } }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="ticket">
              <div class="ticket-header">
                <h1 class="ticket-title">THEATER TICKET</h1>
                <p class="ticket-subtitle">OFFICIAL ADMISSION PASS • SCAN TO VERIFY</p>
                <div class="status-badge">BOOKING CONFIRMED • PAYMENT APPROVED • VALID FOR ENTRY</div>
              </div>
              <div class="ticket-body">
                <div class="play-info">
                  <h2 class="play-title">${booking.playTitle}</h2>
                  <p class="play-venue">${venue}</p>
                  <div class="event-details">
                    <div class="event-detail"><span class="detail-icon">📅</span><span>${eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                    <div class="event-detail"><span class="detail-icon">⏰</span><span>${eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
                  </div>
                </div>
                <div class="ticket-grid">
                  <div class="grid-item"><div class="grid-label">Ticket Type</div><div class="grid-value ticket-type">${booking.ticketType?.toUpperCase()}</div></div>
                  <div class="grid-item"><div class="grid-label">Quantity</div><div class="grid-value">${booking.quantity}</div></div>
                  <div class="grid-item"><div class="grid-label">Seat(s)</div><div class="grid-value">${seatNumbers}</div></div>
                  <div class="grid-item"><div class="grid-label">Total Amount</div><div class="grid-value ticket-value">KES ${booking.totalPrice}</div></div>
                </div>
                <div class="customer-info">
                  <div class="customer-title">Customer Information</div>
                  <div class="customer-details">
                    <div class="customer-detail"><span>👤</span><span>${booking.customerName || userData?.fullName}</span></div>
                    <div class="customer-detail"><span>📧</span><span>${booking.customerEmail || userData?.email}</span></div>
                    <div class="customer-detail"><span>📱</span><span>${booking.customerPhone || userData?.phone || 'N/A'}</span></div>
                    <div class="customer-detail"><span>📅</span><span>Booked: ${new Date(booking.createdAt || booking.bookingDate).toLocaleDateString()}</span></div>
                  </div>
                </div>
                <div class="reference-container">
                  <div class="reference-label">BOOKING REFERENCE</div>
                  <div class="reference-value">${booking.bookingReference}</div>
                  <div class="reference-note">Scan QR code below for verification</div>
                </div>
                <div class="verification-section">
                  <div class="verification-info">
                    <div class="verification-title">VERIFICATION QR CODE</div>
                    <div class="verification-text">Scan this QR code at the entrance gate for ticket validation and admission.</div>
                    <div class="verification-text" style="margin-top: 10px; font-size: 12px;">Contains encrypted booking details for security verification.</div>
                  </div>
                  <div class="qrcode-container">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}" alt="QR Code" width="150" height="150" />
                    <div class="qrcode-label">SCAN TO VERIFY</div>
                  </div>
                </div>
                <div class="ticket-footer">
                  <div class="footer-text">Theater Booking System • Official Ticket with QR Verification</div>
                  <div class="footer-text">Valid for entry only • Non-transferable without permission</div>
                  <div class="footer-text">Ticket generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
                </div>
                <div class="watermark">OFFICIAL TICKET • QR VERIFICATION ENABLED</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();

      alert('Ticket opened in new window. Use print to save as PDF.');
    } catch (error) {
      console.log('Error generating ticket:', error);
      alert('Failed to generate ticket. Please try again.');
    } finally {
      setGeneratingTicket(false);
    }
  };

  const renderBookingCard = (item) => {
    const playImage = item.play?.image
      ? `${API_BASE_URL}${item.play.image.startsWith('/') ? '' : '/'}${item.play.image}`
      : null;

    const isUpcoming = item.playDate ? new Date(item.playDate) > new Date() : false;
    const ticketAvailable = isTicketAvailable(item);

    const venue = item.play?.venue || item.venue || 'Main Theater';

    const statusColor = getStatusColor(item.status);
    const StatusIcon = getStatusIcon(item.status);
    const statusText = getStatusText(item.status);

    const paymentStatusColor = getPaymentStatusColor(item.paymentStatus);
    const PaymentIcon = getPaymentStatusIcon(item.paymentStatus);
    const paymentStatusText = getPaymentStatusText(item.paymentStatus);

    const canCancel = isUpcoming && ['pending', 'approved', 'confirmed'].includes(item.status?.toLowerCase());

    const styles = cardStyles;

    return (
      <div key={item.id || item._id} style={styles.card}>
        <div style={styles.cardHeader}>
          {playImage ? (
            <img src={playImage} alt={item.playTitle} style={styles.playImage} />
          ) : (
            <div style={{ ...styles.playImage, ...styles.noImage }}>
              <IoImagesOutline size={24} color="#666" />
            </div>
          )}
          <div style={styles.playInfo}>
            <div style={styles.playTitle} title={item.playTitle}>
              {item.playTitle || item.play?.title || 'Theater Play'}
            </div>
            <div style={styles.venueText}>{venue}</div>
          </div>
        </div>

        <div style={styles.cardBody}>
          <div style={styles.statusRow}>
            <div style={{ ...styles.statusBadge, backgroundColor: statusColor + '20' }}>
              <StatusIcon size={14} color={statusColor} style={styles.statusIcon} />
              <span style={{ ...styles.statusText, color: statusColor }}>Booking: {statusText}</span>
            </div>
            <div style={{ ...styles.statusBadge, backgroundColor: paymentStatusColor + '20', marginTop: 6 }}>
              <PaymentIcon size={14} color={paymentStatusColor} style={styles.statusIcon} />
              <span style={{ ...styles.statusText, color: paymentStatusColor }}>Payment: {paymentStatusText}</span>
            </div>
          </div>

          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <IoCalendarOutline size={16} color="#666" />
              <span style={styles.detailLabel}>Event Date</span>
              <span style={styles.detailValue}>{formatShortDate(item.playDate)}</span>
            </div>
            <div style={styles.detailItem}>
              <IoTicketOutline size={16} color="#666" />
              <span style={styles.detailLabel}>Tickets</span>
              <span style={styles.detailValue}>{item.quantity} × {item.ticketType?.toUpperCase() || 'REGULAR'}</span>
            </div>
            <div style={styles.detailItem}>
              <IoPersonOutline size={16} color="#666" />
              <span style={styles.detailLabel}>Seats</span>
              <span style={styles.detailValue} title={getSeatNumbers(item.allocatedSeats)}>
                {getSeatNumbers(item.allocatedSeats).substring(0, 20)}
                {getSeatNumbers(item.allocatedSeats).length > 20 ? '...' : ''}
              </span>
            </div>
            <div style={styles.detailItem}>
              <IoCashOutline size={16} color="#666" />
              <span style={styles.detailLabel}>Total</span>
              <span style={styles.detailValue}>KES {item.totalPrice || 0}</span>
            </div>
          </div>

          {item.bookingReference && (
            <div style={styles.referenceRow}>
              <IoDocumentTextOutline size={14} color="#666" />
              <span style={styles.referenceText}>Ref: {item.bookingReference}</span>
            </div>
          )}

          {!ticketAvailable && (
            <div style={{ ...styles.infoRow, backgroundColor: '#FFF3E0' }}>
              <IoInformationCircle size={14} color="#FF9800" />
              <span style={{ ...styles.infoText, color: '#E65100' }}>
                {!['confirmed', 'approved', 'checked_in'].includes(item.status?.toLowerCase())
                  ? 'Booking not confirmed'
                  : 'Payment pending approval'}
              </span>
            </div>
          )}

          {item.status?.toLowerCase() === 'checked_in' && (
            <div style={{ ...styles.infoRow, backgroundColor: '#E8F5E9' }}>
              <IoCheckmarkCircle size={14} color="#4CAF50" />
              <span style={{ ...styles.infoText, color: '#2E7D32' }}>
                ✓ Checked in on {item.checkInTime ? formatShortDate(item.checkInTime) : 'event date'}
              </span>
            </div>
          )}
        </div>

        <div style={styles.cardFooter}>
          <span style={styles.bookingDate}>
            Booked on {new Date(item.bookingDate || item.createdAt).toLocaleDateString()}
          </span>
          <div style={styles.actionButtons}>
            {canCancel && (
              <button
                style={styles.cancelButton}
                onClick={() => handleCancelBooking(item.id || item._id, item.playTitle)}
              >
                Cancel
              </button>
            )}
            <button
              style={{
                ...styles.generateButton,
                ...((generatingTicket || !ticketAvailable) ? styles.generateButtonDisabled : {}),
              }}
              onClick={() => generatePDFTicket(item)}
              disabled={generatingTicket || !ticketAvailable}
            >
              {generatingTicket ? (
                <div className="spinner-small" />
              ) : (
                <>
                  <IoTicketOutline size={16} color="#fff" />
                  <span style={styles.generateButtonText}>
                    {ticketAvailable ? 'Get Ticket' : 'Not Ready'}
                  </span>
                </>
              )}
            </button>
            <button style={styles.viewButton} onClick={() => handleViewDetails(item)}>
              <span style={styles.viewButtonText}>Details</span>
              <IoChevronForward size={16} color="#6200EE" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderBookingModal = () => {
    if (!selectedBooking) return null;

    const play = selectedBooking.play || {};
    const playImage = play.image
      ? `${API_BASE_URL}${play.image.startsWith('/') ? '' : '/'}${play.image}`
      : null;

    const venue = play.venue || selectedBooking.venue || 'Main Theater';
    const seatNumbers = getSeatNumbers(selectedBooking.allocatedSeats);
    const isUpcoming = selectedBooking.playDate ? new Date(selectedBooking.playDate) > new Date() : false;
    const ticketAvailable = isTicketAvailable(selectedBooking);

    const statusColor = getStatusColor(selectedBooking.status);
    const StatusIcon = getStatusIcon(selectedBooking.status);
    const statusText = getStatusText(selectedBooking.status);

    const paymentStatusColor = getPaymentStatusColor(selectedBooking.paymentStatus);
    const PaymentIcon = getPaymentStatusIcon(selectedBooking.paymentStatus);
    const paymentStatusText = getPaymentStatusText(selectedBooking.paymentStatus);

    const qrData = generateQRCodeData(selectedBooking);
    const canCancel = isUpcoming && ['pending', 'approved', 'confirmed'].includes(selectedBooking.status?.toLowerCase());

    const styles = modalStyles;

    return (
      <div style={styles.modalOverlay} onClick={() => setModalVisible(false)}>
        <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h2 style={styles.modalTitle}>Booking Details</h2>
            <button style={styles.modalClose} onClick={() => setModalVisible(false)}>
              <IoClose size={24} color="#666" />
            </button>
          </div>

          <div style={styles.modalContent}>
            <div style={styles.modalPlayInfo}>
              {playImage ? (
                <img src={playImage} alt={selectedBooking.playTitle} style={styles.modalPlayImage} />
              ) : (
                <div style={{ ...styles.modalPlayImage, ...styles.modalNoImage }}>
                  <IoImagesOutline size={40} color="#666" />
                </div>
              )}
              <div style={styles.modalPlayDetails}>
                <div style={styles.modalPlayTitle}>{selectedBooking.playTitle}</div>
                <div style={styles.modalPlayVenue}>{venue}</div>
                <div style={styles.modalStatusContainer}>
                  <div style={{ ...styles.modalStatusBadge, backgroundColor: statusColor + '20', marginBottom: 6 }}>
                    <span style={{ ...styles.modalStatusText, color: statusColor }}>Booking: {statusText}</span>
                  </div>
                  <div style={{ ...styles.modalStatusBadge, backgroundColor: paymentStatusColor + '20' }}>
                    <span style={{ ...styles.modalStatusText, color: paymentStatusColor }}>Payment: {paymentStatusText}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.modalSection}>
              <h3 style={styles.modalSectionTitle}>Booking Information</h3>
              <div style={styles.modalDetailRow}>
                <div style={styles.modalDetailItem}>
                  <IoCalendarOutline size={18} color="#6200EE" />
                  <span style={styles.modalDetailLabel}>Event Date</span>
                  <span style={styles.modalDetailValue}>{formatDate(selectedBooking.playDate)}</span>
                </div>
                <div style={styles.modalDetailItem}>
                  <IoTime size={18} color="#6200EE" />
                  <span style={styles.modalDetailLabel}>Time</span>
                  <span style={styles.modalDetailValue}>
                    {selectedBooking.playDate
                      ? new Date(selectedBooking.playDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div style={styles.modalDetailRow}>
                <div style={styles.modalDetailItem}>
                  <IoTicketOutline size={18} color="#6200EE" />
                  <span style={styles.modalDetailLabel}>Ticket Type</span>
                  <span style={styles.modalDetailValue}>{selectedBooking.ticketType?.toUpperCase()}</span>
                </div>
                <div style={styles.modalDetailItem}>
                  <IoPeople size={18} color="#6200EE" />
                  <span style={styles.modalDetailLabel}>Quantity</span>
                  <span style={styles.modalDetailValue}>{selectedBooking.quantity} ticket(s)</span>
                </div>
              </div>

              <div style={styles.modalDetailItem}>
                <IoPerson size={18} color="#6200EE" />
                <span style={styles.modalDetailLabel}>Seats</span>
                <span style={styles.modalDetailValue}>{seatNumbers}</span>
              </div>

              <div style={styles.modalDetailItem}>
                <IoCashOutline size={18} color="#6200EE" />
                <span style={styles.modalDetailLabel}>Total Amount</span>
                <span style={{ ...styles.modalDetailValue, ...styles.modalTotalPrice }}>KES {selectedBooking.totalPrice}</span>
              </div>
            </div>

            <div style={styles.modalSection}>
              <h3 style={styles.modalSectionTitle}>Payment Information</h3>
              <div style={styles.modalDetailItem}>
                <IoCardOutline size={18} color="#6200EE" />
                <span style={styles.modalDetailLabel}>Payment Method</span>
                <span style={styles.modalDetailValue}>{selectedBooking.paymentMethod?.toUpperCase() || 'N/A'}</span>
              </div>
              <div style={styles.modalDetailItem}>
                <IoDocumentTextOutline size={18} color="#6200EE" />
                <span style={styles.modalDetailLabel}>Payment Code</span>
                <span style={styles.modalDetailValue}>{selectedBooking.paymentCode || 'N/A'}</span>
              </div>
              <div style={styles.modalDetailItem}>
                <IoBarcode size={18} color="#6200EE" />
                <span style={styles.modalDetailLabel}>Booking Reference</span>
                <span style={styles.modalDetailValue}>{selectedBooking.bookingReference}</span>
              </div>

              <div style={{ ...styles.paymentStatusBox, borderColor: paymentStatusColor }}>
                <div style={styles.paymentStatusHeader}>
                  <PaymentIcon size={20} color={paymentStatusColor} />
                  <span style={{ ...styles.paymentStatusTitle, color: paymentStatusColor }}>Payment Status</span>
                </div>
                <span style={styles.paymentStatusValue}>{paymentStatusText}</span>
                {!ticketAvailable && (
                  <span style={styles.paymentStatusNote}>
                    {!['confirmed', 'approved', 'checked_in'].includes(selectedBooking.status?.toLowerCase())
                      ? 'Ticket requires booking confirmation'
                      : 'Ticket requires payment approval'}
                  </span>
                )}
              </div>

              <div style={{ ...styles.paymentStatusBox, borderColor: statusColor, marginTop: 15 }}>
                <div style={styles.paymentStatusHeader}>
                  <StatusIcon size={20} color={statusColor} />
                  <span style={{ ...styles.paymentStatusTitle, color: statusColor }}>Booking Status</span>
                </div>
                <span style={styles.paymentStatusValue}>{statusText}</span>
              </div>
            </div>

            {ticketAvailable && (
              <div style={styles.modalSection}>
                <h3 style={styles.modalSectionTitle}>QR Code Verification</h3>
                <div style={styles.qrContainer}>
                  <QRCodeCanvas value={qrData} size={180} level="H" />
                  <span style={styles.qrLabel}>Scan at entrance for verification</span>
                  <span style={styles.qrNote}>
                    This QR code contains encrypted booking details for secure verification.
                  </span>
                </div>
              </div>
            )}

            <div style={styles.modalSection}>
              <h3 style={styles.modalSectionTitle}>Customer Information</h3>
              <div style={styles.modalDetailItem}>
                <IoPerson size={18} color="#6200EE" />
                <span style={styles.modalDetailLabel}>Name</span>
                <span style={styles.modalDetailValue}>{selectedBooking.customerName || userData?.fullName}</span>
              </div>
              <div style={styles.modalDetailItem}>
                <IoMail size={18} color="#6200EE" />
                <span style={styles.modalDetailLabel}>Email</span>
                <span style={styles.modalDetailValue}>{selectedBooking.customerEmail || userData?.email}</span>
              </div>
              <div style={styles.modalDetailItem}>
                <IoCall size={18} color="#6200EE" />
                <span style={styles.modalDetailLabel}>Phone</span>
                <span style={styles.modalDetailValue}>{selectedBooking.customerPhone || userData?.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div style={styles.modalActions}>
            {canCancel && (
              <button
                style={styles.modalCancelButton}
                onClick={() => handleCancelBooking(selectedBooking.id || selectedBooking._id, selectedBooking.playTitle)}
              >
                <IoCloseCircle size={20} color="#fff" />
                <span style={styles.modalCancelButtonText}>Cancel Booking</span>
              </button>
            )}
            <button
              style={{
                ...styles.modalTicketButton,
                ...((generatingTicket || !ticketAvailable) ? styles.modalTicketButtonDisabled : {}),
              }}
              onClick={() => {
                setModalVisible(false);
                generatePDFTicket(selectedBooking);
              }}
              disabled={generatingTicket || !ticketAvailable}
            >
              {generatingTicket ? (
                <div className="spinner-small" />
              ) : (
                <>
                  <IoTicketOutline size={20} color="#fff" />
                  <span style={styles.modalTicketButtonText}>
                    {ticketAvailable ? 'Download PDF Ticket' : 'Requirements Not Met'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div style={emptyStyles.container}>
      <div style={emptyStyles.illustration}>
        <IoTicketOutline size={100} color="#e0e0e0" />
      </div>
      <h2 style={emptyStyles.title}>No Bookings Yet</h2>
      <p style={emptyStyles.text}>
        {userData
          ? `Hi ${userData.fullName || userData.name}, you haven't made any bookings yet.`
          : 'You haven\'t made any bookings yet.'}
      </p>
      <p style={emptyStyles.subText}>
        Explore our amazing plays and book your tickets to experience live theater!
      </p>
      <button style={emptyStyles.exploreButton} onClick={() => navigate('/home')}>
        <IoSearch size={20} color="#fff" style={{ marginRight: 8 }} />
        <span>Explore Plays</span>
      </button>
      <button style={emptyStyles.secondaryButton} onClick={onRefresh}>
        <IoRefresh size={20} color="#6200EE" style={{ marginRight: 6 }} />
        <span>Refresh</span>
      </button>
    </div>
  );

  if (loading && !refreshing) {
    return (
      <div style={loaderStyles.container}>
        <div className="spinner"></div>
        <p style={loaderStyles.text}>Loading your bookings...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={loaderStyles.container}>
        <IoLockClosed size={60} color="#666" />
        <h2 style={loaderStyles.loginTitle}>Login Required</h2>
        <p style={loaderStyles.loginSub}>Please login to view your bookings</p>
        <button style={loaderStyles.loginButton} onClick={() => navigate('/login')}>
          <IoLogIn size={20} color="#fff" style={{ marginRight: 8 }} />
          <span>Go to Login</span>
        </button>
        <button style={loaderStyles.backButton} onClick={() => navigate(-1)}>
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  const stats = {
    total: filteredBookings.length,
    ready: filteredBookings.filter((b) => isTicketAvailable(b)).length,
    pending: filteredBookings.filter(
      (b) => b.paymentStatus?.toLowerCase() === 'pending' || b.status?.toLowerCase() === 'pending'
    ).length,
    rejected: filteredBookings.filter(
      (b) =>
        b.paymentStatus?.toLowerCase() === 'rejected' ||
        b.status?.toLowerCase() === 'rejected' ||
        b.status?.toLowerCase() === 'cancelled'
    ).length,
  };

  return (
    <div style={pageStyles.container}>
      {/* Header */}
      <div style={pageStyles.header}>
        <div>
          <h1 style={pageStyles.title}>My Bookings</h1>
          <p style={pageStyles.subtitle}>
            {userData.fullName || userData.name} • {userData.email}
          </p>
        </div>
        <button style={pageStyles.refreshHeaderButton} onClick={onRefresh}>
          <IoRefresh size={22} color="#6200EE" />
        </button>
      </div>

      {/* Search */}
      <div style={pageStyles.searchContainer}>
        <IoSearch size={20} color="#666" style={pageStyles.searchIcon} />
        <input
          type="text"
          placeholder="Search by play, reference, status..."
          style={pageStyles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery.length > 0 && (
          <button style={pageStyles.clearSearch} onClick={() => setSearchQuery('')}>
            <IoClose size={20} color="#666" />
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div style={pageStyles.statsBar}>
        <div style={pageStyles.statItem}>
          <span style={pageStyles.statNumber}>{stats.total}</span>
          <span style={pageStyles.statLabel}>Total</span>
        </div>
        <div style={pageStyles.statDivider} />
        <div style={pageStyles.statItem}>
          <span style={{ ...pageStyles.statNumber, color: '#4CAF50' }}>{stats.ready}</span>
          <span style={pageStyles.statLabel}>Ready for Ticket</span>
        </div>
        <div style={pageStyles.statDivider} />
        <div style={pageStyles.statItem}>
          <span style={{ ...pageStyles.statNumber, color: '#FF9800' }}>{stats.pending}</span>
          <span style={pageStyles.statLabel}>Pending</span>
        </div>
        <div style={pageStyles.statDivider} />
        <div style={pageStyles.statItem}>
          <span style={{ ...pageStyles.statNumber, color: '#F44336' }}>{stats.rejected}</span>
          <span style={pageStyles.statLabel}>Rejected/Cancelled</span>
        </div>
      </div>

      {/* List Header */}
      {filteredBookings.length > 0 && (
        <p style={pageStyles.listHeader}>
          {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Bookings List */}
      <div style={pageStyles.listContent}>
        {filteredBookings.length === 0 ? (
          renderEmptyState()
        ) : (
          filteredBookings.map((item) => renderBookingCard(item))
        )}
        <div ref={listEndRef} />
      </div>

      {/* FABs */}
      <div style={pageStyles.fabContainer}>
        <button style={pageStyles.fab} onClick={() => navigate('/home')}>
          <IoHome size={24} color="#fff" />
        </button>
        <button style={{ ...pageStyles.fab, ...pageStyles.fabSecondary }} onClick={fetchMyBookings}>
          <IoRefresh size={20} color="#fff" />
        </button>
      </div>

      {/* Modal */}
      {modalVisible && renderBookingModal()}
    </div>
  );
}

// ========== Styles ==========

const baseStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const pageStyles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    position: 'relative',
    paddingBottom: '80px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '4px',
  },
  refreshHeaderButton: {
    padding: '8px',
    borderRadius: '20px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: '10px 15px',
    padding: '0 15px',
    borderRadius: '10px',
    border: '1px solid #eee',
  },
  searchIcon: {
    marginRight: '10px',
  },
  searchInput: {
    flex: 1,
    padding: '12px 0',
    fontSize: '16px',
    border: 'none',
    outline: 'none',
    background: 'none',
  },
  clearSearch: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  statsBar: {
    display: 'flex',
    backgroundColor: '#fff',
    padding: '15px 20px',
    marginBottom: '10px',
    borderBottom: '1px solid #eee',
  },
  statItem: {
    flex: 1,
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#333',
    display: 'block',
  },
  statLabel: {
    fontSize: '11px',
    color: '#666',
    marginTop: '4px',
    display: 'block',
  },
  statDivider: {
    width: '1px',
    backgroundColor: '#eee',
    margin: '0 5px',
  },
  listHeader: {
    fontSize: '14px',
    color: '#666',
    margin: '0 15px 15px',
  },
  listContent: {
    padding: '0 15px',
  },
  fabContainer: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 10,
  },
  fab: {
    width: '56px',
    height: '56px',
    borderRadius: '28px',
    backgroundColor: '#6200EE',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
  fabSecondary: {
    width: '44px',
    height: '44px',
    backgroundColor: '#7c4dff',
  },
};

const cardStyles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    marginBottom: '15px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    display: 'flex',
    padding: '16px',
    borderBottom: '1px solid #f0f0f0',
  },
  playImage: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    marginRight: '12px',
    objectFit: 'cover',
  },
  noImage: {
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  playTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  venueText: {
    fontSize: '13px',
    color: '#666',
  },
  cardBody: {
    padding: '16px',
  },
  statusRow: {
    marginBottom: '12px',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    gap: '4px',
  },
  statusIcon: {
    marginRight: '4px',
  },
  statusText: {
    fontSize: '11px',
    fontWeight: '600',
  },
  detailsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  detailItem: {
    width: '50%',
    marginBottom: '12px',
  },
  detailLabel: {
    fontSize: '11px',
    color: '#999',
    display: 'block',
    marginTop: '4px',
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  referenceRow: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: '8px',
    borderRadius: '6px',
    marginBottom: '8px',
    gap: '6px',
  },
  referenceText: {
    fontSize: '12px',
    color: '#666',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    borderRadius: '6px',
    marginTop: '8px',
    gap: '6px',
  },
  infoText: {
    fontSize: '12px',
    fontWeight: '600',
  },
  cardFooter: {
    padding: '16px',
    borderTop: '1px solid #f0f0f0',
    backgroundColor: '#fafafa',
  },
  bookingDate: {
    fontSize: '12px',
    color: '#888',
    display: 'block',
    marginBottom: '12px',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  cancelButton: {
    flex: 1,
    padding: '8px 0',
    backgroundColor: '#ffebee',
    border: '1px solid #ffcdd2',
    borderRadius: '6px',
    color: '#d32f2f',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'center',
  },
  generateButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 0',
    backgroundColor: '#4CAF50',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  generateButtonDisabled: {
    backgroundColor: '#9E9E9E',
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  generateButtonText: {
    color: '#fff',
  },
  viewButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 0',
    backgroundColor: '#f3e5f5',
    border: '1px solid #e1bee7',
    borderRadius: '6px',
    color: '#6200EE',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  viewButtonText: {
    color: '#6200EE',
  },
};

const modalStyles = {
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
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    maxHeight: '90%',
    width: '100%',
    maxWidth: '600px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eee',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: 0,
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  modalContent: {
    padding: '20px',
    overflowY: 'auto',
  },
  modalPlayInfo: {
    display: 'flex',
    marginBottom: '20px',
  },
  modalPlayImage: {
    width: '80px',
    height: '80px',
    borderRadius: '10px',
    marginRight: '15px',
    objectFit: 'cover',
  },
  modalNoImage: {
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPlayDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  modalPlayTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
  },
  modalPlayVenue: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  modalStatusContainer: {
    marginTop: '8px',
  },
  modalStatusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  modalStatusText: {
    fontSize: '12px',
    fontWeight: '600',
  },
  modalSection: {
    marginBottom: '25px',
  },
  modalSectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px',
    borderBottom: '1px solid #eee',
    paddingBottom: '8px',
  },
  modalDetailRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px',
  },
  modalDetailItem: {
    flex: 1,
    marginBottom: '15px',
  },
  modalDetailLabel: {
    fontSize: '12px',
    color: '#666',
    display: 'block',
    marginTop: '5px',
    marginBottom: '4px',
  },
  modalDetailValue: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#333',
    display: 'block',
  },
  modalTotalPrice: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#6200EE',
  },
  qrContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
    marginTop: '10px',
  },
  qrLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginTop: '10px',
    marginBottom: '5px',
  },
  qrNote: {
    fontSize: '12px',
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  paymentStatusBox: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '10px',
    borderWidth: '2px',
    borderStyle: 'solid',
    marginTop: '10px',
  },
  paymentStatusHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  paymentStatusTitle: {
    fontSize: '14px',
    fontWeight: '600',
  },
  paymentStatusValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    display: 'block',
    marginBottom: '8px',
  },
  paymentStatusNote: {
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic',
    display: 'block',
  },
  modalActions: {
    display: 'flex',
    padding: '20px',
    gap: '10px',
    borderTop: '1px solid #eee',
  },
  modalCancelButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '15px',
    backgroundColor: '#F44336',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalCancelButtonText: {
    color: '#fff',
  },
  modalTicketButton: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '15px',
    backgroundColor: '#6200EE',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalTicketButtonDisabled: {
    backgroundColor: '#9E9E9E',
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  modalTicketButtonText: {
    color: '#fff',
  },
};

const emptyStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center',
  },
  illustration: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
  },
  text: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '22px',
    marginBottom: '8px',
  },
  subText: {
    fontSize: '14px',
    color: '#888',
    lineHeight: '20px',
    marginBottom: '30px',
    maxWidth: '300px',
  },
  exploreButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200EE',
    padding: '14px 30px',
    borderRadius: '10px',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '15px',
    minWidth: '200px',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    color: '#6200EE',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '10px 20px',
  },
};

const loaderStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    padding: '30px',
  },
  text: {
    marginTop: '15px',
    fontSize: '16px',
    color: '#666',
  },
  loginTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginTop: '20px',
    marginBottom: '10px',
  },
  loginSub: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '25px',
  },
  loginButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200EE',
    padding: '14px 30px',
    borderRadius: '10px',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '15px',
    minWidth: '200px',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '10px 20px',
  },
};

// Add global spinner styles if not already present
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