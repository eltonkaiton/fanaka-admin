import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoPerson } from 'react-icons/io5';

const API_BASE_URL = 'http://localhost:5000';

export default function EmployeeInbox() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState(null);
  const [department, setDepartment] = useState(null);
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const storedId = localStorage.getItem('employeeId');
      const storedDept = localStorage.getItem('department');

      if (!storedId || !storedDept) {
        alert('Login required');
        return;
      }

      setEmployeeId(storedId);
      setDepartment(storedDept);
      await fetchInbox(storedDept);
    };

    init();
  }, []);

  const fetchInbox = async (dept) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/chat/inbox/department/${dept}`);
      setInbox(res.data.inbox || []);
    } catch (err) {
      console.log('Inbox fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerPress = (customer) => {
    navigate('/employee-chat', {
      state: { employeeId, department, customer },
    });
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
    },
    loader: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    },
    customerCard: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      marginBottom: '10px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s',
    },
    customerCardHover: {
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    avatar: {
      width: '44px',
      height: '44px',
      borderRadius: '22px',
      backgroundColor: '#6200EE',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '12px',
      color: '#fff',
      fontSize: '18px',
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      position: 'relative',
    },
    customerName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '4px',
    },
    lastMessage: {
      fontSize: '13px',
      color: '#777',
    },
    unreadBadge: {
      position: 'absolute',
      top: '0',
      right: '0',
      backgroundColor: '#e94560',
      borderRadius: '10px',
      padding: '2px 6px',
      minWidth: '20px',
      textAlign: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#fff',
    },
    emptyState: {
      textAlign: 'center',
      color: '#999',
      marginTop: '40px',
      fontSize: '16px',
    },
  };

  if (loading) {
    return (
      <div style={styles.loader}>
        <div className="spinner"></div>
        <p style={{ marginLeft: '10px', color: '#666' }}>Loading inbox...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {inbox.length === 0 ? (
        <p style={styles.emptyState}>No conversations yet</p>
      ) : (
        inbox.map((customer) => (
          <div
            key={customer._id}
            style={styles.customerCard}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)')}
            onClick={() => handleCustomerPress(customer)}
          >
            <div style={styles.avatar}>
              {customer.fullName?.charAt(0) || <IoPerson size={20} />}
            </div>
            <div style={styles.content}>
              <div style={styles.customerName}>{customer.fullName}</div>
              <div style={styles.lastMessage}>
                {customer.lastMessage || 'No messages yet'}
              </div>
              {customer.unreadCount > 0 && (
                <span style={styles.unreadBadge}>{customer.unreadCount}</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}