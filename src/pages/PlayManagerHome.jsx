import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoAddCircleOutline,
  IoAlbumsOutline,
  IoReceiptOutline,
  IoLogOutOutline,
  IoInformationCircleOutline,
  IoCallOutline,
  IoMailOutline,
  IoLocationOutline
} from 'react-icons/io5';

export default function PlayManagerHome() {
  const navigate = useNavigate();

  // Toast and logout confirmation
  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState({ show: false });

  const toast = (msg, type = 'info', dur = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), dur);
  };

  const rmToast = id => setToasts(p => p.filter(t => t.id !== id));

  const handleLogout = () => setConfirm({ show: true });

  const confirmLogout = () => {
    localStorage.clear();
    toast('Logged out successfully', 'success');
    setTimeout(() => navigate('/login'), 1500);
    setConfirm({ show: false });
  };

  const cancelLogout = () => setConfirm({ show: false });

  // Action cards for main navigation
  const actions = [
    {
      path: '/play-manager/create-play',
      icon: <IoAddCircleOutline size={40} color="#6200EE" />,
      title: 'Create New Play',
      description: 'Add a new play to the repertoire'
    },
    {
      path: '/play-manager/manage-plays',
      icon: <IoAlbumsOutline size={40} color="#03DAC6" />,
      title: 'Manage Plays',
      description: 'Edit, update or remove existing plays'
    },
    {
      path: '/play-manager/manager-bookings',
      icon: <IoReceiptOutline size={40} color="#FF6D00" />,
      title: 'View Bookings',
      description: 'Check all ticket bookings and revenue'
    }
  ];

  // Toast container component
  const ToastContainer = () => (
    <div style={s.toastContainer}>
      {toasts.map(t => (
        <div key={t.id} style={{ ...s.toast, ...s[`toast${t.type}`] }}>
          <span>{t.msg}</span>
          <button onClick={() => rmToast(t.id)} style={s.toastClose}>✕</button>
        </div>
      ))}
    </div>
  );

  // Logout confirmation modal
  const ConfirmModal = () => confirm.show && (
    <div style={s.modalOverlay} onClick={cancelLogout}>
      <div style={s.confirmModal} onClick={e => e.stopPropagation()}>
        <h3>Confirm Logout</h3>
        <p>Are you sure you want to logout?</p>
        <div style={s.confirmButtons}>
          <button style={s.cancelBtn} onClick={cancelLogout}>Cancel</button>
          <button style={s.confirmBtn} onClick={confirmLogout}>Logout</button>
        </div>
      </div>
    </div>
  );

  // Styles
  const s = {
    container: {
      padding: '30px',
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px',
      flexWrap: 'wrap',
      gap: '15px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1e293b',
      margin: '0 0 5px 0'
    },
    subtitle: {
      fontSize: '16px',
      color: '#64748b',
      margin: '0'
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#ef4444',
      color: '#fff',
      border: 'none',
      borderRadius: '50px',
      padding: '10px 20px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s, transform 0.1s',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    aboutSection: {
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      padding: '30px',
      marginBottom: '40px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    aboutTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#0f172a',
      margin: '0 0 15px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    aboutText: {
      fontSize: '16px',
      color: '#334155',
      lineHeight: '1.6',
      margin: '0 0 20px 0'
    },
    contactInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '15px',
      color: '#1e293b'
    },
    contactIcon: {
      color: '#6200EE',
      fontSize: '20px'
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '25px',
      marginTop: '20px'
    },
    actionCard: {
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      padding: '30px 20px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%'
    },
    cardIcon: {
      marginBottom: '20px',
      backgroundColor: '#f1f5f9',
      padding: '15px',
      borderRadius: '50%',
      display: 'inline-flex'
    },
    actionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#0f172a',
      margin: '0 0 8px 0'
    },
    actionDescription: {
      fontSize: '14px',
      color: '#64748b',
      margin: '0',
      lineHeight: '1.5'
    },
    footer: {
      marginTop: '40px',
      textAlign: 'center',
      color: '#94a3b8',
      fontSize: '14px',
      borderTop: '1px solid #e2e8f0',
      paddingTop: '20px'
    },
    toastContainer: {
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    },
    toast: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minWidth: 250,
      maxWidth: 400,
      padding: '12px 16px',
      borderRadius: 8,
      color: '#fff',
      fontSize: 14,
      fontWeight: 500,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      animation: 'slideIn 0.3s ease'
    },
    toastSuccess: { backgroundColor: '#4CAF50' },
    toastError: { backgroundColor: '#F44336' },
    toastWarning: { backgroundColor: '#FF9800' },
    toastInfo: { backgroundColor: '#2196F3' },
    toastClose: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      marginLeft: 12,
      padding: 0,
      color: '#fff',
      fontSize: 18,
      lineHeight: 1
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1500
    },
    confirmModal: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '400px',
      width: '90%',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
    },
    confirmButtons: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '12px',
      marginTop: '20px'
    },
    cancelBtn: {
      flex: 1,
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      backgroundColor: '#f5f5f5',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    confirmBtn: {
      flex: 1,
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#ef4444',
      color: '#fff',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer'
    }
  };

  return (
    <div style={s.container}>
      <ToastContainer />
      <ConfirmModal />

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Play Manager Dashboard</h1>
          <p style={s.subtitle}>Welcome back! Manage your plays and productions.</p>
        </div>
        <button style={s.logoutButton} onClick={handleLogout}>
          <IoLogOutOutline size={22} color="#fff" />
          <span>Logout</span>
        </button>
      </div>

      {/* About Fanaka Arts & Contact Section */}
      <div style={s.aboutSection}>
        <h2 style={s.aboutTitle}>
          <IoInformationCircleOutline size={28} color="#6200EE" />
          About Fanaka Arts
        </h2>
        <p style={s.aboutText}>
          Fanaka Arts is a vibrant creative hub dedicated to nurturing talent and producing 
          exceptional theatrical performances. We bring stories to life through innovative 
          productions, community engagement, and a passion for the arts. Join us in celebrating 
          creativity and culture.
        </p>
        <div style={s.contactInfo}>
          <div style={s.contactItem}>
            <IoMailOutline style={s.contactIcon} />
            <span>info@fanakaarts.com</span>
          </div>
          <div style={s.contactItem}>
            <IoCallOutline style={s.contactIcon} />
            <span>+254 700 123 456</span>
          </div>
          <div style={s.contactItem}>
            <IoLocationOutline style={s.contactIcon} />
            <span>Nairobi, Kenya</span>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#0f172a', marginBottom: '20px' }}>
        Quick Actions
      </h2>
      <div style={s.cardGrid}>
        {actions.map((a, i) => (
          <button
            key={i}
            style={s.actionCard}
            onClick={() => navigate(a.path)}
          >
            <div style={s.cardIcon}>{a.icon}</div>
            <h3 style={s.actionTitle}>{a.title}</h3>
            <p style={s.actionDescription}>{a.description}</p>
          </button>
        ))}
      </div>

      <p style={s.footer}>Use the sidebar for additional navigation options.</p>
    </div>
  );
}

// Add keyframe animations
(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `;
  document.head.appendChild(style);
})();