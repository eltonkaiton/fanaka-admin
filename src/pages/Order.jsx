import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  IoAddCircleOutline,
  IoRefresh,
  IoClose,
  IoBusinessOutline,
  IoCubeOutline,
  IoPricetagOutline,
  IoCalculatorOutline,
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoCarOutline,
  IoCheckmarkDoneCircle,
  IoCashOutline,
  IoTimeOutline,
  IoSendOutline,
  IoInformationCircleOutline,
  IoCartOutline,
  IoSearchOutline,
  IoReceiptOutline,
} from 'react-icons/io5';

const API = 'http://localhost:5000';

// ----- Constants -----
const STATUS_COLORS = {
  pending: '#f39c12',
  approved: '#3498db',
  processing: '#9b59b6',
  delivered: '#2ecc71',
  received: '#27ae60',
  'payment pending': '#e67e22',
  paid: '#16a085',
  rejected: '#e74c3c',
  cancelled: '#95a5a6',
};

const PAYMENT_STATUS_COLORS = {
  paid: '#2ecc71',
  submitted: '#f39c12',
  approved: '#3498db',
  rejected: '#e74c3c',
};

// ----- Helper Components -----
const StatusBadge = ({ status }) => {
  const color = STATUS_COLORS[status?.toLowerCase()] || '#f39c12';
  return (
    <span style={{ ...styles.badge, backgroundColor: color }}>
      {status ? status.toUpperCase() : 'PENDING'}
    </span>
  );
};

