import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  IoImagesOutline, IoCheckmarkCircle, IoCloseCircle, IoTime, IoHelpCircle,
  IoCardOutline, IoCalendarOutline, IoTicketOutline, IoPersonOutline,
  IoCashOutline, IoDocumentTextOutline, IoInformationCircle, IoChevronForward,
  IoClose, IoPerson, IoMail, IoCall, IoPeople, IoBarcode, IoLockClosed,
  IoLogIn, IoSearch, IoRefresh, IoHome, IoEyeOutline,
} from 'react-icons/io5';
import { QRCodeCanvas } from 'qrcode.react';

const API_BASE_URL = 'http://localhost:5000';

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
  const listEndRef = useRef(null);

  // Toast state
  const [toasts, setToasts] = useState([]);
  const showToast = (msg, type = 'info', dur = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), dur);
  };
  const removeToast = id => setToasts(p => p.filter(t => t.id !== id));

  // Confirm modal state
  const [confirm, setConfirm] = useState({ show: false, msg: '', onConfirm: null });

  useEffect(() => { fetchUserData(); }, []);
  useEffect(() => { if (userData) fetchMyBookings(); }, [userData]);
  useEffect(() => {
    if (!searchQuery.trim()) setFilteredBookings(bookings);
    else setFilteredBookings(bookings.filter(b =>
      b.playTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.paymentStatus?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.status?.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [searchQuery, bookings]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });
        setUserData(res.data);
      } else {
        showToast('Login required to view bookings', 'warning');
        navigate('/login');
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        showToast('Session expired. Please login again.', 'warning');
        navigate('/login');
      }
    }
  };

  const fetchPlayDetails = async playId => {
    if (!playId) return null;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/plays/${playId}`);
      return res.data.success ? res.data.play : null;
    } catch { return null; }
  };

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      if (!userData) {
        const userRes = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });
        setUserData(userRes.data);
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/api/bookings/my-bookings`, {
          params: { email: userData?.email },
        });
        if (res.data.success) {
          let bks = res.data.bookings || [];
          const withDetails = await Promise.all(bks.map(async b => {
            if (b.playId && !b.play) {
              const play = await fetchPlayDetails(b.playId);
              if (play) b.play = play;
              else b.play = { title: b.playTitle, venue: 'Main Theater', image: null };
            }
            return b;
          }));
          setBookings(withDetails);
          setFilteredBookings(withDetails);
        }
      } catch (mainErr) {
        console.log(mainErr.message);
        try {
          const testRes = await axios.get(`${API_BASE_URL}/api/bookings/test/user-bookings`);
          if (testRes.data.success) {
            let userBookings = testRes.data.bookings.filter(b => b.customerEmail === userData?.email);
            const withDetails = await Promise.all(userBookings.map(async b => {
              if (b.playId && !b.play) {
                const play = await fetchPlayDetails(b.playId);
                if (play) b.play = play;
                else b.play = { title: b.playTitle, venue: 'Main Theater', image: null };
              }
              return b;
            }));
            setBookings(withDetails);
            setFilteredBookings(withDetails);
          }
        } catch (testErr) {
          showToast('Failed to load bookings. Please try again.', 'error');
        }
      }
    } catch (error) {
      showToast(error.message === 'Network Error' ? 'Cannot connect to server.' : 'Failed to load bookings.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchMyBookings(); };
  const formatDate = d => d ? new Date(d).toLocaleDateString('en-US', { weekday:'short', year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : 'Date not set';
  const formatShortDate = d => d ? new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '';
  const getStatusColor = s => {
    if (!s) return '#757575';
    const l = s.toLowerCase();
    if (['approved','confirmed','checked_in'].includes(l)) return '#4CAF50';
    if (['rejected','cancelled'].includes(l)) return '#F44336';
    if (l==='pending') return '#FF9800';
    return '#757575';
  };
  const getPaymentStatusColor = p => {
    if (!p) return '#757575';
    const l = p.toLowerCase();
    if (l==='approved') return '#4CAF50';
    if (l==='rejected') return '#F44336';
    if (l==='pending') return '#FF9800';
    return '#757575';
  };
  const getStatusText = s => s ? s.toUpperCase() : 'UNKNOWN';
  const getPaymentStatusText = p => p ? p.toUpperCase() : 'PENDING';
  const getStatusIcon = s => {
    if (!s) return IoHelpCircle;
    const l = s.toLowerCase();
    if (['approved','confirmed','checked_in'].includes(l)) return IoCheckmarkCircle;
    if (['rejected','cancelled'].includes(l)) return IoCloseCircle;
    if (l==='pending') return IoTime;
    return IoHelpCircle;
  };
  const getPaymentStatusIcon = p => {
    if (!p) return IoCardOutline;
    const l = p.toLowerCase();
    if (l==='approved') return IoCheckmarkCircle;
    if (l==='rejected') return IoCloseCircle;
    if (l==='pending') return IoTime;
    return IoCardOutline;
  };
  const getSeatNumbers = seats => {
    if (!Array.isArray(seats) || !seats.length) return 'Not assigned';
    try {
      if (typeof seats[0] === 'string') return seats.join(', ');
      if (typeof seats[0] === 'object') return seats.map(s => s.number || s.seatNumber || 'N/A').join(', ');
      return seats.join(', ');
    } catch { return 'Not assigned'; }
  };
  const isTicketAvailable = b => b.paymentStatus?.toLowerCase() === 'approved' && ['approved','confirmed','checked_in'].includes(b.status?.toLowerCase());

  const handleCancelBooking = (id, title) => {
    setConfirm({
      show: true,
      msg: `Are you sure you want to cancel your booking for "${title}"?`,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.put(`${API_BASE_URL}/api/bookings/${id}/cancel`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            showToast('Booking cancelled successfully', 'success');
            fetchMyBookings();
            setModalVisible(false);
          }
        } catch (error) {
          showToast(error.response?.data?.msg || 'Failed to cancel booking', 'error');
        }
      }
    });
  };

  const handleViewDetails = b => { setSelectedBooking(b); setModalVisible(true); };

  const generateQRCodeData = b => JSON.stringify({
    bookingId: b.id || b._id, reference: b.bookingReference, customer: b.customerName || userData?.fullName,
    email: b.customerEmail || userData?.email, play: b.playTitle, date: b.playDate,
    seats: getSeatNumbers(b.allocatedSeats), quantity: b.quantity, ticketType: b.ticketType,
    amount: b.totalPrice, status: b.status, paymentStatus: b.paymentStatus,
    timestamp: new Date().toISOString(), type: 'THEATER_TICKET_VERIFICATION'
  });

  const generatePDFTicket = async b => {
    if (!isTicketAvailable(b)) {
      showToast('Ticket requires booking confirmed AND payment approved.', 'warning');
      return;
    }
    try {
      setGeneratingTicket(true);
      const play = b.play || {};
      const seatNumbers = getSeatNumbers(b.allocatedSeats);
      const eventDate = b.playDate ? new Date(b.playDate) : new Date();
      const qrData = generateQRCodeData(b);
      const venue = play.venue || b.venue || 'Main Theater';
      const win = window.open('', '_blank');
      win.document.write(`
        <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Ticket - ${b.playTitle}</title>
        <style>@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Poppins',sans-serif; }
        body { background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); min-height:100vh; display:flex; justify-content:center; align-items:center; padding:20px; }
        .ticket-container { width:100%; max-width:800px; perspective:1000px; }
        .ticket { background:white; border-radius:20px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.3); position:relative; }
        .ticket-header { background:linear-gradient(135deg,#6200EE 0%,#3700B3 100%); padding:30px; text-align:center; color:white; position:relative; overflow:hidden; }
        .ticket-header::before { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:radial-gradient(circle,rgba(255,255,255,0.1) 1px,transparent 1px); background-size:20px 20px; transform:rotate(45deg); }
        .ticket-title { font-size:36px; font-weight:700; margin-bottom:10px; letter-spacing:2px; position:relative; z-index:2; }
        .ticket-subtitle { font-size:16px; opacity:0.9; letter-spacing:1px; position:relative; z-index:2; }
        .status-badge { display:inline-block; background:rgba(255,255,255,0.2); padding:8px 20px; border-radius:25px; margin-top:15px; font-size:14px; font-weight:600; letter-spacing:1px; backdrop-filter:blur(10px); position:relative; z-index:2; }
        .ticket-body { padding:40px; }
        .play-info { text-align:center; margin-bottom:30px; border-bottom:2px dashed #e0e0e0; padding-bottom:30px; }
        .play-title { font-size:28px; font-weight:700; color:#333; margin-bottom:10px; line-height:1.3; }
        .play-venue { font-size:18px; color:#666; margin-bottom:20px; }
        .event-details { display:flex; justify-content:center; gap:30px; margin-bottom:20px; flex-wrap:wrap; }
        .event-detail { display:flex; align-items:center; gap:10px; font-size:16px; color:#555; }
        .detail-icon { font-size:20px; color:#6200EE; }
        .ticket-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:25px; margin-bottom:30px; background:linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%); padding:30px; border-radius:15px; }
        .grid-item { text-align:center; }
        .grid-label { font-size:14px; color:#666; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px; }
        .grid-value { font-size:24px; font-weight:700; color:#333; }
        .ticket-value { color:#6200EE; }
        .ticket-type { color:#00C853; }
        .customer-info { background:#f8f9fa; padding:25px; border-radius:15px; margin-bottom:30px; }
        .customer-title { font-size:18px; font-weight:600; color:#333; margin-bottom:15px; border-bottom:2px solid #e0e0e0; padding-bottom:10px; }
        .customer-details { display:grid; grid-template-columns:repeat(2,1fr); gap:15px; }
        .customer-detail { display:flex; align-items:center; gap:10px; font-size:15px; color:#555; }
        .reference-container { background:linear-gradient(135deg,#6200EE 0%,#3700B3 100%); padding:25px; border-radius:15px; text-align:center; margin-bottom:30px; color:white; }
        .reference-label { font-size:14px; opacity:0.9; margin-bottom:10px; letter-spacing:1px; }
        .reference-value { font-size:28px; font-weight:700; letter-spacing:2px; margin-bottom:10px; font-family:monospace; }
        .reference-note { font-size:14px; opacity:0.8; font-style:italic; }
        .verification-section { display:flex; align-items:center; justify-content:space-between; background:white; border:2px solid #e0e0e0; border-radius:15px; padding:20px; margin-bottom:30px; }
        .verification-info { flex:1; }
        .verification-title { font-size:16px; font-weight:600; color:#333; margin-bottom:8px; }
        .verification-text { font-size:14px; color:#666; line-height:1.5; }
        .qrcode-container { display:flex; flex-direction:column; align-items:center; }
        .qrcode-label { font-size:12px; color:#666; margin-top:8px; text-align:center; }
        .ticket-footer { text-align:center; padding-top:20px; border-top:2px dashed #e0e0e0; color:#666; font-size:14px; }
        .footer-text { margin-bottom:8px; }
        .watermark { position:absolute; bottom:20px; right:20px; font-size:12px; color:rgba(0,0,0,0.1); transform:rotate(-45deg); user-select:none; }
        @media print { body { background:white !important; } .ticket { box-shadow:none !important; border:1px solid #ddd !important; } }
        </style></head><body><div class="ticket-container"><div class="ticket">
        <div class="ticket-header"><h1 class="ticket-title">THEATER TICKET</h1><p class="ticket-subtitle">OFFICIAL ADMISSION PASS • SCAN TO VERIFY</p><div class="status-badge">BOOKING CONFIRMED • PAYMENT APPROVED • VALID FOR ENTRY</div></div>
        <div class="ticket-body"><div class="play-info"><h2 class="play-title">${b.playTitle}</h2><p class="play-venue">${venue}</p><div class="event-details"><div class="event-detail"><span class="detail-icon">📅</span><span>${eventDate.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span></div><div class="event-detail"><span class="detail-icon">⏰</span><span>${eventDate.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</span></div></div></div>
        <div class="ticket-grid"><div class="grid-item"><div class="grid-label">Ticket Type</div><div class="grid-value ticket-type">${b.ticketType?.toUpperCase()}</div></div><div class="grid-item"><div class="grid-label">Quantity</div><div class="grid-value">${b.quantity}</div></div><div class="grid-item"><div class="grid-label">Seat(s)</div><div class="grid-value">${seatNumbers}</div></div><div class="grid-item"><div class="grid-label">Total Amount</div><div class="grid-value ticket-value">KES ${b.totalPrice}</div></div></div>
        <div class="customer-info"><div class="customer-title">Customer Information</div><div class="customer-details"><div class="customer-detail"><span>👤</span><span>${b.customerName||userData?.fullName}</span></div><div class="customer-detail"><span>📧</span><span>${b.customerEmail||userData?.email}</span></div><div class="customer-detail"><span>📱</span><span>${b.customerPhone||userData?.phone||'N/A'}</span></div><div class="customer-detail"><span>📅</span><span>Booked: ${new Date(b.createdAt||b.bookingDate).toLocaleDateString()}</span></div></div></div>
        <div class="reference-container"><div class="reference-label">BOOKING REFERENCE</div><div class="reference-value">${b.bookingReference}</div><div class="reference-note">Scan QR code below for verification</div></div>
        <div class="verification-section"><div class="verification-info"><div class="verification-title">VERIFICATION QR CODE</div><div class="verification-text">Scan this QR code at the entrance gate for ticket validation.</div></div><div class="qrcode-container"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}" alt="QR Code" width="150" height="150" /><div class="qrcode-label">SCAN TO VERIFY</div></div></div>
        <div class="ticket-footer"><div class="footer-text">Theater Booking System • Official Ticket</div></div><div class="watermark">OFFICIAL TICKET</div></div></div></div></body></html>
      `);
      win.document.close();
      win.focus();
      win.print();
      showToast('Ticket opened in new window. Use print to save as PDF.', 'info');
    } catch (error) {
      showToast('Failed to generate ticket. Please try again.', 'error');
    } finally { setGeneratingTicket(false); }
  };

  const ToastContainer = () => (
    <div style={toastStyles.container}>
      {toasts.map(t => (
        <div key={t.id} style={{...toastStyles.toast, ...toastStyles[t.type]}}>
          <span>{t.msg}</span>
          <button onClick={() => removeToast(t.id)} style={toastStyles.close}>✕</button>
        </div>
      ))}
    </div>
  );

  const ConfirmModal = () => confirm.show && (
    <div style={modalStyles.overlay} onClick={() => setConfirm({...confirm, show: false})}>
      <div style={modalStyles.confirm.modal} onClick={e => e.stopPropagation()}>
        <h3>Confirm Action</h3>
        <p>{confirm.msg}</p>
        <div style={modalStyles.confirm.buttons}>
          <button style={modalStyles.confirm.cancelBtn} onClick={() => setConfirm({...confirm, show: false})}>Cancel</button>
          <button style={modalStyles.confirm.confirmBtn} onClick={() => { confirm.onConfirm(); setConfirm({...confirm, show: false}); }}>Confirm</button>
        </div>
      </div>
    </div>
  );

  if (loading && !refreshing) return (
    <div style={loaderStyles.container}>
      <div className="spinner"></div>
      <p style={loaderStyles.text}>Loading your bookings...</p>
    </div>
  );
  if (!userData) return (
    <div style={loaderStyles.container}>
      <IoLockClosed size={60} color="#666" />
      <h2 style={loaderStyles.loginTitle}>Login Required</h2>
      <p style={loaderStyles.loginSub}>Please login to view your bookings</p>
      <button style={loaderStyles.loginButton} onClick={()=>navigate('/login')}><IoLogIn size={20} color="#fff" style={{marginRight:8}}/><span>Go to Login</span></button>
      <button style={loaderStyles.backButton} onClick={()=>navigate(-1)}><span>Go Back</span></button>
    </div>
  );

  const stats = {
    total: filteredBookings.length,
    ready: filteredBookings.filter(b=>isTicketAvailable(b)).length,
    pending: filteredBookings.filter(b=>b.paymentStatus?.toLowerCase()==='pending'||b.status?.toLowerCase()==='pending').length,
    rejected: filteredBookings.filter(b=>b.paymentStatus?.toLowerCase()==='rejected'||b.status?.toLowerCase()==='rejected'||b.status?.toLowerCase()==='cancelled').length,
  };

  return (
    <div style={pageStyles.container}>
      <ToastContainer /><ConfirmModal />
      <div style={pageStyles.header}>
        <div><h1 style={pageStyles.title}>My Bookings</h1><p style={pageStyles.subtitle}>{userData.fullName||userData.name} • {userData.email}</p></div>
        <button style={pageStyles.refreshHeaderButton} onClick={onRefresh}><IoRefresh size={22} color="#6200EE" /></button>
      </div>
      <div style={pageStyles.searchContainer}>
        <IoSearch size={20} color="#666" style={pageStyles.searchIcon} />
        <input type="text" placeholder="Search by play, reference, status..." style={pageStyles.searchInput} value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
        {searchQuery && <button style={pageStyles.clearSearch} onClick={()=>setSearchQuery('')}><IoClose size={20} color="#666" /></button>}
      </div>
      <div style={pageStyles.statsBar}>
        {['Total', 'Ready', 'Pending', 'Rejected'].map((label,i)=>(
          <React.Fragment key={label}>
            {i>0 && <div style={pageStyles.statDivider} />}
            <div style={pageStyles.statItem}>
              <span style={{...pageStyles.statNumber, color: i===1?'#4CAF50':i===2?'#FF9800':i===3?'#F44336':'#333'}}>
                {[stats.total, stats.ready, stats.pending, stats.rejected][i]}
              </span>
              <span style={pageStyles.statLabel}>{label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
      {filteredBookings.length>0 && <p style={pageStyles.listHeader}>{filteredBookings.length} booking{filteredBookings.length!==1?'s':''} found</p>}
      <div style={pageStyles.listContent}>
        {filteredBookings.length===0 ? (
          <div style={emptyStyles.container}>
            <IoTicketOutline size={100} color="#e0e0e0" />
            <h2 style={emptyStyles.title}>No Bookings Yet</h2>
            <p style={emptyStyles.text}>{userData ? `Hi ${userData.fullName||userData.name}, you haven't made any bookings yet.` : 'You haven\'t made any bookings yet.'}</p>
            <p style={emptyStyles.subText}>Explore our amazing plays and book your tickets to experience live theater!</p>
            <button style={emptyStyles.exploreButton} onClick={()=>navigate('/home')}><IoSearch size={20} color="#fff" style={{marginRight:8}}/><span>Explore Plays</span></button>
            <button style={emptyStyles.secondaryButton} onClick={onRefresh}><IoRefresh size={20} color="#6200EE" style={{marginRight:6}}/><span>Refresh</span></button>
          </div>
        ) : (
          filteredBookings.map(b=>{
            const playImg = b.play?.image ? `${API_BASE_URL}${b.play.image.startsWith('/')?'':'/'}${b.play.image}` : null;
            const isUp = b.playDate ? new Date(b.playDate) > new Date() : false;
            const avail = isTicketAvailable(b);
            const statusColor = getStatusColor(b.status);
            const StatusIcon = getStatusIcon(b.status);
            const statusTxt = getStatusText(b.status);
            const payColor = getPaymentStatusColor(b.paymentStatus);
            const PayIcon = getPaymentStatusIcon(b.paymentStatus);
            const payTxt = getPaymentStatusText(b.paymentStatus);
            return (
              <div key={b.id||b._id} style={cardStyles.card}>
                <div style={cardStyles.cardHeader}>
                  {playImg ? <img src={playImg} alt={b.playTitle} style={cardStyles.playImage} /> : <div style={{...cardStyles.playImage,...cardStyles.noImage}}><IoImagesOutline size={24} color="#666" /></div>}
                  <div style={cardStyles.playInfo}><div style={cardStyles.playTitle}>{b.playTitle||b.play?.title}</div><div style={cardStyles.venueText}>{b.play?.venue||b.venue||'Main Theater'}</div></div>
                </div>
                <div style={cardStyles.cardBody}>
                  <div style={cardStyles.statusRow}>
                    <div style={{...cardStyles.statusBadge, backgroundColor:statusColor+'20'}}><StatusIcon size={14} color={statusColor} style={cardStyles.statusIcon} /><span style={{...cardStyles.statusText, color:statusColor}}>Booking: {statusTxt}</span></div>
                    <div style={{...cardStyles.statusBadge, backgroundColor:payColor+'20', marginTop:6}}><PayIcon size={14} color={payColor} style={cardStyles.statusIcon} /><span style={{...cardStyles.statusText, color:payColor}}>Payment: {payTxt}</span></div>
                  </div>
                  <div style={cardStyles.detailsGrid}>
                    {[{icon:IoCalendarOutline, label:'Event Date', val:formatShortDate(b.playDate)},{icon:IoTicketOutline, label:'Tickets', val:`${b.quantity} × ${(b.ticketType||'REGULAR').toUpperCase()}`},{icon:IoPersonOutline, label:'Seats', val:getSeatNumbers(b.allocatedSeats).substring(0,20)+(getSeatNumbers(b.allocatedSeats).length>20?'...':'')},{icon:IoCashOutline, label:'Total', val:`KES ${b.totalPrice||0}`}].map((d,i)=>(
                      <div key={i} style={cardStyles.detailItem}><d.icon size={16} color="#666" /><span style={cardStyles.detailLabel}>{d.label}</span><span style={cardStyles.detailValue}>{d.val}</span></div>
                    ))}
                  </div>
                  {b.bookingReference && <div style={cardStyles.referenceRow}><IoDocumentTextOutline size={14} color="#666" /><span style={cardStyles.referenceText}>Ref: {b.bookingReference}</span></div>}
                  {!avail && <div style={{...cardStyles.infoRow, backgroundColor:'#FFF3E0'}}><IoInformationCircle size={14} color="#FF9800" /><span style={{...cardStyles.infoText, color:'#E65100'}}>{!['confirmed','approved','checked_in'].includes(b.status?.toLowerCase())?'Booking not confirmed':'Payment pending approval'}</span></div>}
                  {b.status?.toLowerCase()==='checked_in' && <div style={{...cardStyles.infoRow, backgroundColor:'#E8F5E9'}}><IoCheckmarkCircle size={14} color="#4CAF50" /><span style={{...cardStyles.infoText, color:'#2E7D32'}}>✓ Checked in on {b.checkInTime?formatShortDate(b.checkInTime):'event date'}</span></div>}
                </div>
                <div style={cardStyles.cardFooter}>
                  <span style={cardStyles.bookingDate}>Booked on {new Date(b.bookingDate||b.createdAt).toLocaleDateString()}</span>
                  <div style={cardStyles.actionButtons}>
                    {isUp && ['pending','approved','confirmed'].includes(b.status?.toLowerCase()) && <button style={cardStyles.cancelButton} onClick={()=>handleCancelBooking(b.id||b._id, b.playTitle)}>Cancel</button>}
                    <button style={{...cardStyles.generateButton, ...((generatingTicket||!avail)&&cardStyles.generateButtonDisabled)}} onClick={()=>generatePDFTicket(b)} disabled={generatingTicket||!avail}>
                      {generatingTicket ? <div className="spinner-small" /> : <><IoTicketOutline size={16} color="#fff" /><span style={cardStyles.generateButtonText}>{avail?'Get Ticket':'Not Ready'}</span></>}
                    </button>
                    <button style={cardStyles.viewButton} onClick={()=>handleViewDetails(b)}><span style={cardStyles.viewButtonText}>Details</span><IoChevronForward size={16} color="#6200EE" /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={listEndRef} />
      </div>
      <div style={pageStyles.fabContainer}>
        <button style={pageStyles.fab} onClick={()=>navigate('/home')}><IoHome size={24} color="#fff" /></button>
        <button style={{...pageStyles.fab, ...pageStyles.fabSecondary}} onClick={fetchMyBookings}><IoRefresh size={20} color="#fff" /></button>
      </div>
      {modalVisible && selectedBooking && (
        <div style={modalStyles.overlay} onClick={()=>setModalVisible(false)}>
          <div style={modalStyles.container} onClick={e=>e.stopPropagation()}>
            <div style={modalStyles.header}><h2 style={modalStyles.title}>Booking Details</h2><button style={modalStyles.close} onClick={()=>setModalVisible(false)}><IoClose size={24} color="#666" /></button></div>
            <div style={modalStyles.content}>
              <div style={modalStyles.playInfo}>
                {selectedBooking.play?.image ? <img src={`${API_BASE_URL}${selectedBooking.play.image.startsWith('/')?'':'/'}${selectedBooking.play.image}`} alt={selectedBooking.playTitle} style={modalStyles.playImg} /> : <div style={{...modalStyles.playImg, ...modalStyles.noImg}}><IoImagesOutline size={40} color="#666" /></div>}
                <div style={modalStyles.playDetails}><div style={modalStyles.playTitle}>{selectedBooking.playTitle}</div><div style={modalStyles.playVenue}>{selectedBooking.play?.venue||selectedBooking.venue||'Main Theater'}</div>
                  <div style={modalStyles.statusContainer}>
                    <div style={{...modalStyles.statusBadge, backgroundColor:getStatusColor(selectedBooking.status)+'20', marginBottom:6}}><span style={{color:getStatusColor(selectedBooking.status)}}>Booking: {getStatusText(selectedBooking.status)}</span></div>
                    <div style={{...modalStyles.statusBadge, backgroundColor:getPaymentStatusColor(selectedBooking.paymentStatus)+'20'}}><span style={{color:getPaymentStatusColor(selectedBooking.paymentStatus)}}>Payment: {getPaymentStatusText(selectedBooking.paymentStatus)}</span></div>
                  </div>
                </div>
              </div>
              {[ 
                {icon:IoCalendarOutline, label:'Event Date', val:formatDate(selectedBooking.playDate)},
                {icon:IoTime, label:'Time', val:selectedBooking.playDate?new Date(selectedBooking.playDate).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}):'N/A'},
                {icon:IoTicketOutline, label:'Ticket Type', val:selectedBooking.ticketType?.toUpperCase()},
                {icon:IoPeople, label:'Quantity', val:`${selectedBooking.quantity} ticket(s)`},
                {icon:IoPerson, label:'Seats', val:getSeatNumbers(selectedBooking.allocatedSeats)},
                {icon:IoCashOutline, label:'Total', val:<span style={{...modalStyles.value, ...modalStyles.total}}>KES {selectedBooking.totalPrice}</span>},
                {icon:IoCardOutline, label:'Payment Method', val:selectedBooking.paymentMethod?.toUpperCase()||'N/A'},
                {icon:IoDocumentTextOutline, label:'Payment Code', val:selectedBooking.paymentCode||'N/A'},
                {icon:IoBarcode, label:'Booking Reference', val:selectedBooking.bookingReference},
              ].map((item,i)=>(
                <div key={i} style={modalStyles.detailItem}><item.icon size={18} color="#6200EE" /><span style={modalStyles.label}>{item.label}</span>{typeof item.val==='string'?<span style={modalStyles.value}>{item.val}</span>:item.val}</div>
              ))}
              {isTicketAvailable(selectedBooking) && (
                <div style={modalStyles.qr}><QRCodeCanvas value={generateQRCodeData(selectedBooking)} size={180} level="H" /><span style={modalStyles.qrLabel}>Scan at entrance</span></div>
              )}
            </div>
            <div style={modalStyles.actions}>
              {['pending','approved','confirmed'].includes(selectedBooking.status?.toLowerCase()) && new Date(selectedBooking.playDate) > new Date() && (
                <button style={modalStyles.cancelBtn} onClick={()=>handleCancelBooking(selectedBooking.id||selectedBooking._id, selectedBooking.playTitle)}><IoCloseCircle size={20} color="#fff" /><span>Cancel</span></button>
              )}
              <button style={{...modalStyles.ticketBtn, ...((generatingTicket||!isTicketAvailable(selectedBooking))&&modalStyles.ticketBtnDisabled)}} onClick={()=>{setModalVisible(false); generatePDFTicket(selectedBooking);}} disabled={generatingTicket||!isTicketAvailable(selectedBooking)}>
                {generatingTicket ? <div className="spinner-small" /> : <><IoTicketOutline size={20} color="#fff" /><span>{isTicketAvailable(selectedBooking)?'Download PDF Ticket':'Not Available'}</span></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== STYLES ==========
const pageStyles = {
  container: { minHeight:'100vh', backgroundColor:'#f8f9fa', fontFamily:'system-ui', paddingBottom:80 },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:20, backgroundColor:'#fff', borderBottom:'1px solid #eee' },
  title: { fontSize:28, fontWeight:'bold', color:'#1a1a1a', margin:0 },
  subtitle: { fontSize:14, color:'#666', marginTop:4 },
  refreshHeaderButton: { padding:8, borderRadius:20, backgroundColor:'#f0f0f0', border:'none', cursor:'pointer', display:'flex' },
  searchContainer: { display:'flex', alignItems:'center', backgroundColor:'#fff', margin:'10px 15px', padding:'0 15px', borderRadius:10, border:'1px solid #eee' },
  searchIcon: { marginRight:10 },
  searchInput: { flex:1, padding:12, fontSize:16, border:'none', outline:'none', background:'none' },
  clearSearch: { background:'none', border:'none', cursor:'pointer', display:'flex' },
  statsBar: { display:'flex', backgroundColor:'#fff', padding:'15px 20px', marginBottom:10, borderBottom:'1px solid #eee' },
  statItem: { flex:1, textAlign:'center' },
  statNumber: { fontSize:22, fontWeight:'bold', color:'#333', display:'block' },
  statLabel: { fontSize:11, color:'#666', marginTop:4, display:'block' },
  statDivider: { width:1, backgroundColor:'#eee', margin:'0 5px' },
  listHeader: { fontSize:14, color:'#666', margin:'0 15px 15px' },
  listContent: { padding:'0 15px' },
  fabContainer: { position:'fixed', bottom:20, right:20, display:'flex', flexDirection:'column', gap:10, zIndex:10 },
  fab: { width:56, height:56, borderRadius:28, backgroundColor:'#6200EE', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 8px rgba(0,0,0,0.3)' },
  fabSecondary: { width:44, height:44, backgroundColor:'#7c4dff' },
};

const cardStyles = {
  card: { backgroundColor:'#fff', borderRadius:12, marginBottom:15, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' },
  cardHeader: { display:'flex', padding:16, borderBottom:'1px solid #f0f0f0' },
  playImage: { width:60, height:60, borderRadius:8, marginRight:12, objectFit:'cover' },
  noImage: { backgroundColor:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center' },
  playInfo: { flex:1, display:'flex', flexDirection:'column', justifyContent:'center' },
  playTitle: { fontSize:16, fontWeight:600, color:'#333', marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  venueText: { fontSize:13, color:'#666' },
  cardBody: { padding:16 },
  statusRow: { marginBottom:12 },
  statusBadge: { display:'inline-flex', alignItems:'center', padding:'4px 8px', borderRadius:12, fontSize:11, fontWeight:600, gap:4 },
  statusIcon: { marginRight:4 },
  statusText: { fontSize:11, fontWeight:600 },
  detailsGrid: { display:'flex', flexWrap:'wrap', marginBottom:12 },
  detailItem: { width:'50%', marginBottom:12 },
  detailLabel: { fontSize:11, color:'#999', display:'block', marginTop:4 },
  detailValue: { fontSize:14, fontWeight:500, color:'#333', display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  referenceRow: { display:'flex', alignItems:'center', backgroundColor:'#f8f9fa', padding:8, borderRadius:6, marginBottom:8, gap:6 },
  referenceText: { fontSize:12, color:'#666' },
  infoRow: { display:'flex', alignItems:'center', padding:8, borderRadius:6, marginTop:8, gap:6 },
  infoText: { fontSize:12, fontWeight:600 },
  cardFooter: { padding:16, borderTop:'1px solid #f0f0f0', backgroundColor:'#fafafa' },
  bookingDate: { fontSize:12, color:'#888', display:'block', marginBottom:12 },
  actionButtons: { display:'flex', gap:10 },
  cancelButton: { flex:1, padding:'8px 0', backgroundColor:'#ffebee', border:'1px solid #ffcdd2', borderRadius:6, color:'#d32f2f', fontSize:14, fontWeight:500, cursor:'pointer', textAlign:'center' },
  generateButton: { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 0', backgroundColor:'#4CAF50', border:'none', borderRadius:6, color:'#fff', fontSize:14, fontWeight:500, cursor:'pointer' },
  generateButtonDisabled: { backgroundColor:'#9E9E9E', opacity:0.7, cursor:'not-allowed' },
  generateButtonText: { color:'#fff' },
  viewButton: { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 0', backgroundColor:'#f3e5f5', border:'1px solid #e1bee7', borderRadius:6, color:'#6200EE', fontSize:14, fontWeight:500, cursor:'pointer' },
  viewButtonText: { color:'#6200EE' },
};

const modalStyles = {
  overlay: { position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:1000 },
  container: { backgroundColor:'#fff', borderTopLeftRadius:20, borderTopRightRadius:20, maxHeight:'90%', width:'100%', maxWidth:600, overflow:'hidden', display:'flex', flexDirection:'column' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:20, borderBottom:'1px solid #eee' },
  title: { fontSize:20, fontWeight:'bold', color:'#1a1a1a', margin:0 },
  close: { background:'none', border:'none', cursor:'pointer', padding:4 },
  content: { padding:20, overflowY:'auto' },
  playInfo: { display:'flex', marginBottom:20 },
  playImg: { width:80, height:80, borderRadius:10, marginRight:15, objectFit:'cover' },
  noImg: { backgroundColor:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center' },
  playDetails: { flex:1, display:'flex', flexDirection:'column', justifyContent:'center' },
  playTitle: { fontSize:18, fontWeight:'bold', color:'#333', marginBottom:5 },
  playVenue: { fontSize:14, color:'#666', marginBottom:8 },
  statusContainer: { marginTop:8 },
  statusBadge: { display:'inline-block', padding:'4px 10px', borderRadius:12, fontSize:12, fontWeight:600 },
  detailItem: { marginBottom:15 },
  label: { fontSize:12, color:'#666', display:'block', marginTop:5 },
  value: { fontSize:15, fontWeight:500, color:'#333', display:'block' },
  total: { fontSize:18, fontWeight:'bold', color:'#6200EE' },
  qr: { display:'flex', flexDirection:'column', alignItems:'center', backgroundColor:'#f8f9fa', padding:20, borderRadius:10, marginTop:10 },
  qrLabel: { fontSize:14, fontWeight:600, color:'#333', marginTop:10 },
  actions: { display:'flex', padding:20, gap:10, borderTop:'1px solid #eee' },
  cancelBtn: { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:15, backgroundColor:'#F44336', border:'none', borderRadius:10, color:'#fff', fontSize:16, fontWeight:600, cursor:'pointer' },
  ticketBtn: { flex:2, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:15, backgroundColor:'#6200EE', border:'none', borderRadius:10, color:'#fff', fontSize:16, fontWeight:600, cursor:'pointer' },
  ticketBtnDisabled: { backgroundColor:'#9E9E9E', opacity:0.7, cursor:'not-allowed' },
  // Confirmation modal nested styles
  confirm: {
    modal: { backgroundColor:'#fff', borderRadius:12, padding:24, maxWidth:400, width:'90%', margin:'auto', boxShadow:'0 8px 24px rgba(0,0,0,0.2)' },
    buttons: { display:'flex', justifyContent:'space-between', gap:12, marginTop:20 },
    cancelBtn: { flex:1, padding:12, borderRadius:8, border:'1px solid #ddd', backgroundColor:'#f5f5f5', fontSize:16, fontWeight:500, cursor:'pointer' },
    confirmBtn: { flex:1, padding:12, borderRadius:8, border:'none', backgroundColor:'#6200EE', color:'#fff', fontSize:16, fontWeight:500, cursor:'pointer' },
  },
};

const emptyStyles = {
  container: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, textAlign:'center' },
  title: { fontSize:24, fontWeight:'bold', color:'#333', marginBottom:12 },
  text: { fontSize:16, color:'#666', lineHeight:22, marginBottom:8 },
  subText: { fontSize:14, color:'#888', lineHeight:20, marginBottom:30, maxWidth:300 },
  exploreButton: { display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#6200EE', padding:'14px 30px', borderRadius:10, border:'none', color:'#fff', fontSize:16, fontWeight:600, cursor:'pointer', marginBottom:15, minWidth:200 },
  secondaryButton: { display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', color:'#6200EE', fontSize:14, fontWeight:500, cursor:'pointer', padding:'10px 20px' },
};

const loaderStyles = {
  container: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', textAlign:'center', padding:30 },
  text: { marginTop:15, fontSize:16, color:'#666' },
  loginTitle: { fontSize:24, fontWeight:'bold', color:'#333', marginTop:20, marginBottom:10 },
  loginSub: { fontSize:16, color:'#666', marginBottom:25 },
  loginButton: { display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#6200EE', padding:'14px 30px', borderRadius:10, border:'none', color:'#fff', fontSize:16, fontWeight:600, cursor:'pointer', marginBottom:15, minWidth:200 },
  backButton: { background:'none', border:'none', color:'#666', fontSize:14, cursor:'pointer', padding:'10px 20px' },
};

const toastStyles = {
  container: { position:'fixed', top:20, right:20, zIndex:2000, display:'flex', flexDirection:'column', gap:10 },
  toast: { display:'flex', alignItems:'center', justifyContent:'space-between', minWidth:250, maxWidth:400, padding:'12px 16px', borderRadius:8, color:'#fff', fontSize:14, fontWeight:500, boxShadow:'0 4px 12px rgba(0,0,0,0.15)', animation:'slideIn 0.3s ease' },
  info: { backgroundColor:'#2196F3' },
  success: { backgroundColor:'#4CAF50' },
  error: { backgroundColor:'#F44336' },
  warning: { backgroundColor:'#FF9800' },
  close: { background:'none', border:'none', cursor:'pointer', marginLeft:12, padding:0, color:'#fff', fontSize:18, lineHeight:1 },
};

// Global keyframes
(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .spinner { width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #6200EE; border-radius:50%; animation:spin 1s linear infinite; }
    .spinner-small { width:20px; height:20px; border:3px solid #fff; border-top:3px solid transparent; border-radius:50%; animation:spin 1s linear infinite; }
  `;
  document.head.appendChild(style);
})();