import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoMenu,
  IoChatbubbleEllipsesOutline,
  IoTicketOutline,
  IoCubeOutline,
  IoMailOutline,
  IoCallOutline,
  IoHomeOutline,
  IoLogOutOutline,
} from 'react-icons/io5';

export default function FinanceHome() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleContact = (type) => {
    if (type === 'email') {
      window.location.href = 'mailto:support@fanakaarts.com';
    } else if (type === 'phone') {
      window.location.href = 'tel:+254700000000';
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.clear();
      navigate('/login');
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f0f4f7',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    header: {
      height: '60px',
      backgroundColor: '#6200EE',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      color: '#fff',
      position: 'relative',
      zIndex: 10,
    },
    headerTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginLeft: '16px',
      flex: 1,
    },
    menuButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: '8px',
    },
    chatButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: '8px',
    },
    content: {
      flex: 1,
      padding: '20px',
      overflowY: 'auto',
    },
    aboutCard: {
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      padding: '20px',
      borderRadius: '18px',
      marginBottom: '20px',
      color: '#fff',
    },
    aboutTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '8px',
    },
    aboutText: {
      lineHeight: '1.6',
    },
    quickActions: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
    },
    quickCard: {
      flex: 1,
      padding: '24px 12px',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    quickText: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#fff',
    },
    contactCard: {
      background: '#cfd9df',
      padding: '20px',
      borderRadius: '18px',
      marginTop: '10px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#333',
    },
    contactButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: '#FF6F61',
      padding: '14px 16px',
      borderRadius: '12px',
      marginBottom: '12px',
      border: 'none',
      cursor: 'pointer',
      width: '100%',
      color: '#fff',
      fontWeight: 'bold',
      fontSize: '16px',
    },
    contactButtonPurple: {
      backgroundColor: '#6200EE',
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      zIndex: 20,
    },
    drawer: {
      position: 'fixed',
      top: 0,
      left: drawerOpen ? '0' : '-75%',
      width: '75%',
      maxWidth: '300px',
      height: '100%',
      backgroundColor: '#fff',
      boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      padding: '60px 20px 20px',
      transition: 'left 0.3s ease',
      zIndex: 30,
    },
    drawerTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333',
    },
    drawerItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 0',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      width: '100%',
      fontSize: '16px',
      color: '#333',
    },
    drawerItemDanger: {
      color: '#e94560',
    },
  };

  const QuickButton = ({ icon: Icon, label, color, onClick }) => (
    <button
      style={{ ...styles.quickCard, backgroundColor: color }}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <Icon size={28} color="#fff" />
      <span style={styles.quickText}>{label}</span>
    </button>
  );

  const DrawerItem = ({ icon: Icon, label, danger, onClick }) => (
    <button
      style={{
        ...styles.drawerItem,
        ...(danger ? styles.drawerItemDanger : {}),
      }}
      onClick={onClick}
    >
      <Icon size={22} color={danger ? '#e94560' : '#333'} />
      <span>{label}</span>
    </button>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.menuButton} onClick={toggleDrawer}>
          <IoMenu size={28} color="#fff" />
        </button>
        <span style={styles.headerTitle}>Finance Dashboard</span>
        <button
          style={styles.chatButton}
          onClick={() => navigate('/employee-inbox')}
        >
          <IoChatbubbleEllipsesOutline size={28} color="#fff" />
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* About Card */}
        <div style={styles.aboutCard}>
          <h2 style={styles.aboutTitle}>Fanaka Arts</h2>
          <p style={styles.aboutText}>
            Fanaka Arts is a creative theatre platform that manages plays,
            ticket sales, payments, and audience engagement through a secure
            digital system.
          </p>
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <QuickButton
            icon={IoTicketOutline}
            label="Tickets"
            color="#fbc2eb"
            onClick={() => navigate('/tickets')}
          />
          <QuickButton
            icon={IoCubeOutline}
            label="Inventory Orders"
            color="#a6c1ee"
            onClick={() => navigate('/inventory-orders')}
          />
          <QuickButton
            icon={IoChatbubbleEllipsesOutline}
            label="Messages"
            color="#ffecd2"
            onClick={() => navigate('/employee-inbox')}
          />
        </div>

        {/* Contact Us */}
        <div style={styles.contactCard}>
          <h3 style={styles.sectionTitle}>Contact Us</h3>
          <button
            style={styles.contactButton}
            onClick={() => handleContact('email')}
          >
            <IoMailOutline size={20} color="#fff" />
            <span>Email: support@fanakaarts.com</span>
          </button>
          <button
            style={{ ...styles.contactButton, ...styles.contactButtonPurple }}
            onClick={() => handleContact('phone')}
          >
            <IoCallOutline size={20} color="#fff" />
            <span>Call: +254 700 000000</span>
          </button>
        </div>
      </div>

      {/* Overlay */}
      {drawerOpen && <div style={styles.overlay} onClick={toggleDrawer} />}

      {/* Drawer */}
      <div style={styles.drawer}>
        <h3 style={styles.drawerTitle}>Menu</h3>

        <DrawerItem
          icon={IoHomeOutline}
          label="Home"
          onClick={() => {
            toggleDrawer();
            // Already on home, but could scroll to top
          }}
        />
        <DrawerItem
          icon={IoTicketOutline}
          label="Tickets"
          onClick={() => {
            toggleDrawer();
            navigate('/tickets');
          }}
        />
        <DrawerItem
          icon={IoCubeOutline}
          label="Inventory Orders"
          onClick={() => {
            toggleDrawer();
            navigate('/inventory-orders');
          }}
        />
        <DrawerItem
          icon={IoChatbubbleEllipsesOutline}
          label="Messages"
          onClick={() => {
            toggleDrawer();
            navigate('/employee-inbox');
          }}
        />
        <DrawerItem
          icon={IoLogOutOutline}
          label="Logout"
          danger
          onClick={handleLogout}
        />
      </div>
    </div>
  );
}