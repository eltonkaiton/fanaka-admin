// src/components/Dashboard.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar } from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
  const [ticketsDropdownOpen, setTicketsDropdownOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketsView, setTicketsView] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [generatingBulkReceipt, setGeneratingBulkReceipt] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleUserDropdown = () => setUserDropdownOpen(!userDropdownOpen);
  const toggleEmployeeDropdown = () => setEmployeeDropdownOpen(!employeeDropdownOpen);
  const toggleTicketsDropdown = () => {
    setTicketsDropdownOpen(!ticketsDropdownOpen);
    if (!ticketsDropdownOpen) setTicketsView("all");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, employeesRes, bookingsRes] = await Promise.all([
          axios.get("https://fanaka-server-1.onrender.com/api/users"),
          axios.get("https://fanaka-server-1.onrender.com/api/employees"),
          axios.get("https://fanaka-server-1.onrender.com/api/bookings"),
        ]);
        setUsers(usersRes.data);
        setEmployees(employeesRes.data);
        setBookings(bookingsRes.data?.bookings || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...bookings];
    switch (ticketsView) {
      case "pending": filtered = filtered.filter(b => b.paymentStatus === "pending"); break;
      case "confirmed": filtered = filtered.filter(b => b.paymentStatus === "approved" || b.status === "confirmed"); break;
      case "cancelled": filtered = filtered.filter(b => b.status === "cancelled"); break;
      default: break;
    }
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.customerName?.toLowerCase().includes(query) ||
        b.customerEmail?.toLowerCase().includes(query) ||
        b.playTitle?.toLowerCase().includes(query) ||
        b.bookingReference?.toLowerCase().includes(query)
      );
    }
    filtered.sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate));
    setFilteredBookings(filtered);
  }, [bookings, ticketsView, searchQuery]);

  if (loading) return <div className="text-center mt-5">Loading dashboard...</div>;

  const activeUsers = users.filter(u => u.status === "Active").length;
  const pendingUsers = users.filter(u => u.status === "Pending").length;
  const suspendedUsers = users.filter(u => u.status === "Suspended").length;
  const totalEmployees = employees.length;
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
  const pendingBookings = bookings.filter(b => b.status === "pending" || b.paymentStatus === "pending").length;
  const cancelledBookings = bookings.filter(b => b.status === "cancelled").length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  const confirmedRevenue = bookings.filter(b => b.paymentStatus === "approved" || b.status === "confirmed").reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

  const userPieData = [{ name: "Active Users", value: activeUsers }, { name: "Pending Users", value: pendingUsers }, { name: "Suspended Users", value: suspendedUsers }];
  const bookingPieData = [{ name: "Confirmed", value: confirmedBookings }, { name: "Pending", value: pendingBookings }, { name: "Cancelled", value: cancelledBookings }];
  const revenueByPlay = bookings.reduce((acc, booking) => {
    const playTitle = booking.playTitle || "Unknown Play";
    if (!acc[playTitle]) acc[playTitle] = 0;
    acc[playTitle] += booking.totalPrice || 0;
    return acc;
  }, {});
  const revenueChartData = Object.entries(revenueByPlay).slice(0, 5).map(([name, value]) => ({ name, revenue: value }));
  const lineData = [
    { month: "Jan", Users: activeUsers, Bookings: confirmedBookings, Revenue: 120000 },
    { month: "Feb", Users: activeUsers + 5, Bookings: confirmedBookings + 3, Revenue: 150000 },
    { month: "Mar", Users: activeUsers + 8, Bookings: confirmedBookings + 5, Revenue: 180000 },
    { month: "Apr", Users: activeUsers + 12, Bookings: confirmedBookings + 8, Revenue: 210000 },
  ];
  const recentBookings = bookings.slice(0, 5);
  const COLORS = ["#0088FE", "#00C49F", "#FF8042", "#FFBB28"];
  const BOOKING_COLORS = ["#4CAF50", "#FF9800", "#F44336"];

  const updateBookingStatus = async (bookingId, status) => {
    try {
      setUpdatingStatus(true);
      await axios.put(`https://fanaka-server-1.onrender.com/api/bookings/${bookingId}`, { paymentStatus: status });
      setBookings(prev => prev.map(b => b._id === bookingId || b.id === bookingId ? { ...b, paymentStatus: status } : b));
      alert(`Booking ${status} successfully!`);
      setShowBookingModal(false);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update booking status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    try {
      setDeletingBookingId(bookingToDelete._id || bookingToDelete.id);
      await axios.delete(`https://fanaka-server-1.onrender.com/api/bookings/${bookingToDelete._id || bookingToDelete.id}`);
      
      // Remove the deleted booking from state
      setBookings(prev => prev.filter(b => 
        (b._id !== bookingToDelete._id) && (b.id !== bookingToDelete.id)
      ));
      
      alert("Booking deleted successfully!");
      setShowDeleteModal(false);
      setBookingToDelete(null);
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    } finally {
      setDeletingBookingId(null);
    }
  };

  const confirmDeleteBooking = (booking) => {
    setBookingToDelete(booking);
    setShowDeleteModal(true);
  };

  const generateBulkReceipt = async () => {
    if (filteredBookings.length === 0) {
      alert("No bookings to generate receipt for!");
      return;
    }

    try {
      setGeneratingBulkReceipt(true);
      
      const totalAmount = filteredBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      const approvedCount = filteredBookings.filter(b => b.paymentStatus === 'approved').length;
      const pendingCount = filteredBookings.filter(b => b.paymentStatus === 'pending').length;
      const rejectedCount = filteredBookings.filter(b => b.paymentStatus === 'rejected').length;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
            .receipt { background: white; padding: 30px; border-radius: 10px; max-width: 1000px; margin: 0 auto; box-shadow: 0 0 20px rgba(0,0,0,0.1); border: 2px solid #6200EE; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6200EE; padding-bottom: 20px; }
            .title { font-size: 28px; font-weight: bold; color: #6200EE; margin-bottom: 10px; }
            .subtitle { font-size: 14px; color: #666; }
            .summary { display: flex; justify-content: space-between; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
            .summary-item { text-align: center; }
            .summary-number { font-size: 24px; font-weight: bold; color: #6200EE; }
            .summary-label { font-size: 12px; color: #666; margin-top: 5px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #6200EE; color: white; padding: 12px; text-align: left; }
            td { padding: 10px 12px; border-bottom: 1px solid #eee; }
            tr:hover { background: #f9f9f9; }
            .total { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center; }
            .total-amount { font-size: 28px; font-weight: bold; color: #6200EE; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
            .status-badge { display: inline-block; padding: 3px 10px; border-radius: 15px; font-size: 11px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="title">FANAKA ARTS THEATER</div>
              <div class="subtitle">Booking Summary Report</div>
              <div style="margin-top: 15px; font-size: 16px; color: #333;">
                Report Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
              </div>
            </div>
            
            <div class="summary">
              <div class="summary-item">
                <div class="summary-number">${filteredBookings.length}</div>
                <div class="summary-label">Total Bookings</div>
              </div>
              <div class="summary-item">
                <div class="summary-number">${approvedCount}</div>
                <div class="summary-label">Approved</div>
              </div>
              <div class="summary-item">
                <div class="summary-number">${pendingCount}</div>
                <div class="summary-label">Pending</div>
              </div>
              <div class="summary-item">
                <div class="summary-number">${rejectedCount}</div>
                <div class="summary-label">Rejected</div>
              </div>
              <div class="summary-item">
                <div class="summary-number">KES ${totalAmount.toLocaleString()}</div>
                <div class="summary-label">Total Amount</div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Booking Details (${ticketsView === "all" ? "All" : ticketsView.charAt(0).toUpperCase() + ticketsView.slice(1)} Bookings)</div>
              <table>
                <thead>
                  <tr>
                    <th>Booking Ref</th>
                    <th>Customer</th>
                    <th>Play</th>
                    <th>Tickets</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredBookings.map((booking, index) => `
                    <tr>
                      <td><small>${booking.bookingReference || booking._id?.substring(0, 8)}</small></td>
                      <td>${booking.customerName || "N/A"}<br><small>${booking.customerEmail || ""}</small></td>
                      <td>${booking.playTitle || "Unknown Play"}</td>
                      <td>${booking.quantity || 0}</td>
                      <td><strong>KES ${(booking.totalPrice || 0).toLocaleString()}</strong></td>
                      <td>
                        <span class="status-badge" style="background: ${booking.paymentStatus === 'approved' ? '#d4edda' : booking.paymentStatus === 'pending' ? '#fff3cd' : '#f8d7da'}; color: ${booking.paymentStatus === 'approved' ? '#155724' : booking.paymentStatus === 'pending' ? '#856404' : '#721c24'};">
                          ${(booking.paymentStatus || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td><small>${new Date(booking.createdAt || booking.bookingDate).toLocaleDateString()}</small></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="total">
              <div>Total Amount for ${filteredBookings.length} Bookings</div>
              <div class="total-amount">KES ${totalAmount.toLocaleString()}</div>
            </div>
            
            <div class="footer">
              <div>Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} • ${filteredBookings.length} records</div>
              <div>Fanaka Arts Theater • Report ID: ${Date.now()}</div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error("Error generating bulk receipt:", error);
      alert("Failed to generate receipt");
    } finally {
      setGeneratingBulkReceipt(false);
    }
  };

  const renderTicketsContent = () => {
    if (!ticketsDropdownOpen) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: sidebarOpen ? '250px' : '75px', right: 0, bottom: 0, backgroundColor: '#f8f9fa', zIndex: 999, padding: '20px', overflowY: 'auto' }}>
        <div className="card shadow-sm h-100">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">🎟️ Tickets Management</h5>
              <small className="text-muted">Manage all bookings and payments</small>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div className="input-group" style={{ width: '300px' }}>
                <input type="text" className="form-control form-control-sm" placeholder="Search bookings..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                {searchQuery && <button className="btn btn-outline-secondary btn-sm" onClick={() => setSearchQuery("")}>✕</button>}
              </div>
              <div className="d-flex gap-2">
                <button className={`btn btn-sm ${ticketsView === "all" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setTicketsView("all")}>All ({bookings.length})</button>
                <button className={`btn btn-sm ${ticketsView === "pending" ? "btn-warning" : "btn-outline-warning"}`} onClick={() => setTicketsView("pending")}>Pending ({pendingBookings})</button>
                <button className={`btn btn-sm ${ticketsView === "confirmed" ? "btn-success" : "btn-outline-success"}`} onClick={() => setTicketsView("confirmed")}>Confirmed ({confirmedBookings})</button>
                <button className={`btn btn-sm ${ticketsView === "cancelled" ? "btn-danger" : "btn-outline-danger"}`} onClick={() => setTicketsView("cancelled")}>Cancelled ({cancelledBookings})</button>
                <button className={`btn btn-sm ${ticketsView === "revenue" ? "btn-info" : "btn-outline-info"}`} onClick={() => setTicketsView("revenue")}>Revenue</button>
                <button 
                  className="btn btn-sm btn-success" 
                  onClick={generateBulkReceipt}
                  disabled={generatingBulkReceipt || filteredBookings.length === 0}
                >
                  {generatingBulkReceipt ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      📄 Generate Receipt ({filteredBookings.length})
                    </>
                  )}
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setTicketsDropdownOpen(false)}>Close</button>
              </div>
            </div>
          </div>

          <div className="card-body" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
            {ticketsView === "revenue" ? (
              <div className="row">
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header"><h6>Revenue Summary</h6></div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-6 text-center p-3"><h3 className="text-success">KES {totalRevenue.toLocaleString()}</h3><small className="text-muted">Total Revenue</small></div>
                        <div className="col-6 text-center p-3"><h3 className="text-primary">KES {confirmedRevenue.toLocaleString()}</h3><small className="text-muted">Confirmed</small></div>
                      </div>
                      <div className="mt-3"><h6>Top Plays by Revenue</h6>
                        <ResponsiveContainer width="100%" height={250}><BarChart data={revenueChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" angle={-45} textAnchor="end" height={60} /><YAxis /><Tooltip formatter={(value) => [`KES ${value.toLocaleString()}`, "Revenue"]} /><Bar dataKey="revenue" fill="#8884d8" /></BarChart></ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header"><h6>Revenue Breakdown</h6></div>
                    <div className="card-body">
                      <table className="table table-sm"><thead><tr><th>Play</th><th>Bookings</th><th>Revenue</th></tr></thead><tbody>
                        {Object.entries(revenueByPlay).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([play, revenue]) => (
                          <tr key={play}><td>{play}</td><td><span className="badge bg-info">{bookings.filter(b => b.playTitle === play).length}</span></td><td><strong>KES {revenue.toLocaleString()}</strong></td></tr>
                        ))}
                      </tbody></table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span className="text-muted">Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}</span>
                    <span className="ms-3">
                      Total Amount: <strong className="text-success">KES {filteredBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString()}</strong>
                    </span>
                  </div>
                  <div>
                    <span className="badge bg-success me-2">Approved: {filteredBookings.filter(b => b.paymentStatus === 'approved').length}</span>
                    <span className="badge bg-warning me-2">Pending: {filteredBookings.filter(b => b.paymentStatus === 'pending').length}</span>
                    <span className="badge bg-danger">Rejected: {filteredBookings.filter(b => b.paymentStatus === 'rejected').length}</span>
                  </div>
                </div>
                
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead><tr><th>Booking ID</th><th>Customer</th><th>Play</th><th>Tickets</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                        <tr key={booking._id || booking.id}>
                          <td><small className="text-muted">{booking.bookingReference || booking._id?.substring(0, 8)}</small></td>
                          <td><div><strong>{booking.customerName || "N/A"}</strong><br /><small className="text-muted">{booking.customerEmail || ""}</small></div></td>
                          <td>{booking.playTitle || "Unknown Play"}</td>
                          <td><span className="badge bg-info">{booking.quantity || 0} tickets</span></td>
                          <td><strong>KES {booking.totalPrice?.toLocaleString() || 0}</strong></td>
                          <td><span className={`badge ${booking.paymentStatus === 'approved' ? 'bg-success' : booking.paymentStatus === 'pending' ? 'bg-warning' : booking.paymentStatus === 'rejected' ? 'bg-danger' : 'bg-secondary'}`}>{booking.paymentStatus?.toUpperCase() || 'PENDING'}</span></td>
                          <td><small>{new Date(booking.createdAt || booking.bookingDate).toLocaleDateString()}</small></td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary" onClick={() => handleViewBooking(booking)}>View</button>
                              <button 
                                className="btn btn-outline-danger" 
                                onClick={() => confirmDeleteBooking(booking)}
                                disabled={deletingBookingId === (booking._id || booking.id)}
                              >
                                {deletingBookingId === (booking._id || booking.id) ? (
                                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                  "Delete"
                                )}
                              </button>
                              {booking.paymentStatus === 'pending' && (
                                <>
                                  <button className="btn btn-outline-success" onClick={() => updateBookingStatus(booking._id || booking.id, 'approved')} disabled={updatingStatus}>Approve</button>
                                  <button className="btn btn-outline-danger" onClick={() => updateBookingStatus(booking._id || booking.id, 'rejected')} disabled={updatingStatus}>Reject</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="8" className="text-center py-4"><div className="text-muted"><span className="display-4">🎭</span><h5>No bookings found</h5><p>No bookings match your criteria</p></div></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Booking Details Modal */}
                {showBookingModal && selectedBooking && (
                  <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg"><div className="modal-content">
                      <div className="modal-header"><h5 className="modal-title">Booking Details</h5><button type="button" className="btn-close" onClick={() => setShowBookingModal(false)}></button></div>
                      <div className="modal-body">
                        <div className="row">
                          <div className="col-md-6">
                            <p><strong>Booking ID:</strong> {selectedBooking.bookingReference}</p>
                            <p><strong>Play:</strong> {selectedBooking.playTitle}</p>
                            <p><strong>Tickets:</strong> {selectedBooking.quantity}</p>
                            <p><strong>Seats:</strong> {Array.isArray(selectedBooking.allocatedSeats) ? selectedBooking.allocatedSeats.join(', ') : 'N/A'}</p>
                          </div>
                          <div className="col-md-6">
                            <p><strong>Customer:</strong> {selectedBooking.customerName}</p>
                            <p><strong>Email:</strong> {selectedBooking.customerEmail}</p>
                            <p><strong>Phone:</strong> {selectedBooking.customerPhone || 'N/A'}</p>
                            <p><strong>Total:</strong> KES {selectedBooking.totalPrice?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p><strong>Payment Method:</strong> {selectedBooking.paymentMethod}</p>
                          <p><strong>Payment Code:</strong> {selectedBooking.paymentCode}</p>
                          <p><strong>Status:</strong> <span className={`badge ms-2 ${selectedBooking.paymentStatus === 'approved' ? 'bg-success' : selectedBooking.paymentStatus === 'pending' ? 'bg-warning' : selectedBooking.paymentStatus === 'rejected' ? 'bg-danger' : 'bg-secondary'}`}>{selectedBooking.paymentStatus?.toUpperCase() || 'PENDING'}</span></p>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowBookingModal(false)}>Close</button>
                        <button type="button" className="btn btn-danger" onClick={() => {
                          setShowBookingModal(false);
                          confirmDeleteBooking(selectedBooking);
                        }}>Delete Booking</button>
                        <button type="button" className="btn btn-primary" onClick={generateBulkReceipt}>Generate Report</button>
                      </div>
                    </div></div>
                  </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && bookingToDelete && (
                  <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                          <h5 className="modal-title">⚠️ Confirm Delete</h5>
                          <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
                        </div>
                        <div className="modal-body">
                          <div className="alert alert-warning">
                            <h6 className="alert-heading">Are you sure you want to delete this booking?</h6>
                            <p className="mb-1"><strong>Booking ID:</strong> {bookingToDelete.bookingReference || bookingToDelete._id?.substring(0, 8)}</p>
                            <p className="mb-1"><strong>Customer:</strong> {bookingToDelete.customerName}</p>
                            <p className="mb-1"><strong>Play:</strong> {bookingToDelete.playTitle}</p>
                            <p className="mb-1"><strong>Amount:</strong> KES {bookingToDelete.totalPrice?.toLocaleString() || 0}</p>
                            <p className="mb-0"><strong>Status:</strong> {bookingToDelete.paymentStatus?.toUpperCase() || 'PENDING'}</p>
                          </div>
                          <div className="alert alert-danger mt-3">
                            <small>⚠️ <strong>Warning:</strong> This action cannot be undone. All booking data will be permanently deleted.</small>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={() => setShowDeleteModal(false)}
                            disabled={deletingBookingId}
                          >
                            Cancel
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-danger" 
                            onClick={handleDeleteBooking}
                            disabled={deletingBookingId}
                          >
                            {deletingBookingId ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                Deleting...
                              </>
                            ) : (
                              'Yes, Delete Booking'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className={`bg-dark text-white p-3 vh-100 position-fixed ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`} style={{ transition: "all 0.3s ease", zIndex: 1000, overflowY: "auto" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-center mb-0 flex-grow-1">{sidebarOpen ? "Fanaka Admin" : "FA"}</h3>
          <button className="btn btn-sm btn-outline-light d-none d-md-block" onClick={toggleSidebar} style={{ marginLeft: "10px" }}>{sidebarOpen ? "◀" : "▶"}</button>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item mb-2"><Link to="/" className="nav-link text-white d-flex align-items-center"><span className="me-2">📊</span>{sidebarOpen && <span>Dashboard</span>}</Link></li>
          <li className="nav-item mb-2">
            <button className="btn btn-dark w-100 text-start d-flex align-items-center" onClick={toggleUserDropdown} style={{ paddingLeft: "0" }}>
              <span className="me-2">👥</span>{sidebarOpen && <span>Users</span>}{sidebarOpen && <span className="ms-auto">{userDropdownOpen ? "▲" : "▼"}</span>}
            </button>
            {userDropdownOpen && sidebarOpen && (
              <ul className="nav flex-column ms-4 mt-2">
                <li className="nav-item mb-1"><Link to="/pending-users" className="nav-link text-white">Pending</Link></li>
                <li className="nav-item mb-1"><Link to="/active-users" className="nav-link text-white">Active</Link></li>
                <li className="nav-item mb-1"><Link to="/suspended-users" className="nav-link text-white">Suspended</Link></li>
                <li className="nav-item mb-1"><Link to="/rejected-users" className="nav-link text-white">Rejected</Link></li>
                <li className="nav-item mb-1"><Link to="/add-user" className="nav-link text-white">Add User</Link></li>
              </ul>
            )}
          </li>
          <li className="nav-item mb-2">
            <button className="btn btn-dark w-100 text-start d-flex align-items-center" onClick={toggleEmployeeDropdown} style={{ paddingLeft: "0" }}>
              <span className="me-2">💼</span>{sidebarOpen && <span>Employees</span>}{sidebarOpen && <span className="ms-auto">{employeeDropdownOpen ? "▲" : "▼"}</span>}
            </button>
            {employeeDropdownOpen && sidebarOpen && (
              <ul className="nav flex-column ms-4 mt-2">
                <li className="nav-item mb-1"><Link to="/employees" className="nav-link text-white">All Employees</Link></li>
                <li className="nav-item mb-1"><Link to="/add-employee" className="nav-link text-white">Add Employee</Link></li>
              </ul>
            )}
          </li>
          <li className="nav-item mb-2">
            <button className="btn btn-dark w-100 text-start d-flex align-items-center" onClick={toggleTicketsDropdown} style={{ paddingLeft: "0" }}>
              <span className="me-2">🎟️</span>{sidebarOpen && <span>Tickets</span>}{sidebarOpen && <span className="ms-auto">{ticketsDropdownOpen ? "▲" : "▼"}</span>}
            </button>
          </li>
          <li className="nav-item mb-2"><Link to="/actors" className="nav-link text-white d-flex align-items-center"><span className="me-2">🎭</span>{sidebarOpen && <span>Actors</span>}</Link></li>
          <li className="nav-item mb-2 mt-3"><button className="btn btn-danger w-100 text-start d-flex align-items-center" onClick={handleLogout}><span className="me-2">🚪</span>{sidebarOpen && <span>Logout</span>}</button></li>
        </ul>
        {sidebarOpen && (<div className="mt-5 pt-5 border-top"><div className="text-center"><p className="small text-muted mb-1">Fanaka Arts v1.0</p><p className="small text-muted">© 2024 All rights reserved</p></div></div>)}
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ marginLeft: sidebarOpen ? "250px" : "75px", transition: "margin-left 0.3s ease", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        {/* Navbar */}
        <nav className="navbar navbar-light bg-white shadow-sm px-4 py-3 mb-4">
          <div className="d-flex align-items-center">
            <button className="btn btn-outline-secondary d-md-none" onClick={toggleSidebar}>☰</button>
            <button className="btn btn-outline-secondary d-none d-md-block ms-3" onClick={toggleSidebar}>{sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}</button>
            <span className="ms-4 navbar-brand mb-0 h1 text-primary">Dashboard Overview</span>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-3 text-muted">Welcome, <strong>Admin</strong></span>
            <button className="btn btn-outline-primary btn-sm" onClick={() => navigate("/profile")}>👤</button>
          </div>
        </nav>

        {/* Dashboard Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3"><Link to="/active-users" className="text-decoration-none"><div className="card shadow-sm p-3 hover-card border-primary border-top"><div className="d-flex justify-content-between align-items-center"><div><h6 className="text-muted">Active Users</h6><h3 className="text-primary">{activeUsers}</h3><small className="text-success">+12% from last month</small></div><span className="display-6">✅</span></div></div></Link></div>
          <div className="col-md-3 mb-3"><Link to="/pending-users" className="text-decoration-none"><div className="card shadow-sm p-3 hover-card border-warning border-top"><div className="d-flex justify-content-between align-items-center"><div><h6 className="text-muted">Pending Users</h6><h3 className="text-warning">{pendingUsers}</h3><small className="text-info">Awaiting approval</small></div><span className="display-6">⏳</span></div></div></Link></div>
          <div className="col-md-3 mb-3"><Link to="/employees" className="text-decoration-none"><div className="card shadow-sm p-3 hover-card border-info border-top"><div className="d-flex justify-content-between align-items-center"><div><h6 className="text-muted">Employees</h6><h3 className="text-info">{totalEmployees}</h3><small className="text-success">All active</small></div><span className="display-6">💼</span></div></div></Link></div>
          <div className="col-md-3 mb-3"><div className="card shadow-sm p-3 hover-card border-success border-top"><div className="d-flex justify-content-between align-items-center"><div><h6 className="text-muted">Total Bookings</h6><h3 className="text-success">{totalBookings}</h3><small className="text-success">KES {totalRevenue.toLocaleString()}</small></div><span className="display-6">🎟️</span></div></div></div>
        </div>

        {/* Charts Row */}
        <div className="row mb-4">
          <div className="col-lg-6 mb-4"><div className="card shadow-sm p-3 h-100"><h5 className="mb-3 d-flex justify-content-between align-items-center"><span>📈 Growth Trends</span><small className="text-muted">Last 4 months</small></h5><ResponsiveContainer width="100%" height={250}><LineChart data={lineData}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="month" stroke="#666" /><YAxis stroke="#666" /><Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} /><Legend /><Line type="monotone" dataKey="Users" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} /><Line type="monotone" dataKey="Bookings" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} /><Line type="monotone" dataKey="Revenue" stroke="#ffc658" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div></div>
          <div className="col-lg-3 mb-4"><div className="card shadow-sm p-3 h-100"><h5 className="mb-3">👥 User Distribution</h5><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={userPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={(entry) => `${entry.name}: ${entry.value}`}>{userPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="mt-3 text-center"><h6 className="text-muted">Total Users: {users.length}</h6></div></div></div>
          <div className="col-lg-3 mb-4"><div className="card shadow-sm p-3 h-100"><h5 className="mb-3">🎟️ Booking Status</h5><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={bookingPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={(entry) => `${entry.name}: ${entry.value}`}>{bookingPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={BOOKING_COLORS[index % BOOKING_COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="mt-3 text-center"><h6 className="text-muted">Total Bookings: {totalBookings}</h6></div></div></div>
        </div>

        {/* Tickets Content - Full Screen Overlay */}
        {renderTicketsContent()}

        {/* Recent Bookings Table (only shown when tickets dropdown is closed) */}
        {!ticketsDropdownOpen && (
          <div className="row mb-4"><div className="col-12"><div className="card shadow-sm"><div className="card-header bg-white d-flex justify-content-between align-items-center"><h5 className="mb-0">📋 Recent Bookings</h5><button className="btn btn-sm btn-outline-primary" onClick={() => setTicketsDropdownOpen(true)}>Manage Tickets</button></div><div className="card-body p-0">
            {recentBookings.length > 0 ? (<div className="table-responsive"><table className="table table-hover mb-0"><thead className="table-light"><tr><th>Booking ID</th><th>Customer</th><th>Play</th><th>Tickets</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>
              {recentBookings.map((booking) => (<tr key={booking._id || booking.id}>
                <td><small className="text-muted">{booking.bookingReference || booking._id?.substring(0, 8)}</small></td>
                <td><div><strong>{booking.customerName || "N/A"}</strong><br /><small className="text-muted">{booking.customerEmail || ""}</small></div></td>
                <td>{booking.playTitle || "Unknown Play"}</td>
                <td><span className="badge bg-info">{booking.quantity || 0} tickets</span></td>
                <td><strong>KES {booking.totalPrice?.toLocaleString() || 0}</strong></td>
                <td><span className={`badge ${booking.paymentStatus === 'approved' || booking.status === 'confirmed' ? 'bg-success' : booking.paymentStatus === 'pending' ? 'bg-warning' : booking.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'}`}>{booking.paymentStatus === 'approved' ? 'Paid' : booking.paymentStatus === 'pending' ? 'Pending' : booking.status === 'confirmed' ? 'Confirmed' : booking.status === 'cancelled' ? 'Cancelled' : 'Unknown'}</span></td>
                <td><small>{new Date(booking.createdAt || booking.bookingDate).toLocaleDateString()}</small></td>
              </tr>))}
            </tbody></table></div>) : (<div className="text-center py-4"><span className="display-4">🎭</span><h5>No bookings yet</h5><p className="text-muted">Bookings will appear here once made</p></div>)}
          </div></div></div></div>
        )}

        {/* Quick Stats */}
        {!ticketsDropdownOpen && (
          <div className="row mt-4">
            <div className="col-md-4 mb-3"><div className="card shadow-sm p-3"><div className="d-flex align-items-center"><div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3"><span className="display-6">💰</span></div><div><h6 className="text-muted mb-1">Total Revenue</h6><h3 className="mb-0">KES {totalRevenue.toLocaleString()}</h3><small className="text-success">+18% from last month</small></div></div></div></div>
            <div className="col-md-4 mb-3"><div className="card shadow-sm p-3"><div className="d-flex align-items-center"><div className="bg-success bg-opacity-10 p-3 rounded-circle me-3"><span className="display-6">✅</span></div><div><h6 className="text-muted mb-1">Conversion Rate</h6><h3 className="mb-0">{totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(1) : 0}%</h3><small className="text-success">+5% from last month</small></div></div></div></div>
            <div className="col-md-4 mb-3"><div className="card shadow-sm p-3"><div className="d-flex align-items-center"><div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3"><span className="display-6">📊</span></div><div><h6 className="text-muted mb-1">Avg. Ticket Value</h6><h3 className="mb-0">KES {totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0}</h3><small className="text-success">+8% from last month</small></div></div></div></div>
          </div>
        )}
      </div>

      <style jsx>{`
        .sidebar-open { width: 250px; }
        .sidebar-closed { width: 75px; }
        @media (max-width: 768px) {
          .sidebar-open { width: 250px; }
          .sidebar-closed { width: 0; padding: 0 !important; overflow: hidden; }
          .flex-grow-1 { margin-left: 0 !important; }
        }
        .nav-link:hover, button.btn-dark:hover { background-color: rgba(255, 255, 255, 0.1); border-radius: 5px; }
        .hover-card:hover { transform: translateY(-5px); transition: transform 0.3s ease; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
        .table-hover tbody tr:hover { background-color: rgba(98, 0, 238, 0.05); }
        .card { border-radius: 10px; }
        .btn-group-sm > .btn { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
      `}</style>
    </div>
  );
};

export default Dashboard;