const formatCurrency = (amount) =>
  `KES ${parseFloat(amount || 0).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function Order() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Toast and confirmation state
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [confirm, setConfirm] = useState({ show: false, message: '', onConfirm: null });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirm({ show: true, message, onConfirm });
  };

  const [newOrder, setNewOrder] = useState({
    item: '',
    itemName: '',
    supplier: '',
    supplierName: '',
    quantity: '',
    unitPrice: '',
    totalCost: '',
  });

  // ----- Data Fetching -----
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/orders`);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log('Error fetching orders:', err.message);
      showToast('Failed to load orders', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API}/api/items`);
      setItems(res.data || []);
    } catch (err) {
      console.log('Error fetching items:', err.message);
      showToast('Failed to load items', 'error');
      setItems([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API}/api/employees/department/supplier`);
      setSuppliers(res.data || []);
    } catch (err) {
      console.log('Error fetching suppliers:', err.message);
      showToast('Failed to load suppliers', 'error');
      setSuppliers([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchItems();
    fetchSuppliers();
  }, []);

  // ----- Actions -----
  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
    fetchItems();
  };

  const markAsDelivered = async (id) => {
    showConfirm('Mark this order as delivered?', async () => {
      try {
        await axios.put(`${API}/api/orders/${id}/deliver`);
        showToast('Order marked as delivered', 'success');
        fetchOrders();
      } catch (err) {
        showToast('Failed to mark as delivered', 'error');
      }
    });
  };

  const markAsReceived = async (id) => {
    showConfirm('Mark this order as received in inventory?', async () => {
      try {
        await axios.put(`${API}/api/orders/${id}/receive`);
        showToast('Order marked as received. Ready for payment submission.', 'success');
        fetchOrders();
        fetchItems();
      } catch (err) {
        console.log('Error marking as received:', err.message);
        showToast(err.response?.data?.message || 'Failed to mark order as received', 'error');
      }
    });
  };

  const submitPaymentRequest = (order) => {
    setSelectedOrder(order);
    setPaymentModalVisible(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedOrder) return;
    try {
      const userId = 'current_user_id'; // Replace with actual auth
      const userName = 'Inventory User';
      const paymentRequest = {
        userId,
        userName,
        paymentMethod: 'Bank Transfer',
        amount: selectedOrder.totalCost || selectedOrder.quantity * selectedOrder.unitPrice,
        notes: 'Payment request submitted by inventory department',
      };
      await axios.put(`${API}/api/orders/${selectedOrder._id}/submit-payment`, paymentRequest);
      showToast('Payment request submitted to Finance Department.', 'success');
      setPaymentModalVisible(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.log('Submit payment error:', err.message);
      showToast(err.response?.data?.message || 'Failed to submit payment request', 'error');
    }
  };

  // Receipt generation
  const viewReceipt = (order) => {
    const itemName = order.item?.name || order.itemName || 'N/A';
    const supplierName = order.supplier?.fullName || order.supplier || 'N/A';
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
            <p><strong>Status:</strong> ${order.status}</p>
            <p><em>Thank you for your business!</em></p>
            <button class="print-btn" onclick="window.print()">Print Receipt</button>
          </div>
        </body>
      </html>
    `);
    receiptWindow.document.close();
  };

  // Order creation helpers
  const calcTotal = (qty, cost) => {
    const q = parseFloat(qty) || 0;
    const c = parseFloat(cost) || 0;
    const total = (q * c).toFixed(2);
    setNewOrder((prev) => ({ ...prev, totalCost: total }));
  };

  const createOrder = async () => {
    const { item, supplier, quantity, unitPrice } = newOrder;
    if (!item || !supplier || !quantity || !unitPrice) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    if (parseFloat(quantity) <= 0 || parseFloat(unitPrice) <= 0) {
      showToast('Quantity and unit price must be greater than 0', 'error');
      return;
    }
    try {
      setIsCreating(true);
      await axios.post(`${API}/api/orders`, {
        item,
        supplier,
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice),
      });
      showToast('Order created successfully', 'success');
      setModalVisible(false);
      resetForm();
      fetchOrders();
    } catch (err) {
      console.log('Create order error:', err.response?.data || err.message);
      showToast(err.response?.data?.message || 'Failed to create order', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setNewOrder({
      item: '',
      itemName: '',
      supplier: '',
      supplierName: '',
      quantity: '',
      unitPrice: '',
      totalCost: '',
    });
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const itemName = order.item?.name || order.itemName || '';
    const supplierName = order.supplier?.fullName || order.supplier || '';
    const id = order._id || '';
    const term = searchTerm.toLowerCase();
    return (
      itemName.toLowerCase().includes(term) ||
      supplierName.toLowerCase().includes(term) ||
      id.toLowerCase().includes(term)
    );
  });

  // ----- Render Single Order -----
  const renderOrder = (order) => {
    const total = order.totalCost || order.quantity * order.unitPrice;
    const payment = order.payment || {};

    return (
      <div key={order._id} style={styles.card}>
        <div style={styles.rowBetween}>
          <div style={styles.itemHeader}>
            <h3 style={styles.title}>{order.item?.name || order.itemName || 'Unknown Item'}</h3>
            <span style={styles.orderId}>ID: {order._id?.slice(-6)}</span>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div style={styles.detailRow}>
          <IoBusinessOutline size={16} color="#666" />
          <span style={styles.detailText}>Supplier: {order.supplier?.fullName || order.supplier || 'Unknown'}</span>
        </div>
        <div style={styles.detailRow}>
          <IoCubeOutline size={16} color="#666" />
          <span style={styles.detailText}>Quantity: {order.quantity}</span>
        </div>
        <div style={styles.detailRow}>
          <IoPricetagOutline size={16} color="#666" />
          <span style={styles.detailText}>Unit Price: {formatCurrency(order.unitPrice)}</span>
        </div>
        <div style={styles.detailRow}>
          <IoCalculatorOutline size={16} color="#333" />
          <span style={styles.totalCost}>Total: {formatCurrency(total)}</span>
        </div>

        {order.deliveryDate && (
          <div style={styles.detailRow}>
            <IoCalendarOutline size={16} color="#666" />
            <span style={styles.detailText}>Delivered: {formatDate(order.deliveryDate)}</span>
          </div>
        )}
        {order.receivedAt && (
          <div style={styles.detailRow}>
            <IoCheckmarkDoneCircle size={16} color="#27ae60" />
            <span style={{ ...styles.detailText, color: '#27ae60' }}>Received: {formatDate(order.receivedAt)}</span>
          </div>
        )}

        {/* Payment status */}
        {payment.status && payment.status !== 'Pending' && (
          <div style={styles.paymentStatusRow}>
            <IoCashOutline size={16} color={PAYMENT_STATUS_COLORS[payment.status.toLowerCase()] || '#666'} />
            <span style={{ ...styles.detailText, color: PAYMENT_STATUS_COLORS[payment.status.toLowerCase()] || '#666' }}>
              Payment: {payment.status} {payment.submittedAt && `(${formatDate(payment.submittedAt)})`}
            </span>
          </div>
        )}

        <span style={styles.dateText}>Ordered: {formatDate(order.createdAt)}</span>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          {order.status === 'Approved' && (
            <button style={styles.deliverBtn} onClick={() => markAsDelivered(order._id)}>
              <IoCarOutline size={18} color="#fff" />
              <span style={styles.btnText}>Mark Delivered</span>
            </button>
          )}

          {/* "Mark as Received" button – appears when status is "Delivered" */}
          {order.status === 'delivered' && (
            <button style={styles.receiveBtn} onClick={() => markAsReceived(order._id)}>
              <IoCheckmarkDoneCircle size={18} color="#fff" />
              <span style={styles.btnText}>Mark as Received</span>
            </button>
          )}

          {order.status === 'Received' && payment.status === 'Pending' && (
            <button style={styles.paymentBtn} onClick={() => submitPaymentRequest(order)}>
              <IoCashOutline size={18} color="#fff" />
              <span style={styles.btnText}>Submit Payment Request</span>
            </button>
          )}

          {order.status === 'Received' && payment.status === 'Submitted' && (
            <div style={styles.paymentSubmitted}>
              <IoTimeOutline size={20} color="#3498db" />
              <div>
                <p style={styles.paymentSubmittedText}>Payment Request Submitted ✓</p>
                <p style={styles.paymentSubmittedSubtext}>Awaiting finance approval</p>
              </div>
            </div>
          )}

          {order.status === 'Received' && payment.status === 'Approved' && (
            <div style={styles.paymentApproved}>
              <IoCheckmarkCircle size={20} color="#3498db" />
              <div>
                <p style={styles.paymentSubmittedText}>Payment Approved ✓</p>
                <p style={styles.paymentSubmittedSubtext}>Finance processing payment</p>
              </div>
            </div>
          )}

          {(order.status === 'Received' && payment.status === 'Paid') || order.status === 'Paid' ? (
            <div style={styles.paymentPaid}>
              <IoCheckmarkDoneCircle size={20} color="#2ecc71" />
              <div>
                <p style={{ ...styles.paymentSubmittedText, color: '#2ecc71' }}>Payment Completed ✓</p>
                <p style={styles.paymentSubmittedSubtext}>Order fully closed</p>
              </div>
            </div>
          ) : null}

          {/* Receipt button for all orders */}
          <button style={styles.receiptBtn} onClick={() => viewReceipt(order)}>
            <IoReceiptOutline size={18} color="#6200EE" />
            <span style={styles.receiptBtnText}>Receipt</span>
          </button>
        </div>
      </div>
    );
  };

  // ----- Main Render -----
  if (loading && !refreshing) {
    return (
      <div style={styles.loader}>
        <div className="spinner"></div>
        <p style={styles.loadingText}>Loading orders...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Inventory Orders</h1>
        <div style={styles.headerButtons}>
          <div style={styles.searchWrapper}>
            <IoSearchOutline size={18} color="#666" />
            <input
              type="text"
              placeholder="Search by item, supplier, or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button style={styles.refreshBtn} onClick={onRefresh}>
            <IoRefresh size={20} color="#6200EE" />
          </button>
          <button style={styles.addBtn} onClick={() => setModalVisible(true)}>
            <IoAddCircleOutline size={20} color="#fff" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div style={styles.listContainer}>
        {filteredOrders.length === 0 ? (
          <div style={styles.emptyContainer}>
            <IoCubeOutline size={60} color="#ccc" />
            <p style={styles.emptyText}>No orders found</p>
            <p style={styles.emptySubtext}>
              {searchTerm ? 'Try a different search term' : 'Create your first order'}
            </p>
          </div>
        ) : (
          filteredOrders.map(renderOrder)
        )}
      </div>

      {/* Create Order Modal */}
      {modalVisible && (
        <div style={styles.modalOverlay} onClick={() => setModalVisible(false)}>
          <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Order</h2>
              <button style={styles.modalClose} onClick={() => { setModalVisible(false); resetForm(); }}>
                <IoClose size={24} color="#666" />
              </button>
            </div>
            <div style={styles.modalContent}>
              {/* Item */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Select Item *</label>
                <select
                  style={styles.select}
                  value={newOrder.item}
                  onChange={(e) => {
                    const selected = items.find(i => i._id === e.target.value);
                    setNewOrder({ ...newOrder, item: e.target.value, itemName: selected?.name || '' });
                  }}
                >
                  <option value="">Choose an item...</option>
                  {items.map(item => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.currentStock || item.quantity || 0} {item.unit || 'pcs'} available)
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Select Supplier *</label>
                <select
                  style={styles.select}
                  value={newOrder.supplier}
                  onChange={(e) => {
                    const selected = suppliers.find(s => s._id === e.target.value);
                    setNewOrder({ ...newOrder, supplier: e.target.value, supplierName: selected?.fullName || '' });
                  }}
                >
                  <option value="">Choose a supplier...</option>
                  {suppliers.map(supplier => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.fullName} - {supplier.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Quantity *</label>
                <div style={styles.inputWithIcon}>
                  <IoCubeOutline size={20} color="#666" style={styles.inputIcon} />
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="Enter quantity"
                    value={newOrder.quantity}
                    onChange={(e) => {
                      setNewOrder({ ...newOrder, quantity: e.target.value });
                      calcTotal(e.target.value, newOrder.unitPrice);
                    }}
                  />
                </div>
              </div>

              {/* Unit Price */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Unit Price (KES) *</label>
                <div style={styles.inputWithIcon}>
                  <IoPricetagOutline size={20} color="#666" style={styles.inputIcon} />
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="Enter unit price"
                    value={newOrder.unitPrice}
                    onChange={(e) => {
                      setNewOrder({ ...newOrder, unitPrice: e.target.value });
                      calcTotal(newOrder.quantity, e.target.value);
                    }}
                  />
                </div>
              </div>

              {/* Total */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Total Cost</label>
                <div style={styles.totalDisplay}>
                  <IoCalculatorOutline size={24} color="#6200EE" />
                  <span style={styles.totalText}>{formatCurrency(newOrder.totalCost)}</span>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => { setModalVisible(false); resetForm(); }}>
                Cancel
              </button>
              <button
                style={{
                  ...styles.createButton,
                  ...((!newOrder.item || !newOrder.supplier || !newOrder.quantity || !newOrder.unitPrice) && styles.createButtonDisabled),
                }}
                onClick={createOrder}
                disabled={!newOrder.item || !newOrder.supplier || !newOrder.quantity || !newOrder.unitPrice || isCreating}
              >
                {isCreating ? (
                  <div className="spinner-small" />
                ) : (
                  <>
                    <IoCartOutline size={20} color="#fff" />
                    <span style={styles.createButtonText}>Create Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Submission Modal */}
      {paymentModalVisible && selectedOrder && (
        <div style={styles.modalOverlay} onClick={() => setPaymentModalVisible(false)}>
          <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Submit Payment Request to Finance</h2>
              <button style={styles.modalClose} onClick={() => setPaymentModalVisible(false)}>
                <IoClose size={24} color="#666" />
              </button>
            </div>
            <div style={styles.modalContent}>
              <div style={styles.paymentSummary}>
                <h3 style={styles.paymentSummaryTitle}>Order Details</h3>
                <div style={styles.paymentDetailRow}>
                  <span style={styles.paymentDetailLabel}>Item:</span>
                  <span style={styles.paymentDetailValue}>
                    {selectedOrder.item?.name || selectedOrder.itemName || 'Unknown'}
                  </span>
                </div>
                <div style={styles.paymentDetailRow}>
                  <span style={styles.paymentDetailLabel}>Supplier:</span>
                  <span style={styles.paymentDetailValue}>
                    {selectedOrder.supplier?.fullName || selectedOrder.supplier || 'Unknown'}
                  </span>
                </div>
                <div style={styles.paymentDetailRow}>
                  <span style={styles.paymentDetailLabel}>Quantity:</span>
                  <span style={styles.paymentDetailValue}>{selectedOrder.quantity}</span>
                </div>
                <div style={styles.paymentDetailRow}>
                  <span style={styles.paymentDetailLabel}>Unit Price:</span>
                  <span style={styles.paymentDetailValue}>{formatCurrency(selectedOrder.unitPrice)}</span>
                </div>
                <div style={{ ...styles.paymentDetailRow, ...styles.totalPaymentRow }}>
                  <span style={styles.totalPaymentLabel}>Total Amount Due:</span>
                  <span style={styles.totalPaymentValue}>
                    {formatCurrency(selectedOrder.totalCost || selectedOrder.quantity * selectedOrder.unitPrice)}
                  </span>
                </div>
              </div>
              <div style={styles.infoBox}>
                <IoInformationCircleOutline size={20} color="#3498db" />
                <span style={styles.infoText}>
                  This will submit a payment request to the Finance Department. The finance team will review,
                  approve, and process the actual payment. You cannot process payments directly from Inventory.
                </span>
              </div>
              <div style={styles.infoBox}>
                <IoTimeOutline size={20} color="#f39c12" />
                <span style={styles.infoText}>
                  After submission, the order status will change to "Payment Submitted". The finance team will
                  update the status to "Approved" once they review and to "Paid" once payment is processed.
                </span>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setPaymentModalVisible(false)}>
                Cancel
              </button>
              <button style={styles.createButton} onClick={handlePaymentSubmit}>
                <IoSendOutline size={20} color="#fff" />
                <span style={styles.createButtonText}>Submit to Finance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            ...styles.toast,
            ...(toast.type === 'success' ? styles.toastSuccess : {}),
            ...(toast.type === 'error' ? styles.toastError : {}),
            ...(toast.type === 'info' ? styles.toastInfo : {}),
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirm.show && (
        <div style={styles.confirmOverlay} onClick={() => setConfirm({ show: false, message: '', onConfirm: null })}>
          <div style={styles.confirmContent} onClick={(e) => e.stopPropagation()}>
            <p>{confirm.message}</p>
            <div style={styles.confirmButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => setConfirm({ show: false, message: '', onConfirm: null })}
              >
                Cancel
              </button>
              <button
                style={styles.confirmButton}
                onClick={() => {
                  confirm.onConfirm();
                  setConfirm({ show: false, message: '', onConfirm: null });
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----- Styles -----
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    flexWrap: 'wrap',
    gap: '10px',
  },
  headerTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    padding: '0 10px',
    height: '40px',
  },
  searchInput: {
    border: 'none',
    background: 'none',
    outline: 'none',
    padding: '8px',
    fontSize: '14px',
    width: '200px',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#6200EE',
    padding: '8px 15px',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  loader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh',
  },
  loadingText: {
    marginTop: '12px',
    fontSize: '16px',
    color: '#666',
  },
  listContainer: {
    padding: '16px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  rowBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  itemHeader: {
    flex: 1,
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 4px',
  },
  orderId: {
    fontSize: '12px',
    color: '#666',
    fontFamily: 'monospace',
  },
  badge: {
    padding: '5px 10px',
    borderRadius: '20px',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '11px',
    whiteSpace: 'nowrap',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  detailText: {
    fontSize: '15px',
    color: '#666',
  },
  totalCost: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  paymentStatusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
    padding: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
  },
  dateText: {
    fontSize: '12px',
    color: '#999',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #eee',
    display: 'block',
  },
  actionButtons: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  deliverBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#9b59b6',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  receiveBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#2ecc71',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  paymentBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#e67e22',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  receiptBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#fff',
    border: '1px solid #6200EE',
    borderRadius: '8px',
    color: '#6200EE',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  receiptBtnText: {
    color: '#6200EE',
  },
  btnText: {
    color: '#fff',
  },
  paymentSubmitted: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f0f8ff',
    borderRadius: '8px',
  },
  paymentApproved: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#e8f6f3',
    borderRadius: '8px',
  },
  paymentPaid: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#e8f6f3',
    borderRadius: '8px',
  },
  paymentSubmittedText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#3498db',
    margin: '0 0 2px',
  },
  paymentSubmittedSubtext: {
    fontSize: '12px',
    color: '#666',
    margin: 0,
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '60px',
  },
  emptyText: {
    fontSize: '18px',
    color: '#777',
    fontWeight: '600',
    marginTop: '16px',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#aaa',
    marginTop: '8px',
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
    color: '#333',
    margin: 0,
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  modalContent: {
    padding: '20px',
    overflowY: 'auto',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  inputLabel: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
    display: 'block',
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: '#f9f9f9',
  },
  inputWithIcon: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  inputIcon: {
    padding: '0 16px',
  },
  input: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    border: 'none',
    outline: 'none',
    background: 'none',
  },
  totalDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3e5f5',
    padding: '16px',
    borderRadius: '8px',
    gap: '12px',
  },
  totalText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#6200EE',
  },
  paymentSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  },
  paymentSummaryTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
  },
  paymentDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  paymentDetailLabel: {
    fontSize: '14px',
    color: '#666',
  },
  paymentDetailValue: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
  },
  totalPaymentRow: {
    borderTop: '1px solid #ddd',
    paddingTop: '12px',
    marginTop: '8px',
  },
  totalPaymentLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  totalPaymentValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#6200EE',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '16px',
    backgroundColor: '#e8f4fd',
    borderRadius: '8px',
    marginTop: '10px',
  },
  infoText: {
    flex: 1,
    fontSize: '14px',
    color: '#3498db',
  },
  modalFooter: {
    display: 'flex',
    padding: '20px',
    borderTop: '1px solid #eee',
    gap: '12px',
  },
  cancelButton: {
    flex: 1,
    padding: '16px',
    backgroundColor: '#f5f5f5',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
    cursor: 'pointer',
  },
  createButton: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#6200EE',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  createButtonDisabled: {
    backgroundColor: '#b39ddb',
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  createButtonText: {
    color: '#fff',
  },
  // Toast styles
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '500',
    zIndex: 2000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    maxWidth: '300px',
  },
  toastSuccess: { backgroundColor: '#4CAF50' },
  toastError: { backgroundColor: '#F44336' },
  toastInfo: { backgroundColor: '#2196F3' },
  // Confirm modal styles
  confirmOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1500,
  },
  confirmContent: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
  },
  confirmButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
    justifyContent: 'center',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#6200EE',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

// Global spinner styles
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