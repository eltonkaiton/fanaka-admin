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
  const [ordersDropdownOpen, setOrdersDropdownOpen] = useState(false);
  const [playsDropdownOpen, setPlaysDropdownOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [plays, setPlays] = useState([]);
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketsView, setTicketsView] = useState("all");
  const [ordersView, setOrdersView] = useState("all");
  const [playsView, setPlaysView] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [ordersSearchQuery, setOrdersSearchQuery] = useState("");
  const [playsSearchQuery, setPlaysSearchQuery] = useState("");
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredPlays, setFilteredPlays] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showPlayModal, setShowPlayModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);
  const [updatingPlayStatus, setUpdatingPlayStatus] = useState(false);
  const [generatingBulkReceipt, setGeneratingBulkReceipt] = useState(false);
  // Delete states for orders and plays remain
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [deletingPlayId, setDeletingPlayId] = useState(null);
  const [showOrderDeleteModal, setShowOrderDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showPlayDeleteModal, setShowPlayDeleteModal] = useState(false);
  const [playToDelete, setPlayToDelete] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    item: "",
    itemName: "",
    supplier: "",
    supplierName: "",
    quantity: 1,
    unitPrice: 0,
    description: "",
    estimatedDelivery: ""
  });
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [fetchingSuppliers, setFetchingSuppliers] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    userId: "admin",
    userName: "Admin",
    userRole: "Finance",
    paymentMethod: "Bank Transfer",
    transactionId: "",
    amountPaid: "",
    notes: ""
  });
  const [showPlayForm, setShowPlayForm] = useState(false);
  const [newPlay, setNewPlay] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    regularPrice: 0,
    vipPrice: 0,
    vvipPrice: 0,
    image: null
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [selectedPlayForMaterials, setSelectedPlayForMaterials] = useState(null);
  const [materialStats, setMaterialStats] = useState({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    processing: 0,
    prepared: 0,
    collected: 0,
    rejected: 0
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleUserDropdown = () => setUserDropdownOpen(!userDropdownOpen);
  const toggleEmployeeDropdown = () => setEmployeeDropdownOpen(!employeeDropdownOpen);
  const toggleTicketsDropdown = () => {
    setTicketsDropdownOpen(!ticketsDropdownOpen);
    if (!ticketsDropdownOpen) setTicketsView("all");
  };
  const toggleOrdersDropdown = () => {
    setOrdersDropdownOpen(!ordersDropdownOpen);
    if (!ordersDropdownOpen) setOrdersView("all");
  };
  const togglePlaysDropdown = () => {
    setPlaysDropdownOpen(!playsDropdownOpen);
    if (!playsDropdownOpen) {
      setPlaysView("all");
      fetchPlays();
      fetchActors();
      fetchMaterialStats();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, employeesRes, bookingsRes, ordersRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users"),
          axios.get("http://localhost:5000/api/employees"),
          axios.get("http://localhost:5000/api/bookings"),
          axios.get("http://localhost:5000/api/orders"),
        ]);
        setUsers(usersRes.data);
        setEmployees(employeesRes.data);
        setBookings(bookingsRes.data?.bookings || []);
        setOrders(ordersRes.data?.orders || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchPlays = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/plays");
      setPlays(response.data);
    } catch (error) {
      console.error("Error fetching plays:", error);
    }
  };

  const fetchActors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/actors");
      setActors(response.data);
    } catch (error) {
      console.error("Error fetching actors:", error);
    }
  };

  const fetchMaterialStats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/plays/materials/stats");
      setMaterialStats(response.data);
    } catch (error) {
      console.error("Error fetching material stats:", error);
    }
  };

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

  useEffect(() => {
    let filtered = [...orders];
    switch (ordersView) {
      case "pending": 
        filtered = filtered.filter(o => o.status === "Pending" || o.payment?.status === "Pending"); 
        break;
      case "approved": 
        filtered = filtered.filter(o => o.status === "Approved" || o.payment?.status === "Approved"); 
        break;
      case "delivered": 
        filtered = filtered.filter(o => o.status === "Delivered" || o.status === "Received"); 
        break;
      case "paid": 
        filtered = filtered.filter(o => o.payment?.status === "Paid"); 
        break;
      case "rejected": 
        filtered = filtered.filter(o => o.status === "Rejected" || o.payment?.status === "Rejected"); 
        break;
      default: break;
    }
    if (ordersSearchQuery.trim() !== "") {
      const query = ordersSearchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.itemName?.toLowerCase().includes(query) ||
        o.supplierName?.toLowerCase().includes(query) ||
        o._id?.toLowerCase().includes(query) ||
        o.description?.toLowerCase().includes(query)
      );
    }
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredOrders(filtered);
  }, [orders, ordersView, ordersSearchQuery]);

  useEffect(() => {
    let filtered = [...plays];
    switch (playsView) {
      case "upcoming": 
        filtered = filtered.filter(p => new Date(p.date) > new Date()); 
        break;
      case "past": 
        filtered = filtered.filter(p => new Date(p.date) < new Date()); 
        break;
      case "today": 
        const today = new Date().toDateString();
        filtered = filtered.filter(p => new Date(p.date).toDateString() === today); 
        break;
      case "thisWeek": 
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        filtered = filtered.filter(p => new Date(p.date) <= weekFromNow && new Date(p.date) >= new Date()); 
        break;
      default: break;
    }
    if (playsSearchQuery.trim() !== "") {
      const query = playsSearchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.venue?.toLowerCase().includes(query)
      );
    }
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredPlays(filtered);
  }, [plays, playsView, playsSearchQuery]);

  const fetchItems = async () => {
    try {
      setFetchingItems(true);
      const response = await axios.get("http://localhost:5000/api/items");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setFetchingItems(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      setFetchingSuppliers(true);
      const response = await axios.get("http://localhost:5000/api/employees?role=Supplier");
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setFetchingSuppliers(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        ...newOrder,
        quantity: parseInt(newOrder.quantity),
        unitPrice: parseFloat(newOrder.unitPrice)
      };
      
      const response = await axios.post("http://localhost:5000/api/orders", orderData);
      
      if (response.data.success) {
        alert("Order created successfully!");
        setOrders(prev => [...prev, response.data.order]);
        setShowOrderForm(false);
        setNewOrder({
          item: "",
          itemName: "",
          supplier: "",
          supplierName: "",
          quantity: 1,
          unitPrice: 0,
          description: "",
          estimatedDelivery: ""
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order: " + (error.response?.data?.message || error.message));
    }
  };

  const handleCreatePlay = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", newPlay.title);
      formData.append("description", newPlay.description);
      formData.append("date", newPlay.date);
      formData.append("venue", newPlay.venue);
      formData.append("regularPrice", newPlay.regularPrice);
      formData.append("vipPrice", newPlay.vipPrice);
      formData.append("vvipPrice", newPlay.vvipPrice);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await axios.post("http://localhost:5000/api/plays", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      alert("Play created successfully!");
      setPlays(prev => [...prev, response.data]);
      setShowPlayForm(false);
      setNewPlay({
        title: "",
        description: "",
        date: "",
        venue: "",
        regularPrice: 0,
        vipPrice: 0,
        vvipPrice: 0,
        image: null
      });
      setSelectedFile(null);
    } catch (error) {
      console.error("Error creating play:", error);
      alert("Failed to create play: " + (error.response?.data?.error || error.message));
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrderStatus(true);
      let endpoint = `http://localhost:5000/api/orders/${orderId}`;
      
      switch(status) {
        case 'approve':
          endpoint = `http://localhost:5000/api/orders/${orderId}/approve`;
          break;
        case 'deliver':
          endpoint = `http://localhost:5000/api/orders/${orderId}/deliver`;
          break;
        case 'receive':
          endpoint = `http://localhost:5000/api/orders/${orderId}/receive`;
          break;
        case 'reject':
          endpoint = `http://localhost:5000/api/orders/${orderId}/reject`;
          break;
        default:
          endpoint = `http://localhost:5000/api/orders/${orderId}`;
      }
      
      const response = await axios.put(endpoint, {
        ...(status === 'deliver' && { trackingNumber: `TRK${Date.now()}`, deliveryDate: new Date() }),
        ...(status === 'reject' && { notes: "Order rejected by admin" })
      });
      
      setOrders(prev => prev.map(o => o._id === orderId ? response.data.order : o));
      alert(`Order ${status}d successfully!`);
      setShowOrderModal(false);
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  const updatePlayStatus = async (playId, status) => {
    try {
      setUpdatingPlayStatus(true);
      const response = await axios.put(`http://localhost:5000/api/plays/${playId}`, { status });
      
      setPlays(prev => prev.map(p => p._id === playId ? response.data : p));
      alert(`Play ${status}d successfully!`);
      setShowPlayModal(false);
    } catch (error) {
      console.error("Error updating play:", error);
      alert("Failed to update play status");
    } finally {
      setUpdatingPlayStatus(false);
    }
  };

  const updateMaterialRequestStatus = async (playId, requestId, status) => {
    try {
      setUpdatingPlayStatus(true);
      const endpoint = `http://localhost:5000/api/plays/${playId}/material-requests/${requestId}/${status}`;
      const response = await axios.patch(endpoint);
      
      // Refresh plays data
      fetchPlays();
      fetchMaterialStats();
      alert(`Material request ${status} successfully!`);
    } catch (error) {
      console.error("Error updating material request:", error);
      alert("Failed to update material request: " + (error.response?.data?.message || error.message));
    } finally {
      setUpdatingPlayStatus(false);
    }
  };

  const handleProcessPayment = async (orderId) => {
    try {
      setUpdatingOrderStatus(true);
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}/process-payment`, paymentData);
      
      setOrders(prev => prev.map(o => o._id === orderId ? response.data.order : o));
      alert("Payment processed successfully!");
      setShowPaymentModal(false);
      setSelectedOrderForPayment(null);
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Failed to process payment: " + (error.response?.data?.message || error.message));
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      setDeletingOrderId(orderToDelete._id);
      await axios.delete(`http://localhost:5000/api/orders/${orderToDelete._id}`);
      
      setOrders(prev => prev.filter(o => o._id !== orderToDelete._id));
      alert("Order deleted successfully!");
      setShowOrderDeleteModal(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order: " + (error.response?.data?.message || error.message));
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleDeletePlay = async () => {
    if (!playToDelete) return;
    
    try {
      setDeletingPlayId(playToDelete._id);
      await axios.delete(`http://localhost:5000/api/plays/${playToDelete._id}`);
      
      setPlays(prev => prev.filter(p => p._id !== playToDelete._id));
      alert("Play deleted successfully!");
      setShowPlayDeleteModal(false);
      setPlayToDelete(null);
    } catch (error) {
      console.error("Error deleting play:", error);
      alert("Failed to delete play: " + (error.response?.data?.error || error.message));
    } finally {
      setDeletingPlayId(null);
    }
  };

  const confirmDeleteOrder = (order) => {
    setOrderToDelete(order);
    setShowOrderDeleteModal(true);
  };

  const confirmDeletePlay = (play) => {
    setPlayToDelete(play);
    setShowPlayDeleteModal(true);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleViewPlay = (play) => {
    setSelectedPlay(play);
    setShowPlayModal(true);
  };

  const handleOpenPaymentModal = (order) => {
    setSelectedOrderForPayment(order);
    setPaymentData({
      ...paymentData,
      amountPaid: order.totalCost || 0,
      transactionId: `TXN${Date.now()}`
    });
    setShowPaymentModal(true);
  };

  const handleOpenMaterialModal = (play) => {
    setSelectedPlayForMaterials(play);
    setShowMaterialModal(true);
  };

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
  
  // Order statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "Pending" || o.payment?.status === "Pending").length;
  const approvedOrders = orders.filter(o => o.status === "Approved" || o.payment?.status === "Approved").length;
  const deliveredOrders = orders.filter(o => o.status === "Delivered" || o.status === "Received").length;
  const paidOrders = orders.filter(o => o.payment?.status === "Paid").length;
  const rejectedOrders = orders.filter(o => o.status === "Rejected" || o.payment?.status === "Rejected").length;
  const totalOrderValue = orders.reduce((sum, order) => sum + (order.totalCost || 0), 0);
  const paidOrderValue = orders.filter(o => o.payment?.status === "Paid").reduce((sum, order) => sum + (order.totalCost || 0), 0);
  
  // Play statistics
  const totalPlays = plays.length;
  const upcomingPlays = plays.filter(p => new Date(p.date) > new Date()).length;
  const pastPlays = plays.filter(p => new Date(p.date) < new Date()).length;
  const todayPlays = plays.filter(p => new Date(p.date).toDateString() === new Date().toDateString()).length;

  const userPieData = [{ name: "Active Users", value: activeUsers }, { name: "Pending Users", value: pendingUsers }, { name: "Suspended Users", value: suspendedUsers }];
  const bookingPieData = [{ name: "Confirmed", value: confirmedBookings }, { name: "Pending", value: pendingBookings }, { name: "Cancelled", value: cancelledBookings }];
  const orderPieData = [
    { name: "Pending", value: pendingOrders }, 
    { name: "Approved", value: approvedOrders }, 
    { name: "Delivered", value: deliveredOrders },
    { name: "Paid", value: paidOrders },
    { name: "Rejected", value: rejectedOrders }
  ];
  const playPieData = [
    { name: "Upcoming", value: upcomingPlays },
    { name: "Today", value: todayPlays },
    { name: "Past", value: pastPlays }
  ];
  const materialPieData = [
    { name: "Pending", value: materialStats.pending || 0 },
    { name: "Approved", value: materialStats.approved || 0 },
    { name: "Processing", value: materialStats.processing || 0 },
    { name: "Prepared", value: materialStats.prepared || 0 },
    { name: "Collected", value: materialStats.collected || 0 },
    { name: "Rejected", value: materialStats.rejected || 0 }
  ];
  
  const revenueByPlay = bookings.reduce((acc, booking) => {
    const playTitle = booking.playTitle || "Unknown Play";
    if (!acc[playTitle]) acc[playTitle] = 0;
    acc[playTitle] += booking.totalPrice || 0;
    return acc;
  }, {});
  
  const ordersBySupplier = orders.reduce((acc, order) => {
    const supplier = order.supplierName || "Unknown Supplier";
    if (!acc[supplier]) acc[supplier] = 0;
    acc[supplier] += order.totalCost || 0;
    return acc;
  }, {});
  
  const revenueChartData = Object.entries(revenueByPlay).slice(0, 5).map(([name, value]) => ({ name, revenue: value }));
  const supplierChartData = Object.entries(ordersBySupplier).slice(0, 5).map(([name, value]) => ({ name, value }));
  
  const lineData = [
    { month: "Jan", Users: activeUsers, Bookings: confirmedBookings, Revenue: 120000, Orders: pendingOrders, Plays: upcomingPlays },
    { month: "Feb", Users: activeUsers + 5, Bookings: confirmedBookings + 3, Revenue: 150000, Orders: approvedOrders, Plays: upcomingPlays + 2 },
    { month: "Mar", Users: activeUsers + 8, Bookings: confirmedBookings + 5, Revenue: 180000, Orders: deliveredOrders, Plays: upcomingPlays + 3 },
    { month: "Apr", Users: activeUsers + 12, Bookings: confirmedBookings + 8, Revenue: 210000, Orders: paidOrders, Plays: upcomingPlays + 5 },
  ];
  
  const recentBookings = bookings.slice(0, 5);
  const recentOrders = orders.slice(0, 5);
  const recentPlays = plays.slice(0, 5);
  
  const COLORS = ["#0088FE", "#00C49F", "#FF8042", "#FFBB28", "#FF6384", "#36A2EB", "#9966FF"];
  const BOOKING_COLORS = ["#4CAF50", "#FF9800", "#F44336"];
  const ORDER_COLORS = ["#FF9800", "#2196F3", "#9C27B0", "#4CAF50", "#F44336"];
  const PLAY_COLORS = ["#4CAF50", "#FF9800", "#9C27B0"];
  const MATERIAL_COLORS = ["#FF9800", "#2196F3", "#9C27B0", "#4CAF50", "#00C49F", "#F44336"];

  const updateBookingStatus = async (bookingId, status) => {
    try {
      setUpdatingStatus(true);
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}`, { paymentStatus: status });
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
                    <thead><tr><th>Booking ID</th><th>Customer</th><th>Play</th><th>Tickets</th><th>Amount</th><th>Booking Status</th><th>Payment Status</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                        <tr key={booking._id || booking.id}>
                          <td><small className="text-muted">{booking.bookingReference || booking._id?.substring(0, 8)}</small></td>
                          <td><div><strong>{booking.customerName || "N/A"}</strong><br /><small className="text-muted">{booking.customerEmail || ""}</small></div></td>
                          <td>{booking.playTitle || "Unknown Play"}</td>
                          <td><span className="badge bg-info">{booking.quantity || 0} tickets</span></td>
                          <td><strong>KES {booking.totalPrice?.toLocaleString() || 0}</strong></td>
                          <td>
                            <span className={`badge ${
                              booking.status === 'confirmed' ? 'bg-success' :
                              booking.status === 'cancelled' ? 'bg-danger' :
                              booking.status === 'checked_in' ? 'bg-info' :
                              booking.status === 'completed' ? 'bg-primary' :
                              'bg-warning'
                            }`}>
                              {booking.status || 'pending'}
                            </span>
                          </td>
                          <td><span className={`badge ${booking.paymentStatus === 'approved' ? 'bg-success' : booking.paymentStatus === 'pending' ? 'bg-warning' : booking.paymentStatus === 'rejected' ? 'bg-danger' : 'bg-secondary'}`}>{booking.paymentStatus?.toUpperCase() || 'PENDING'}</span></td>
                          <td><small>{new Date(booking.createdAt || booking.bookingDate).toLocaleDateString()}</small></td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary" onClick={() => handleViewBooking(booking)}>View</button>
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
                        <tr><td colSpan="9" className="text-center py-4"><div className="text-muted"><span className="display-4">🎭</span><h5>No bookings found</h5><p>No bookings match your criteria</p></div></td></tr>
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
                        <button type="button" className="btn btn-primary" onClick={generateBulkReceipt}>Generate Report</button>
                      </div>
                    </div></div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderOrdersContent = () => {
    if (!ordersDropdownOpen) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: sidebarOpen ? '250px' : '75px', right: 0, bottom: 0, backgroundColor: '#f8f9fa', zIndex: 999, padding: '20px', overflowY: 'auto' }}>
        <div className="card shadow-sm h-100">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">📦 Orders Management</h5>
              <small className="text-muted">Manage all purchase orders and payments</small>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div className="input-group" style={{ width: '250px' }}>
                <input type="text" className="form-control form-control-sm" placeholder="Search orders..." value={ordersSearchQuery} onChange={(e) => setOrdersSearchQuery(e.target.value)} />
                {ordersSearchQuery && <button className="btn btn-outline-secondary btn-sm" onClick={() => setOrdersSearchQuery("")}>✕</button>}
              </div>
              <div className="d-flex gap-2">
                <button className={`btn btn-sm ${ordersView === "all" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setOrdersView("all")}>All ({orders.length})</button>
                <button className={`btn btn-sm ${ordersView === "pending" ? "btn-warning" : "btn-outline-warning"}`} onClick={() => setOrdersView("pending")}>Pending ({pendingOrders})</button>
                <button className={`btn btn-sm ${ordersView === "approved" ? "btn-info" : "btn-outline-info"}`} onClick={() => setOrdersView("approved")}>Approved ({approvedOrders})</button>
                <button className={`btn btn-sm ${ordersView === "delivered" ? "btn-success" : "btn-outline-success"}`} onClick={() => setOrdersView("delivered")}>Delivered ({deliveredOrders})</button>
                <button className={`btn btn-sm ${ordersView === "paid" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setOrdersView("paid")}>Paid ({paidOrders})</button>
                <button className={`btn btn-sm ${ordersView === "rejected" ? "btn-danger" : "btn-outline-danger"}`} onClick={() => setOrdersView("rejected")}>Rejected ({rejectedOrders})</button>
              </div>
              <button className="btn btn-sm btn-success" onClick={() => {
                setShowOrderForm(true);
                fetchItems();
                fetchSuppliers();
              }}>
                + New Order
              </button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setOrdersDropdownOpen(false)}>Close</button>
            </div>
          </div>

          <div className="card-body" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
            {/* Summary Cards */}
            <div className="row mb-4">
              <div className="col-md-2 mb-2"><div className="card p-2 bg-light"><small>Total Orders</small><h5>{totalOrders}</h5></div></div>
              <div className="col-md-2 mb-2"><div className="card p-2 bg-warning bg-opacity-10"><small>Pending</small><h5>{pendingOrders}</h5></div></div>
              <div className="col-md-2 mb-2"><div className="card p-2 bg-info bg-opacity-10"><small>Approved</small><h5>{approvedOrders}</h5></div></div>
              <div className="col-md-2 mb-2"><div className="card p-2 bg-success bg-opacity-10"><small>Delivered</small><h5>{deliveredOrders}</h5></div></div>
              <div className="col-md-2 mb-2"><div className="card p-2 bg-primary bg-opacity-10"><small>Paid</small><h5>{paidOrders}</h5></div></div>
              <div className="col-md-2 mb-2"><div className="card p-2 bg-danger bg-opacity-10"><small>Rejected</small><h5>{rejectedOrders}</h5></div></div>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span className="text-muted">Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</span>
                <span className="ms-3">
                  Total Value: <strong className="text-success">KES {filteredOrders.reduce((sum, o) => sum + (o.totalCost || 0), 0).toLocaleString()}</strong>
                </span>
                <span className="ms-3">
                  Paid: <strong className="text-primary">KES {filteredOrders.filter(o => o.payment?.status === 'Paid').reduce((sum, o) => sum + (o.totalCost || 0), 0).toLocaleString()}</strong>
                </span>
              </div>
              <div>
                <span className="badge bg-warning me-2">Pending: {filteredOrders.filter(o => o.payment?.status === 'Pending').length}</span>
                <span className="badge bg-info me-2">Submitted: {filteredOrders.filter(o => o.payment?.status === 'Submitted').length}</span>
                <span className="badge bg-primary me-2">Approved: {filteredOrders.filter(o => o.payment?.status === 'Approved').length}</span>
                <span className="badge bg-success me-2">Paid: {filteredOrders.filter(o => o.payment?.status === 'Paid').length}</span>
              </div>
            </div>
            
            <div className="table-responsive">
              <table className="table table-hover">
                <thead><tr><th>Order ID</th><th>Item</th><th>Supplier</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td><small className="text-muted">{order._id?.substring(0, 8)}</small></td>
                      <td><div><strong>{order.itemName}</strong><br /><small className="text-muted">{order.item?.name}</small></div></td>
                      <td>{order.supplierName}</td>
                      <td>{order.quantity}</td>
                      <td>KES {order.unitPrice?.toLocaleString()}</td>
                      <td><strong>KES {order.totalCost?.toLocaleString()}</strong></td>
                      <td><span className={`badge ${order.status === 'Pending' ? 'bg-warning' : order.status === 'Approved' ? 'bg-info' : order.status === 'Delivered' ? 'bg-success' : order.status === 'Received' ? 'bg-primary' : order.status === 'Paid' ? 'bg-success' : order.status === 'Rejected' ? 'bg-danger' : 'bg-secondary'}`}>{order.status}</span></td>
                      <td>
                        <span className={`badge ${order.payment?.status === 'Paid' ? 'bg-success' : order.payment?.status === 'Approved' ? 'bg-primary' : order.payment?.status === 'Submitted' ? 'bg-info' : order.payment?.status === 'Rejected' ? 'bg-danger' : 'bg-warning'}`}>
                          {order.payment?.status || 'Pending'}
                        </span>
                      </td>
                      <td><small>{new Date(order.createdAt).toLocaleDateString()}</small></td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => handleViewOrder(order)}>View</button>
                          <button className="btn btn-outline-info" onClick={() => handleViewOrder(order)}>Edit</button>
                          {order.status === 'Pending' && (
                            <button className="btn btn-outline-success" onClick={() => updateOrderStatus(order._id, 'approve')}>Approve</button>
                          )}
                          {order.status === 'Approved' && (
                            <button className="btn btn-outline-warning" onClick={() => updateOrderStatus(order._id, 'deliver')}>Deliver</button>
                          )}
                          {order.status === 'Delivered' && (
                            <button className="btn btn-outline-primary" onClick={() => updateOrderStatus(order._id, 'receive')}>Receive</button>
                          )}
                          {order.status === 'Received' && order.payment?.status !== 'Paid' && order.payment?.status !== 'Submitted' && (
                            <button className="btn btn-outline-success" onClick={() => handleOpenPaymentModal(order)}>Pay</button>
                          )}
                          {(order.status === 'Pending' || order.status === 'Rejected') && (
                            <button 
                              className="btn btn-outline-danger" 
                              onClick={() => confirmDeleteOrder(order)}
                              disabled={deletingOrderId === order._id}
                            >
                              {deletingOrderId === order._id ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                "Delete"
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="10" className="text-center py-4"><div className="text-muted"><span className="display-4">📦</span><h5>No orders found</h5><p>No orders match your criteria</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg"><div className="modal-content">
                  <div className="modal-header"><h5 className="modal-title">Order Details</h5><button type="button" className="btn-close" onClick={() => setShowOrderModal(false)}></button></div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                        <p><strong>Item:</strong> {selectedOrder.itemName}</p>
                        <p><strong>Supplier:</strong> {selectedOrder.supplierName}</p>
                        <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                        <p><strong>Unit Price:</strong> KES {selectedOrder.unitPrice?.toLocaleString()}</p>
                        <p><strong>Total Cost:</strong> KES {selectedOrder.totalCost?.toLocaleString()}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Status:</strong> <span className={`badge ms-2 ${selectedOrder.status === 'Pending' ? 'bg-warning' : selectedOrder.status === 'Approved' ? 'bg-info' : selectedOrder.status === 'Delivered' ? 'bg-success' : selectedOrder.status === 'Received' ? 'bg-primary' : selectedOrder.status === 'Paid' ? 'bg-success' : 'bg-secondary'}`}>{selectedOrder.status}</span></p>
                        <p><strong>Payment Status:</strong> <span className={`badge ms-2 ${selectedOrder.payment?.status === 'Paid' ? 'bg-success' : selectedOrder.payment?.status === 'Approved' ? 'bg-primary' : selectedOrder.payment?.status === 'Submitted' ? 'bg-info' : selectedOrder.payment?.status === 'Rejected' ? 'bg-danger' : 'bg-warning'}`}>{selectedOrder.payment?.status || 'Pending'}</span></p>
                        <p><strong>Description:</strong> {selectedOrder.description || 'N/A'}</p>
                        <p><strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        {selectedOrder.estimatedDelivery && <p><strong>Est. Delivery:</strong> {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</p>}
                        {selectedOrder.deliveryDate && <p><strong>Delivered:</strong> {new Date(selectedOrder.deliveryDate).toLocaleDateString()}</p>}
                      </div>
                    </div>
                    {selectedOrder.payment && (
                      <div className="mt-3 p-3 bg-light rounded">
                        <h6>Payment Details</h6>
                        <div className="row">
                          <div className="col-md-4"><small>Method: {selectedOrder.payment.paymentMethod || 'N/A'}</small></div>
                          <div className="col-md-4"><small>Transaction: {selectedOrder.payment.transactionId || 'N/A'}</small></div>
                          <div className="col-md-4"><small>Date: {selectedOrder.payment.paymentDate ? new Date(selectedOrder.payment.paymentDate).toLocaleDateString() : 'N/A'}</small></div>
                        </div>
                        {selectedOrder.payment.notes && <div className="mt-2"><small>Notes: {selectedOrder.payment.notes}</small></div>}
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>Close</button>
                    {selectedOrder.status === 'Received' && selectedOrder.payment?.status !== 'Paid' && (
                      <button type="button" className="btn btn-success" onClick={() => {
                        setShowOrderModal(false);
                        handleOpenPaymentModal(selectedOrder);
                      }}>Process Payment</button>
                    )}
                  </div>
                </div></div>
              </div>
            )}

            {/* Create Order Form Modal */}
            {showOrderForm && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header bg-success text-white">
                      <h5 className="modal-title">Create New Order</h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setShowOrderForm(false)}></button>
                    </div>
                    <form onSubmit={handleCreateOrder}>
                      <div className="modal-body">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Item ID</label>
                            <input type="text" className="form-control" value={newOrder.item} onChange={(e) => setNewOrder({...newOrder, item: e.target.value})} placeholder="Item ID" />
                            <small className="text-muted">Enter item ID or use item name below</small>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Item Name</label>
                            <input type="text" className="form-control" value={newOrder.itemName} onChange={(e) => setNewOrder({...newOrder, itemName: e.target.value})} placeholder="Item Name" required={!newOrder.item} />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Supplier ID</label>
                            <input type="text" className="form-control" value={newOrder.supplier} onChange={(e) => setNewOrder({...newOrder, supplier: e.target.value})} placeholder="Supplier ID" />
                            <small className="text-muted">Enter supplier ID or use supplier name below</small>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Supplier Name</label>
                            <input type="text" className="form-control" value={newOrder.supplierName} onChange={(e) => setNewOrder({...newOrder, supplierName: e.target.value})} placeholder="Supplier Name" required={!newOrder.supplier} />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Quantity</label>
                            <input type="number" className="form-control" min="1" value={newOrder.quantity} onChange={(e) => setNewOrder({...newOrder, quantity: parseInt(e.target.value) || 1})} required />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Unit Price</label>
                            <input type="number" className="form-control" min="0.01" step="0.01" value={newOrder.unitPrice} onChange={(e) => setNewOrder({...newOrder, unitPrice: parseFloat(e.target.value) || 0})} required />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Total Cost</label>
                            <input type="text" className="form-control" value={`KES ${(newOrder.quantity * newOrder.unitPrice).toLocaleString()}`} disabled />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea className="form-control" rows="2" value={newOrder.description} onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}></textarea>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Estimated Delivery Date</label>
                          <input type="date" className="form-control" value={newOrder.estimatedDelivery} onChange={(e) => setNewOrder({...newOrder, estimatedDelivery: e.target.value})} />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowOrderForm(false)}>Cancel</button>
                        <button type="submit" className="btn btn-success">Create Order</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedOrderForPayment && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                      <h5 className="modal-title">Process Payment</h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setShowPaymentModal(false)}></button>
                    </div>
                    <div className="modal-body">
                      <div className="alert alert-info">
                        <strong>Order:</strong> {selectedOrderForPayment.itemName}<br />
                        <strong>Supplier:</strong> {selectedOrderForPayment.supplierName}<br />
                        <strong>Amount:</strong> KES {selectedOrderForPayment.totalCost?.toLocaleString()}
                      </div>
                      <form onSubmit={(e) => { e.preventDefault(); handleProcessPayment(selectedOrderForPayment._id); }}>
                        <div className="mb-3">
                          <label className="form-label">Payment Method</label>
                          <select className="form-select" value={paymentData.paymentMethod} onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})} required>
                            <option>Bank Transfer</option>
                            <option>Cash</option>
                            <option>Cheque</option>
                            <option>M-Pesa</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Transaction ID</label>
                          <input type="text" className="form-control" value={paymentData.transactionId} onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})} placeholder="Transaction ID" />
                          <small className="text-muted">Required for non-cash payments</small>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Amount Paid</label>
                          <input type="number" className="form-control" value={paymentData.amountPaid} onChange={(e) => setPaymentData({...paymentData, amountPaid: parseFloat(e.target.value) || 0})} required />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Notes</label>
                          <textarea className="form-control" rows="2" value={paymentData.notes} onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary w-100" disabled={updatingOrderStatus}>
                          {updatingOrderStatus ? 'Processing...' : 'Confirm Payment'}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Order Confirmation Modal */}
            {showOrderDeleteModal && orderToDelete && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                      <h5 className="modal-title">⚠️ Confirm Delete Order</h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setShowOrderDeleteModal(false)}></button>
                    </div>
                    <div className="modal-body">
                      <div className="alert alert-warning">
                        <h6 className="alert-heading">Are you sure you want to delete this order?</h6>
                        <p className="mb-1"><strong>Order ID:</strong> {orderToDelete._id?.substring(0, 8)}</p>
                        <p className="mb-1"><strong>Item:</strong> {orderToDelete.itemName}</p>
                        <p className="mb-1"><strong>Supplier:</strong> {orderToDelete.supplierName}</p>
                        <p className="mb-1"><strong>Amount:</strong> KES {orderToDelete.totalCost?.toLocaleString()}</p>
                        <p className="mb-0"><strong>Status:</strong> {orderToDelete.status}</p>
                      </div>
                      <div className="alert alert-danger mt-3">
                        <small>⚠️ <strong>Warning:</strong> This action cannot be undone. All order data will be permanently deleted.</small>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowOrderDeleteModal(false)}
                        disabled={deletingOrderId}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={handleDeleteOrder}
                        disabled={deletingOrderId}
                      >
                        {deletingOrderId ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Deleting...
                          </>
                        ) : (
                          'Yes, Delete Order'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPlaysContent = () => {
    if (!playsDropdownOpen) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: sidebarOpen ? '250px' : '75px', right: 0, bottom: 0, backgroundColor: '#f8f9fa', zIndex: 999, padding: '20px', overflowY: 'auto' }}>
        <div className="card shadow-sm h-100">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">🎭 Plays Management</h5>
              <small className="text-muted">Manage all plays, actors, and material requests</small>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div className="input-group" style={{ width: '250px' }}>
                <input type="text" className="form-control form-control-sm" placeholder="Search plays..." value={playsSearchQuery} onChange={(e) => setPlaysSearchQuery(e.target.value)} />
                {playsSearchQuery && <button className="btn btn-outline-secondary btn-sm" onClick={() => setPlaysSearchQuery("")}>✕</button>}
              </div>
              <div className="d-flex gap-2">
                <button className={`btn btn-sm ${playsView === "all" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPlaysView("all")}>All ({plays.length})</button>
                <button className={`btn btn-sm ${playsView === "upcoming" ? "btn-success" : "btn-outline-success"}`} onClick={() => setPlaysView("upcoming")}>Upcoming ({upcomingPlays})</button>
                <button className={`btn btn-sm ${playsView === "today" ? "btn-warning" : "btn-outline-warning"}`} onClick={() => setPlaysView("today")}>Today ({todayPlays})</button>
                <button className={`btn btn-sm ${playsView === "thisWeek" ? "btn-info" : "btn-outline-info"}`} onClick={() => setPlaysView("thisWeek")}>This Week</button>
                <button className={`btn btn-sm ${playsView === "past" ? "btn-secondary" : "btn-outline-secondary"}`} onClick={() => setPlaysView("past")}>Past ({pastPlays})</button>
              </div>
              <button className="btn btn-sm btn-success" onClick={() => setShowPlayForm(true)}>
                + New Play
              </button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setPlaysDropdownOpen(false)}>Close</button>
            </div>
          </div>

          <div className="card-body" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
            {/* Material Stats Cards */}
            <div className="row mb-4">
              <div className="col-md-2 mb-2"><div className="card p-2 bg-light"><small>Total Plays</small><h5>{totalPlays}</h5></div></div>
              <div className="col-md-2 mb-2"><div className="card p-2 bg-warning bg-opacity-10"><small>Material Pending</small><h5>{materialStats.pending || 0}</h5></div></div>
              <div className="col-md-2 mb-2"><div className="card p-2 bg-info bg-opacity-10"><small>Approved</small><h5>{materialStats.approved || 0}</h5></div></div>
              <div className="col-md-2 mb-2"><div className="card p-2 bg-primary bg-opacity-10"><small>Processing</small><h5>{materialStats.processing || 0}</h5></div></div>
              <div className="col-md-2 mb-2"><div className="card p-2 bg-success bg-opacity-10"><small>Prepared</small><h5>{materialStats.prepared || 0}</h5></div></div>
              <div className="col-md-2 mb-2"><div className="card p-2 bg-secondary bg-opacity-10"><small>Collected</small><h5>{materialStats.collected || 0}</h5></div></div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card p-3">
                  <h6>Plays Overview</h6>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={playPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                        {playPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PLAY_COLORS[index % PLAY_COLORS.length]} />))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card p-3">
                  <h6>Material Requests Status</h6>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={materialPieData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                        {materialPieData.filter(d => d.value > 0).map((entry, index) => (<Cell key={`cell-${index}`} fill={MATERIAL_COLORS[index % MATERIAL_COLORS.length]} />))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span className="text-muted">Showing {filteredPlays.length} play{filteredPlays.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Venue</th>
                    <th>Date</th>
                    <th>Prices (Reg/VIP/VVIP)</th>
                    <th>Actors</th>
                    <th>Materials</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlays.length > 0 ? filteredPlays.map((play) => {
                    const materialCount = play.materialRequests?.length || 0;
                    const pendingMaterials = play.materialRequests?.filter(r => r.status === "pending").length || 0;
                    const materialStats = play.materialStats || { total: 0 };
                    
                    return (
                      <tr key={play._id}>
                        <td>
                          {play.image ? (
                            <img src={`http://localhost:5000${play.image}`} alt={play.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                          ) : (
                            <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '5px' }}>🎭</div>
                          )}
                        </td>
                        <td><strong>{play.title}</strong><br /><small className="text-muted">{play.description?.substring(0, 30)}...</small></td>
                        <td>{play.venue}</td>
                        <td>
                          {new Date(play.date).toLocaleDateString()}<br />
                          <small className={new Date(play.date) < new Date() ? 'text-danger' : 'text-success'}>
                            {new Date(play.date) < new Date() ? 'Past' : 'Upcoming'}
                          </small>
                        </td>
                        <td>
                          <span className="badge bg-info me-1">Reg: KES {play.regularPrice}</span>
                          <span className="badge bg-warning me-1">VIP: KES {play.vipPrice}</span>
                          <span className="badge bg-success">VVIP: KES {play.vvipPrice}</span>
                        </td>
                        <td>
                          <span className="badge bg-primary">{play.actors?.length || 0} assigned</span>
                        </td>
                        <td>
                          <span className="badge bg-secondary me-1">Total: {materialStats.total || 0}</span>
                          {pendingMaterials > 0 && <span className="badge bg-warning">Pending: {pendingMaterials}</span>}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary" onClick={() => handleViewPlay(play)}>View</button>
                            <button className="btn btn-outline-info" onClick={() => handleOpenMaterialModal(play)}>Materials</button>
                            <button 
                              className="btn btn-outline-danger" 
                              onClick={() => confirmDeletePlay(play)}
                              disabled={deletingPlayId === play._id}
                            >
                              {deletingPlayId === play._id ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                "Delete"
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan="8" className="text-center py-4"><div className="text-muted"><span className="display-4">🎭</span><h5>No plays found</h5><p>No plays match your criteria</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Play Details Modal */}
            {showPlayModal && selectedPlay && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Play Details</h5>
                      <button type="button" className="btn-close" onClick={() => setShowPlayModal(false)}></button>
                    </div>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-4">
                          {selectedPlay.image ? (
                            <img src={`http://localhost:5000${selectedPlay.image}`} alt={selectedPlay.title} style={{ width: '100%', borderRadius: '10px' }} />
                          ) : (
                            <div style={{ width: '100%', height: '150px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>🎭 No Image</div>
                          )}
                        </div>
                        <div className="col-md-8">
                          <h4>{selectedPlay.title}</h4>
                          <p>{selectedPlay.description}</p>
                          <p><strong>Venue:</strong> {selectedPlay.venue}</p>
                          <p><strong>Date:</strong> {new Date(selectedPlay.date).toLocaleString()}</p>
                          <p><strong>Prices:</strong> Regular: KES {selectedPlay.regularPrice}, VIP: KES {selectedPlay.vipPrice}, VVIP: KES {selectedPlay.vvipPrice}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h6>Assigned Actors</h6>
                        {selectedPlay.actors && selectedPlay.actors.length > 0 ? (
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Actor</th>
                                <th>Role</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPlay.actors.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{item.actor?.fullName || item.actor?.name || 'N/A'}</td>
                                  <td>{item.role}</td>
                                  <td><span className={`badge ${item.confirmed ? 'bg-success' : 'bg-warning'}`}>{item.confirmed ? 'Confirmed' : 'Pending'}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-muted">No actors assigned</p>
                        )}
                      </div>

                      <div className="mt-4">
                        <h6>Material Requests</h6>
                        {selectedPlay.materialRequests && selectedPlay.materialRequests.length > 0 ? (
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Actor</th>
                                <th>Materials</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPlay.materialRequests.map((req, idx) => (
                                <tr key={idx}>
                                  <td>{req.actor?.fullName || req.actor?.name || 'N/A'}</td>
                                  <td>
                                    {req.materials?.map((m, i) => (
                                      <span key={i} className="badge bg-secondary me-1">{m.name} x{m.quantity}</span>
                                    ))}
                                  </td>
                                  <td>
                                    <span className={`badge ${
                                      req.status === 'approved' ? 'bg-success' :
                                      req.status === 'processing' ? 'bg-info' :
                                      req.status === 'prepared' ? 'bg-primary' :
                                      req.status === 'collected' ? 'bg-secondary' :
                                      req.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                                    }`}>
                                      {req.status || 'pending'}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="btn-group btn-group-sm">
                                      {req.status === 'pending' && (
                                        <>
                                          <button className="btn btn-outline-success" onClick={() => updateMaterialRequestStatus(selectedPlay._id, req._id, 'approve')}>Approve</button>
                                          <button className="btn btn-outline-danger" onClick={() => updateMaterialRequestStatus(selectedPlay._id, req._id, 'reject')}>Reject</button>
                                        </>
                                      )}
                                      {req.status === 'approved' && (
                                        <button className="btn btn-outline-info" onClick={() => updateMaterialRequestStatus(selectedPlay._id, req._id, 'processing')}>Process</button>
                                      )}
                                      {req.status === 'processing' && (
                                        <button className="btn btn-outline-primary" onClick={() => updateMaterialRequestStatus(selectedPlay._id, req._id, 'prepare')}>Prepare</button>
                                      )}
                                      {req.status === 'prepared' && (
                                        <button className="btn btn-outline-secondary" onClick={() => updateMaterialRequestStatus(selectedPlay._id, req._id, 'collect')}>Collected</button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-muted">No material requests</p>
                        )}
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowPlayModal(false)}>Close</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Material Requests Modal */}
            {showMaterialModal && selectedPlayForMaterials && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header bg-info text-white">
                      <h5 className="modal-title">Material Requests for {selectedPlayForMaterials.title}</h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setShowMaterialModal(false)}></button>
                    </div>
                    <div className="modal-body">
                      {selectedPlayForMaterials.materialRequests && selectedPlayForMaterials.materialRequests.length > 0 ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Actor</th>
                              <th>Materials</th>
                              <th>Requested</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedPlayForMaterials.materialRequests.map((req) => (
                              <tr key={req._id}>
                                <td>{req.actor?.fullName || req.actor?.name || 'N/A'}</td>
                                <td>
                                  {req.materials?.map((m, i) => (
                                    <div key={i}>{m.name} x {m.quantity} {m.unit || 'pcs'}</div>
                                  ))}
                                </td>
                                <td>{new Date(req.requestedAt).toLocaleDateString()}</td>
                                <td>
                                  <span className={`badge ${
                                    req.status === 'approved' ? 'bg-success' :
                                    req.status === 'processing' ? 'bg-info' :
                                    req.status === 'prepared' ? 'bg-primary' :
                                    req.status === 'collected' ? 'bg-secondary' :
                                    req.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                                  }`}>
                                    {req.status || 'pending'}
                                  </span>
                                </td>
                                <td>
                                  <div className="btn-group btn-group-sm">
                                    {req.status === 'pending' && (
                                      <>
                                        <button className="btn btn-outline-success" onClick={() => updateMaterialRequestStatus(selectedPlayForMaterials._id, req._id, 'approve')}>Approve</button>
                                        <button className="btn btn-outline-danger" onClick={() => updateMaterialRequestStatus(selectedPlayForMaterials._id, req._id, 'reject')}>Reject</button>
                                      </>
                                    )}
                                    {req.status === 'approved' && (
                                      <button className="btn btn-outline-info" onClick={() => updateMaterialRequestStatus(selectedPlayForMaterials._id, req._id, 'processing')}>Process</button>
                                    )}
                                    {req.status === 'processing' && (
                                      <button className="btn btn-outline-primary" onClick={() => updateMaterialRequestStatus(selectedPlayForMaterials._id, req._id, 'prepare')}>Prepare</button>
                                    )}
                                    {req.status === 'prepared' && (
                                      <button className="btn btn-outline-secondary" onClick={() => updateMaterialRequestStatus(selectedPlayForMaterials._id, req._id, 'collect')}>Collected</button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-center">No material requests for this play</p>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowMaterialModal(false)}>Close</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Create Play Form Modal */}
            {showPlayForm && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header bg-success text-white">
                      <h5 className="modal-title">Create New Play</h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setShowPlayForm(false)}></button>
                    </div>
                    <form onSubmit={handleCreatePlay} encType="multipart/form-data">
                      <div className="modal-body">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Title *</label>
                            <input type="text" className="form-control" value={newPlay.title} onChange={(e) => setNewPlay({...newPlay, title: e.target.value})} required />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Venue *</label>
                            <input type="text" className="form-control" value={newPlay.venue} onChange={(e) => setNewPlay({...newPlay, venue: e.target.value})} required />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Description *</label>
                          <textarea className="form-control" rows="3" value={newPlay.description} onChange={(e) => setNewPlay({...newPlay, description: e.target.value})} required></textarea>
                        </div>
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Date & Time *</label>
                            <input type="datetime-local" className="form-control" value={newPlay.date} onChange={(e) => setNewPlay({...newPlay, date: e.target.value})} required />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Regular Price (KES) *</label>
                            <input type="number" className="form-control" min="0" value={newPlay.regularPrice} onChange={(e) => setNewPlay({...newPlay, regularPrice: parseFloat(e.target.value) || 0})} required />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">VIP Price (KES) *</label>
                            <input type="number" className="form-control" min="0" value={newPlay.vipPrice} onChange={(e) => setNewPlay({...newPlay, vipPrice: parseFloat(e.target.value) || 0})} required />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">VVIP Price (KES) *</label>
                            <input type="number" className="form-control" min="0" value={newPlay.vvipPrice} onChange={(e) => setNewPlay({...newPlay, vvipPrice: parseFloat(e.target.value) || 0})} required />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Play Image</label>
                            <input type="file" className="form-control" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} />
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowPlayForm(false)}>Cancel</button>
                        <button type="submit" className="btn btn-success">Create Play</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Play Confirmation Modal */}
            {showPlayDeleteModal && playToDelete && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                      <h5 className="modal-title">⚠️ Confirm Delete Play</h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setShowPlayDeleteModal(false)}></button>
                    </div>
                    <div className="modal-body">
                      <div className="alert alert-warning">
                        <h6 className="alert-heading">Are you sure you want to delete this play?</h6>
                        <p className="mb-1"><strong>Title:</strong> {playToDelete.title}</p>
                        <p className="mb-1"><strong>Venue:</strong> {playToDelete.venue}</p>
                        <p className="mb-1"><strong>Date:</strong> {new Date(playToDelete.date).toLocaleDateString()}</p>
                        <p className="mb-0"><strong>Status:</strong> {new Date(playToDelete.date) < new Date() ? 'Past' : 'Upcoming'}</p>
                      </div>
                      <div className="alert alert-danger mt-3">
                        <small>⚠️ <strong>Warning:</strong> This will also delete all associated actor assignments and material requests.</small>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowPlayDeleteModal(false)}
                        disabled={deletingPlayId}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={handleDeletePlay}
                        disabled={deletingPlayId}
                      >
                        {deletingPlayId ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Deleting...
                          </>
                        ) : (
                          'Yes, Delete Play'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
            <button className="btn btn-dark w-100 text-start d-flex align-items-center" onClick={toggleOrdersDropdown} style={{ paddingLeft: "0" }}>
              <span className="me-2">📦</span>{sidebarOpen && <span>Orders</span>}{sidebarOpen && <span className="ms-auto">{ordersDropdownOpen ? "▲" : "▼"}</span>}
            </button>
          </li>
          <li className="nav-item mb-2">
            <button className="btn btn-dark w-100 text-start d-flex align-items-center" onClick={togglePlaysDropdown} style={{ paddingLeft: "0" }}>
              <span className="me-2">🎭</span>{sidebarOpen && <span>Plays</span>}{sidebarOpen && <span className="ms-auto">{playsDropdownOpen ? "▲" : "▼"}</span>}
            </button>
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
          <div className="col-md-3 mb-3"><div className="card shadow-sm p-3 hover-card border-success border-top"><div className="d-flex justify-content-between align-items-center"><div><h6 className="text-muted">Total Plays</h6><h3 className="text-success">{totalPlays}</h3><small className="text-muted">{upcomingPlays} upcoming</small></div><span className="display-6">🎭</span></div></div></div>
        </div>

        {/* Second Row Stats */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3"><div className="card shadow-sm p-3"><div className="d-flex align-items-center"><div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3"><span className="display-6">📋</span></div><div><h6 className="text-muted mb-1">Pending Orders</h6><h3 className="mb-0">{pendingOrders}</h3><small className="text-warning">Awaiting approval</small></div></div></div></div>
          <div className="col-md-3 mb-3"><div className="card shadow-sm p-3"><div className="d-flex align-items-center"><div className="bg-success bg-opacity-10 p-3 rounded-circle me-3"><span className="display-6">💰</span></div><div><h6 className="text-muted mb-1">Paid Orders</h6><h3 className="mb-0">{paidOrders}</h3><small className="text-success">KES {paidOrderValue.toLocaleString()}</small></div></div></div></div>
          <div className="col-md-3 mb-3"><div className="card shadow-sm p-3"><div className="d-flex align-items-center"><div className="bg-info bg-opacity-10 p-3 rounded-circle me-3"><span className="display-6">🎟️</span></div><div><h6 className="text-muted mb-1">Total Bookings</h6><h3 className="mb-0">{totalBookings}</h3><small className="text-success">KES {totalRevenue.toLocaleString()}</small></div></div></div></div>
          <div className="col-md-3 mb-3"><div className="card shadow-sm p-3"><div className="d-flex align-items-center"><div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3"><span className="display-6">🎭</span></div><div><h6 className="text-muted mb-1">Upcoming Plays</h6><h3 className="mb-0">{upcomingPlays}</h3><small className="text-primary">{todayPlays} today</small></div></div></div></div>
        </div>

        {/* Charts Row */}
        <div className="row mb-4">
          <div className="col-lg-6 mb-4"><div className="card shadow-sm p-3 h-100"><h5 className="mb-3 d-flex justify-content-between align-items-center"><span>📈 Growth Trends</span><small className="text-muted">Last 4 months</small></h5><ResponsiveContainer width="100%" height={250}><LineChart data={lineData}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="month" stroke="#666" /><YAxis stroke="#666" /><Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} /><Legend /><Line type="monotone" dataKey="Users" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} /><Line type="monotone" dataKey="Bookings" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} /><Line type="monotone" dataKey="Orders" stroke="#ffc658" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} /><Line type="monotone" dataKey="Plays" stroke="#ff6b6b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div></div>
          <div className="col-lg-3 mb-4"><div className="card shadow-sm p-3 h-100"><h5 className="mb-3">👥 User Distribution</h5><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={userPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={(entry) => `${entry.name}: ${entry.value}`}>{userPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="mt-3 text-center"><h6 className="text-muted">Total Users: {users.length}</h6></div></div></div>
          <div className="col-lg-3 mb-4"><div className="card shadow-sm p-3 h-100"><h5 className="mb-3">🎭 Plays Overview</h5><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={playPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={(entry) => `${entry.name}: ${entry.value}`}>{playPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PLAY_COLORS[index % PLAY_COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="mt-3 text-center"><h6 className="text-muted">Total Plays: {totalPlays}</h6></div></div></div>
        </div>

        {/* Full Screen Overlays */}
        {renderTicketsContent()}
        {renderOrdersContent()}
        {renderPlaysContent()}

        {/* Recent Tables (only shown when dropdowns are closed) */}
        {!ticketsDropdownOpen && !ordersDropdownOpen && !playsDropdownOpen && (
          <>
            <div className="row mb-4">
              <div className="col-4"><div className="card shadow-sm"><div className="card-header bg-white d-flex justify-content-between align-items-center"><h5 className="mb-0">📋 Recent Bookings</h5><button className="btn btn-sm btn-outline-primary" onClick={() => setTicketsDropdownOpen(true)}>Manage All</button></div><div className="card-body p-0">
                {recentBookings.length > 0 ? (<div className="table-responsive"><table className="table table-hover mb-0"><thead className="table-light"><tr><th>Booking</th><th>Customer</th><th>Amount</th><th>Booking Status</th><th>Payment Status</th></tr></thead><tbody>
                  {recentBookings.map((booking) => (<tr key={booking._id || booking.id}>
                    <td><small>{booking.bookingReference || booking._id?.substring(0, 6)}</small></td>
                    <td>{booking.customerName || "N/A"}</td>
                    <td><strong>KES {booking.totalPrice?.toLocaleString() || 0}</strong></td>
                    <td>
                      <span className={`badge ${
                        booking.status === 'confirmed' ? 'bg-success' :
                        booking.status === 'cancelled' ? 'bg-danger' :
                        booking.status === 'checked_in' ? 'bg-info' :
                        booking.status === 'completed' ? 'bg-primary' :
                        'bg-warning'
                      }`}>
                        {booking.status || 'pending'}
                      </span>
                    </td>
                    <td><span className={`badge ${booking.paymentStatus === 'approved' ? 'bg-success' : 'bg-warning'}`}>{booking.paymentStatus || 'pending'}</span></td>
                  </tr>))}
                </tbody></table></div>) : (<div className="text-center py-4"><span className="display-4">🎭</span><h5>No bookings yet</h5></div>)}
              </div></div></div>
              <div className="col-4"><div className="card shadow-sm"><div className="card-header bg-white d-flex justify-content-between align-items-center"><h5 className="mb-0">📦 Recent Orders</h5><button className="btn btn-sm btn-outline-primary" onClick={() => setOrdersDropdownOpen(true)}>Manage All</button></div><div className="card-body p-0">
                {recentOrders.length > 0 ? (<div className="table-responsive"><table className="table table-hover mb-0"><thead className="table-light"><tr><th>Order</th><th>Item</th><th>Total</th><th>Status</th></tr></thead><tbody>
                  {recentOrders.map((order) => (<tr key={order._id}>
                    <td><small>{order._id?.substring(0, 6)}</small></td>
                    <td>{order.itemName}</td>
                    <td><strong>KES {order.totalCost?.toLocaleString()}</strong></td>
                    <td><span className={`badge ${order.status === 'Pending' ? 'bg-warning' : order.status === 'Approved' ? 'bg-info' : order.status === 'Delivered' ? 'bg-success' : 'bg-secondary'}`}>{order.status}</span></td>
                  </tr>))}
                </tbody></table></div>) : (<div className="text-center py-4"><span className="display-4">📦</span><h5>No orders yet</h5></div>)}
              </div></div></div>
              <div className="col-4"><div className="card shadow-sm"><div className="card-header bg-white d-flex justify-content-between align-items-center"><h5 className="mb-0">🎭 Recent Plays</h5><button className="btn btn-sm btn-outline-primary" onClick={() => setPlaysDropdownOpen(true)}>Manage All</button></div><div className="card-body p-0">
                {recentPlays.length > 0 ? (<div className="table-responsive"><table className="table table-hover mb-0"><thead className="table-light"><tr><th>Title</th><th>Venue</th><th>Date</th><th>Status</th></tr></thead><tbody>
                  {recentPlays.map((play) => (<tr key={play._id}>
                    <td><small>{play.title}</small></td>
                    <td>{play.venue}</td>
                    <td><small>{new Date(play.date).toLocaleDateString()}</small></td>
                    <td><span className={`badge ${new Date(play.date) > new Date() ? 'bg-success' : 'bg-secondary'}`}>{new Date(play.date) > new Date() ? 'Upcoming' : 'Past'}</span></td>
                  </tr>))}
                </tbody></table></div>) : (<div className="text-center py-4"><span className="display-4">🎭</span><h5>No plays yet</h5></div>)}
              </div></div></div>
            </div>
          </>
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