import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  IoHome, IoCheckmarkCircle, IoHourglass, IoCheckmarkDoneCircle,
  IoSync, IoMenu, IoClose, IoAdd, IoRefresh, IoPersonCircle,
  IoCube, IoPricetag, IoAlertCircle, IoCart, IoLogOut,
  IoArrowForward, IoBusiness, IoCalendar, IoHourglassOutline,
  IoCheckmarkCircleOutline, IoCheckmarkDoneCircleOutline,
  IoCubeOutline, IoCartOutline, IoAlertCircleOutline,
  IoPersonCircleOutline, IoPricetagOutline, IoCalendarOutline,
  IoBusinessOutline, IoCalculatorOutline
} from 'react-icons/io5';

const API_BASE = 'http://localhost:5000';

export default function InventoryHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plays, setPlays] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [view, setView] = useState('dashboard'); // dashboard|approved|processing|prepared|items
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [itemModal, setItemModal] = useState(false);
  const [orderModal, setOrderModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: '', quantity: '', minThreshold: '', unit: '' });
  const [orderData, setOrderData] = useState({
    item: '',
    itemName: '',
    supplier: '',
    supplierName: '',
    quantity: '',
    unitPrice: '',
    totalCost: ''
  });

  // Toast and confirmation state
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [confirm, setConfirm] = useState({ show: false, message: '', onConfirm: null });

  const formatMaterials = mat => Array.isArray(mat) ? mat.map(m => m?.name || m?.title || m?.materialName || JSON.stringify(m)).join(', ') : 'No materials';
  const extractNames = mat => Array.isArray(mat) ? mat.map(m => m?.name || m?.title || m?.materialName).filter(Boolean) : [];
  const extractWithQty = mat => Array.isArray(mat) ? mat.map(m => ({ name: m?.name || m?.title || m?.materialName || m, qty: m?.quantity || 1, unit: m?.unit || 'pcs' })) : [];

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirm({ show: true, message, onConfirm });
  };

  const fetchPlays = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/plays`);
      const filtered = res.data.map(p => ({
        ...p,
        materialRequests: p.materialRequests?.map(r => ({
          ...r,
          formattedMaterials: formatMaterials(r.materials),
          materialNames: extractNames(r.materials),
          materialsWithQuantities: extractWithQty(r.materials)
        })) || []
      })).filter(p => p.materialRequests.length > 0);
      setPlays(filtered);
    } catch (err) {
      console.log(err);
      showToast('Failed to load material requests', 'error');
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/items`);
      const itemsData = (res.data || []).map(item => ({
        ...item,
        currentStock: item.currentStock !== undefined ? item.currentStock : item.quantity
      }));
      setItems(itemsData);
    } catch (err) {
      console.log(err);
      showToast('Failed to load inventory', 'error');
      setItems([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/orders`);
      setOrders(res.data?.orders || (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      console.log(err);
      showToast('Failed to load orders', 'error');
      setOrders([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/employees/department/supplier`);
      setSuppliers(res.data || []);
    } catch (err) {
      console.log(err);
      showToast('Failed to load suppliers', 'error');
      setSuppliers([]);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchPlays(), fetchItems(), fetchOrders(), fetchSuppliers()]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadAll(); }, []);

  const checkInventory = async (mats) => {
    try {
      const invRes = await axios.get(`${API_BASE}/api/items`);
      const inv = (invRes.data || []).map(item => ({
        ...item,
        currentStock: item.currentStock !== undefined ? item.currentStock : item.quantity
      }));
      const missing = [];
      mats.forEach(m => {
        const found = inv.find(i => i.name.toLowerCase().includes(m.name.toLowerCase()) || m.name.toLowerCase().includes(i.name.toLowerCase()));
        if (!found) missing.push(`${m.name} (not in inventory)`);
        else if (found.currentStock < m.qty) missing.push(`${m.name} (need ${m.qty}, have ${found.currentStock})`);
      });
      return missing;
    } catch { return []; }
  };

  const deductMaterials = async (mats) => {
    const invRes = await axios.get(`${API_BASE}/api/items`);
    const inv = (invRes.data || []).map(item => ({
      ...item,
      currentStock: item.currentStock !== undefined ? item.currentStock : item.quantity
    }));
    await Promise.all(mats.map(async m => {
      const found = inv.find(i => i.name.toLowerCase().includes(m.name.toLowerCase()) || m.name.toLowerCase().includes(i.name.toLowerCase()));
      if (found) {
        const newStock = Math.max(0, found.currentStock - m.qty);
        await axios.put(`${API_BASE}/api/items/${found._id}`, { ...found, quantity: newStock, currentStock: newStock });
      }
    }));
  };

  const handleMarkProcessing = async (playId, reqId, mats) => {
    const missing = await checkInventory(mats);
    if (missing.length > 0) {
      showToast(`Insufficient:\n${missing.join('\n')}\n\nRestock first.`, 'error');
      setItemModal(true);
      return;
    }
    showConfirm('Mark as processing? Materials will be reserved.', async () => {
      try {
        await axios.patch(`${API_BASE}/api/plays/${playId}/material-requests/${reqId}/processing`);
        showToast('Marked as processing.', 'success');
        loadAll();
      } catch (err) {
        showToast('Failed to mark as processing.', 'error');
      }
    });
  };

  const handleMarkPrepared = async (playId, reqId, mats) => {
    showConfirm('Mark as prepared? Materials will be deducted from inventory.', async () => {
      try {
        await axios.patch(`${API_BASE}/api/plays/${playId}/material-requests/${reqId}/prepare`);
        await deductMaterials(mats);
        showToast('Marked as prepared.', 'success');
        loadAll();
      } catch (err) {
        showToast('Failed to mark as prepared.', 'error');
      }
    });
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.quantity || !newItem.unit) {
      showToast('Fill required fields', 'error');
      return;
    }
    try {
      await axios.post(`${API_BASE}/api/items`, newItem);
      showToast('Item added', 'success');
      setItemModal(false);
      setNewItem({ name: '', category: '', quantity: '', minThreshold: '', unit: '' });
      fetchItems();
    } catch (err) {
      showToast('Failed to add item', 'error');
    }
  };

  // Order helpers
  const calcTotal = (qty, price) => {
    const q = parseFloat(qty) || 0;
    const p = parseFloat(price) || 0;
    const total = (q * p).toFixed(2);
    setOrderData(prev => ({ ...prev, totalCost: total }));
  };

  const resetOrderForm = () => {
    setOrderData({
      item: '',
      itemName: '',
      supplier: '',
      supplierName: '',
      quantity: '',
      unitPrice: '',
      totalCost: ''
    });
  };

  const createOrder = async () => {
    const { item, supplier, quantity, unitPrice } = orderData;
    if (!item || !supplier || !quantity || !unitPrice) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    if (parseFloat(quantity) <= 0 || parseFloat(unitPrice) <= 0) {
      showToast('Quantity and unit price must be greater than 0', 'error');
      return;
    }
    try {
      await axios.post(`${API_BASE}/api/orders`, {
        item,
        supplier,
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice)
      });
      showToast('Order placed successfully', 'success');
      setOrderModal(false);
      resetOrderForm();
      fetchOrders(); // update pending orders count
    } catch (err) {
      console.log(err);
      showToast(err.response?.data?.message || 'Failed to create order', 'error');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const counts = {
    approved: plays.reduce((a, p) => a + p.materialRequests.filter(r => r.status === 'approved').length, 0),
    processing: plays.reduce((a, p) => a + p.materialRequests.filter(r => r.status === 'processing').length, 0),
    prepared: plays.reduce((a, p) => a + p.materialRequests.filter(r => r.status === 'prepared').length, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    lowStock: items.filter(i => (i.currentStock !== undefined ? i.currentStock : i.quantity) <= (i.minThreshold || 0)).length
  };

  // Styles (unchanged – kept from original)
  const styles = {
    container: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8f9fa', fontFamily: 'system-ui,sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    headerTitle: { fontSize: '20px', fontWeight: 'bold', color: '#333' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 },
    sidebar: { position: 'fixed', top: 0, left: 0, bottom: 0, width: '80%', maxWidth: '300px', background: '#fff', zIndex: 1000, transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column' },
    sidebarHeader: { padding: '30px 20px', background: '#f8f9fa', borderBottom: '1px solid #eee', textAlign: 'center' },
    sidebarTitle: { fontSize: '24px', fontWeight: 'bold', color: '#333', marginTop: 10 },
    sidebarSub: { fontSize: '14px', color: '#666', marginTop: 5 },
    menuItem: { display: 'flex', alignItems: 'center', padding: '15px 20px', cursor: 'pointer', color: '#666', borderLeft: '4px solid transparent' },
    menuItemActive: { background: '#6200EE10', borderLeftColor: '#6200EE', color: '#6200EE', fontWeight: '600' },
    menuIcon: { marginRight: 15 },
    logoutBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F44336', margin: '20px', padding: '12px', borderRadius: '10px', color: '#fff', border: 'none', cursor: 'pointer' },
    main: { flex: 1, overflowY: 'auto', padding: 20 },
    statsRow: { display: 'flex', gap: 10, marginBottom: 15, flexWrap: 'wrap' },
    card: { flex: '1 1 calc(50% - 5px)', background: '#fff', borderRadius: 15, padding: 20, borderLeft: '5px solid', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    cardHeader: { display: 'flex', alignItems: 'center', marginBottom: 10 },
    iconBox: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    cardTitle: { fontSize: '14px', color: '#666' },
    cardValue: { fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: 10 },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#6200EE' },
    section: { background: '#fff', borderRadius: 15, padding: 20, marginBottom: 20, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: 15 },
    recentCard: { background: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 10 },
    recentTitle: { fontSize: '16px', fontWeight: '600', marginBottom: 5 },
    recentSub: { fontSize: '14px', color: '#666' },
    addBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#6200EE', padding: 15, borderRadius: 12, color: '#fff', border: 'none', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: '600', gap: 8 },
    tabs: { display: 'flex', background: '#fff', borderRadius: 10, padding: 5, marginBottom: 20 },
    tab: { flex: 1, textAlign: 'center', padding: '8px', borderRadius: 8, cursor: 'pointer', color: '#666' },
    tabActive: { background: '#6200EE', color: '#fff' },
    playCard: { background: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    playTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: 5 },
    playDesc: { fontSize: '14px', color: '#666', marginBottom: 10 },
    materialCard: { background: '#f8f9fa', borderRadius: 8, padding: 12, marginBottom: 8 },
    materialHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    actorInfo: { display: 'flex', alignItems: 'center', gap: 5 },
    statusBadge: { padding: '4px 8px', borderRadius: 16, fontSize: '12px', fontWeight: 'bold' },
    materialsRow: { display: 'flex', gap: 8, marginBottom: 10 },
    actionBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', color: '#fff', fontSize: '14px', width: '100%' },
    itemCard: { background: '#fff', borderRadius: 10, padding: 15, marginBottom: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    lowStockCard: { borderLeft: '4px solid #F44336' },
    itemHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
    qtyBadge: { background: '#e3f2fd', padding: '4px 10px', borderRadius: 16, fontSize: '14px', fontWeight: '600' },
    detailRow: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5, color: '#666' },
    orderBtn: { background: '#F44336', color: '#fff', border: 'none', borderRadius: 6, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 10, cursor: 'pointer' },
    emptyBox: { textAlign: 'center', padding: 50, color: '#999' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1100 },
    modalContent: { background: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, width: '100%', maxWidth: '600px', maxHeight: '90%', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #eee' },
    modalTitle: { fontSize: '20px', fontWeight: 'bold' },
    modalBody: { padding: '20px', overflowY: 'auto' },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: '14px', fontWeight: '600', marginBottom: 5, display: 'block' },
    input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 8, fontSize: '16px', boxSizing: 'border-box' },
    select: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 8, fontSize: '16px', backgroundColor: '#f9f9f9', boxSizing: 'border-box' },
    row: { display: 'flex', gap: 10, marginBottom: 15 },
    modalFooter: { display: 'flex', padding: '20px', borderTop: '1px solid #eee', gap: 10 },
    cancelBtn: { flex: 1, background: '#f5f5f5', border: 'none', borderRadius: 8, padding: '12px', fontWeight: '600', cursor: 'pointer' },
    saveBtn: { flex: 1, background: '#6200EE', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontWeight: '600', cursor: 'pointer' },
    disabled: { background: '#b39ddb', cursor: 'not-allowed' },
    totalDisplay: { display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3e5f5', padding: '16px', borderRadius: 8, gap: 12 },
    totalText: { fontSize: '20px', fontWeight: 'bold', color: '#6200EE' },
    toast: { position: 'fixed', top: 20, right: 20, padding: '12px 20px', borderRadius: 8, color: '#fff', fontWeight: '500', zIndex: 2000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: '300px' },
    toastSuccess: { background: '#4CAF50' },
    toastError: { background: '#F44336' },
    toastInfo: { background: '#2196F3' },
    confirmOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500 },
    confirmContent: { background: '#fff', borderRadius: 12, padding: 24, maxWidth: '400px', width: '90%', textAlign: 'center' },
    confirmButtons: { display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }
  };

  const renderDashboard = () => (
    <div style={styles.main}>
      <h2 style={styles.sectionTitle}>Inventory Dashboard</h2>
      <div style={styles.statsRow}>
        <div style={{ ...styles.card, borderLeftColor: '#6200EE' }}>
          <div style={styles.cardHeader}><div style={{ ...styles.iconBox, background: '#6200EE20' }}><IoCube size={24} color='#6200EE' /></div><span style={styles.cardTitle}>Total Items</span></div>
          <div style={styles.cardValue}>{items.length}</div>
          <div style={styles.cardFooter} onClick={() => setView('items')}><span>View Details</span><IoArrowForward /></div>
        </div>
        <div style={{ ...styles.card, borderLeftColor: '#4CAF50' }}>
          <div style={styles.cardHeader}><div style={{ ...styles.iconBox, background: '#4CAF5020' }}><IoCheckmarkCircle size={24} color='#4CAF50' /></div><span style={styles.cardTitle}>Approved</span></div>
          <div style={styles.cardValue}>{counts.approved}</div>
          <div style={styles.cardFooter} onClick={() => setView('approved')}><span>View</span><IoArrowForward /></div>
        </div>
      </div>
      <div style={styles.statsRow}>
        <div style={{ ...styles.card, borderLeftColor: '#FF9800' }}>
          <div style={styles.cardHeader}><div style={{ ...styles.iconBox, background: '#FF980020' }}><IoHourglass size={24} color='#FF9800' /></div><span style={styles.cardTitle}>Processing</span></div>
          <div style={styles.cardValue}>{counts.processing}</div>
          <div style={styles.cardFooter} onClick={() => setView('processing')}><span>View</span><IoArrowForward /></div>
        </div>
        <div style={{ ...styles.card, borderLeftColor: '#2196F3' }}>
          <div style={styles.cardHeader}><div style={{ ...styles.iconBox, background: '#2196F320' }}><IoCheckmarkDoneCircle size={24} color='#2196F3' /></div><span style={styles.cardTitle}>Prepared</span></div>
          <div style={styles.cardValue}>{counts.prepared}</div>
          <div style={styles.cardFooter} onClick={() => setView('prepared')}><span>View</span><IoArrowForward /></div>
        </div>
      </div>
      <div style={styles.statsRow}>
        <div style={{ ...styles.card, borderLeftColor: '#FF9800' }}>
          <div style={styles.cardHeader}><div style={{ ...styles.iconBox, background: '#FF980020' }}><IoCart size={24} color='#FF9800' /></div><span style={styles.cardTitle}>Pending Orders</span></div>
          <div style={styles.cardValue}>{counts.pendingOrders}</div>
          <div style={styles.cardFooter} onClick={() => navigate('/order')}><span>Go to Orders</span><IoArrowForward /></div>
        </div>
        <div style={{ ...styles.card, borderLeftColor: '#F44336' }}>
          <div style={styles.cardHeader}><div style={{ ...styles.iconBox, background: '#F4433620' }}><IoAlertCircle size={24} color='#F44336' /></div><span style={styles.cardTitle}>Low Stock</span></div>
          <div style={styles.cardValue}>{counts.lowStock}</div>
          <div style={styles.cardFooter} onClick={() => setView('items')}><span>View Items</span><IoArrowForward /></div>
        </div>
      </div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Recent Material Requests</h3>
        {plays.slice(0, 3).map(p => p.materialRequests.slice(0, 2).map(r => (
          <div key={r._id} style={styles.recentCard}>
            <div style={styles.recentTitle}>{p.title}</div>
            <div style={styles.recentSub}>{r.actor?.fullName || 'Actor'}: {r.status}</div>
          </div>
        )))}
        {!plays.length && <div style={styles.emptyBox}>No recent requests</div>}
      </div>
      <button style={styles.addBtn} onClick={() => setItemModal(true)}><IoAdd /> Add New Item</button>
    </div>
  );

  const renderRequests = () => {
    const filtered = plays.filter(p => p.materialRequests.some(r => r.status === view));
    return (
      <div style={styles.main}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={styles.sectionTitle}>Material Requests</h2>
          <button onClick={loadAll} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><IoRefresh size={24} color='#6200EE' /></button>
        </div>
        <div style={styles.tabs}>
          {['approved', 'processing', 'prepared'].map(s => <div key={s} style={{ ...styles.tab, ...(view === s ? styles.tabActive : {}) }} onClick={() => setView(s)}>{s.toUpperCase()}</div>)}
        </div>
        {filtered.map(p => (
          <div key={p._id} style={styles.playCard}>
            <div style={styles.playTitle}>{p.title}</div>
            <div style={styles.playDesc}>{p.description}</div>
            {p.materialRequests.filter(r => r.status === view).map(r => {
              const isProc = r.status === 'processing', isPrep = r.status === 'prepared';
              return (
                <div key={r._id} style={{ ...styles.materialCard, background: isProc ? '#FFF3E0' : isPrep ? '#E3F2FD' : '#f8f9fa' }}>
                  <div style={styles.materialHeader}>
                    <div style={styles.actorInfo}><IoPersonCircle size={20} color='#6200EE' /><span>{r.actor?.fullName || 'Actor'}</span></div>
                    <span style={{ ...styles.statusBadge, background: r.status === 'approved' ? '#4CAF5020' : isProc ? '#FF980020' : '#2196F320', color: r.status === 'approved' ? '#4CAF50' : isProc ? '#FF9800' : '#2196F3' }}>{r.status.toUpperCase()}</span>
                  </div>
                  <div style={styles.materialsRow}><IoCube size={16} /><span>{r.formattedMaterials}</span></div>
                  <div>
                    {r.status === 'approved' && <button style={{ ...styles.actionBtn, background: '#FF9800' }} onClick={() => handleMarkProcessing(p._id, r._id, r.materialsWithQuantities)}><IoHourglassOutline />Mark Processing</button>}
                    {r.status === 'processing' && <button style={{ ...styles.actionBtn, background: '#4CAF50', marginTop: 5 }} onClick={() => handleMarkPrepared(p._id, r._id, r.materialsWithQuantities)}><IoCheckmarkCircleOutline />Mark Prepared</button>}
                    {r.status === 'prepared' && <div style={{ ...styles.actionBtn, background: '#E3F2FD', color: '#2196F3', cursor: 'default' }}><IoCheckmarkDoneCircleOutline />Completed ✓</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {!filtered.length && <div style={styles.emptyBox}><IoCube size={70} color='#aaa' /><h3>No {view} requests</h3></div>}
      </div>
    );
  };

  const renderItems = () => (
    <div style={styles.main}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={styles.sectionTitle}>Inventory Items</h2>
        <button style={{ ...styles.addBtn, width: 'auto', padding: '8px 16px' }} onClick={() => setItemModal(true)}><IoAdd /> Add Item</button>
      </div>
      {items.map(i => {
        const stock = i.currentStock !== undefined ? i.currentStock : i.quantity;
        const low = stock <= (i.minThreshold || 0);
        return (
          <div key={i._id} style={{ ...styles.itemCard, ...(low ? styles.lowStockCard : {}) }}>
            <div style={styles.itemHeader}>
              <span style={styles.playTitle}>{i.name}</span>
              <span style={{ ...styles.qtyBadge, background: low ? '#ffebee' : '#e3f2fd' }}>{stock} {i.unit || 'pcs'}</span>
            </div>
            <div style={styles.detailRow}><IoPricetag size={14} /> Category: {i.category || 'Uncategorized'}</div>
            <div style={styles.detailRow}><IoAlertCircle size={14} /> Min Threshold: {i.minThreshold || 'Not set'}</div>
            {low && (
              <button
                style={styles.orderBtn}
                onClick={() => {
                  setOrderData({
                    ...orderData,
                    item: i._id,
                    itemName: i.name,
                    quantity: '',
                    unitPrice: '',
                    totalCost: ''
                  });
                  setOrderModal(true);
                }}
              >
                <IoCart /> Order More
              </button>
            )}
          </div>
        );
      })}
      {!items.length && <div style={styles.emptyBox}><IoCube size={70} color='#aaa' /><h3>No items</h3><p>Add your first item</p></div>}
    </div>
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner" /><p style={{ marginLeft: 10 }}>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => setSidebarVisible(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><IoMenu size={28} color='#6200EE' /></button>
        <span style={styles.headerTitle}>
          {view === 'dashboard' ? 'Dashboard' : view === 'items' ? 'Inventory' : `${view.charAt(0).toUpperCase() + view.slice(1)} Requests`}
        </span>
        <button onClick={loadAll} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><IoRefresh size={24} color='#6200EE' /></button>
      </div>

      {sidebarVisible && <div style={styles.overlay} onClick={() => setSidebarVisible(false)} />}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}><IoCube size={40} color='#6200EE' /><div style={styles.sidebarTitle}>Inventory</div><div style={styles.sidebarSub}>Management System</div></div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
          {[
            { key: 'dashboard', icon: IoHome, label: 'Dashboard' },
            { key: 'approved', icon: IoCheckmarkCircleOutline, label: 'Approved' },
            { key: 'processing', icon: IoHourglassOutline, label: 'Processing' },
            { key: 'prepared', icon: IoCheckmarkDoneCircleOutline, label: 'Prepared' },
            { key: 'items', icon: IoCubeOutline, label: 'Inventory Items' },
            { key: 'orders', icon: IoCartOutline, label: 'Order Items', action: () => navigate('/order') }
          ].map(({ key, icon: Icon, label, action }) => (
            <div key={key} style={{ ...styles.menuItem, ...(view === key && key !== 'orders' ? styles.menuItemActive : {}) }} onClick={() => { action ? action() : setView(key); setSidebarVisible(false); }}>
              <Icon size={22} color={view === key && key !== 'orders' ? '#6200EE' : '#666'} style={styles.menuIcon} /><span>{label}</span>
            </div>
          ))}
        </div>
        <button style={styles.logoutBtn} onClick={logout}><IoLogOut size={22} /><span style={{ marginLeft: 8 }}>Logout</span></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {view === 'dashboard' ? renderDashboard() : view === 'items' ? renderItems() : renderRequests()}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          ...styles.toast,
          ...(toast.type === 'success' ? styles.toastSuccess : toast.type === 'error' ? styles.toastError : styles.toastInfo)
        }}>
          {toast.message}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirm.show && (
        <div style={styles.confirmOverlay} onClick={() => setConfirm({ show: false, message: '', onConfirm: null })}>
          <div style={styles.confirmContent} onClick={e => e.stopPropagation()}>
            <p>{confirm.message}</p>
            <div style={styles.confirmButtons}>
              <button style={styles.cancelBtn} onClick={() => setConfirm({ show: false, message: '', onConfirm: null })}>Cancel</button>
              <button style={styles.saveBtn} onClick={() => {
                confirm.onConfirm();
                setConfirm({ show: false, message: '', onConfirm: null });
              }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {itemModal && <div style={styles.modalOverlay} onClick={() => setItemModal(false)}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}><span style={styles.modalTitle}>Add New Item</span><button onClick={() => setItemModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><IoClose size={24} /></button></div>
          <div style={styles.modalBody}>
            <div style={styles.inputGroup}><label style={styles.label}>Name *</label><input style={styles.input} value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} /></div>
            <div style={styles.inputGroup}><label style={styles.label}>Category *</label><input style={styles.input} value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} /></div>
            <div style={styles.row}>
              <div style={{ flex: 1 }}><label style={styles.label}>Quantity *</label><input style={styles.input} type='number' value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} /></div>
              <div style={{ flex: 1 }}><label style={styles.label}>Unit</label><input style={styles.input} value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} /></div>
            </div>
            <div style={styles.inputGroup}><label style={styles.label}>Min Threshold</label><input style={styles.input} type='number' value={newItem.minThreshold} onChange={e => setNewItem({ ...newItem, minThreshold: e.target.value })} /></div>
          </div>
          <div style={styles.modalFooter}>
            <button style={styles.cancelBtn} onClick={() => setItemModal(false)}>Cancel</button>
            <button style={styles.saveBtn} onClick={addItem}>Save</button>
          </div>
        </div>
      </div>}

      {/* Enhanced Order Modal */}
      {orderModal && (
        <div style={styles.modalOverlay} onClick={() => { setOrderModal(false); resetOrderForm(); }}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Place Order</span>
              <button onClick={() => { setOrderModal(false); resetOrderForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><IoClose size={24} /></button>
            </div>
            <div style={styles.modalBody}>
              {/* Item Select */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Item *</label>
                <select
                  style={styles.select}
                  value={orderData.item}
                  onChange={(e) => {
                    const selected = items.find(i => i._id === e.target.value);
                    setOrderData({
                      ...orderData,
                      item: e.target.value,
                      itemName: selected?.name || ''
                    });
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

              {/* Supplier Select */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Supplier *</label>
                <select
                  style={styles.select}
                  value={orderData.supplier}
                  onChange={(e) => {
                    const selected = suppliers.find(s => s._id === e.target.value);
                    setOrderData({
                      ...orderData,
                      supplier: e.target.value,
                      supplierName: selected?.fullName || ''
                    });
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
                <label style={styles.label}>Quantity *</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="Enter quantity"
                  value={orderData.quantity}
                  onChange={(e) => {
                    setOrderData({ ...orderData, quantity: e.target.value });
                    calcTotal(e.target.value, orderData.unitPrice);
                  }}
                />
              </div>

              {/* Unit Price */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Unit Price (KES) *</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="Enter unit price"
                  value={orderData.unitPrice}
                  onChange={(e) => {
                    setOrderData({ ...orderData, unitPrice: e.target.value });
                    calcTotal(orderData.quantity, e.target.value);
                  }}
                />
              </div>

              {/* Total Display */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Total Cost</label>
                <div style={styles.totalDisplay}>
                  <IoCalculatorOutline size={24} color="#6200EE" />
                  <span style={styles.totalText}>
                    KES {parseFloat(orderData.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => { setOrderModal(false); resetOrderForm(); }}>Cancel</button>
              <button
                style={{
                  ...styles.saveBtn,
                  ...((!orderData.item || !orderData.supplier || !orderData.quantity || !orderData.unitPrice) && styles.disabled)
                }}
                onClick={createOrder}
                disabled={!orderData.item || !orderData.supplier || !orderData.quantity || !orderData.unitPrice}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Global keyframe animation for spinner
const styleSheet = document.createElement("style");
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
`;
document.head.appendChild(styleSheet);