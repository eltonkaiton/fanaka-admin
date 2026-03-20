import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { IoArrowBack, IoSend } from 'react-icons/io5';

const API_BASE_URL = 'https://fanaka-server-1.onrender.com';
const SOCKET_URL = 'https://fanaka-server-1.onrender.com';

export default function EmployeeChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeId, department, customer } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!employeeId || !department || !customer) {
      // Missing data, go back
      navigate(-1);
      return;
    }

    const init = async () => {
      // Connect socket
      socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
      socketRef.current.emit('joinDepartment', department);

      socketRef.current.on('newMessage', (msg) => {
        if (
          (msg.senderId === customer._id || msg.receiverId === customer._id) &&
          msg.department === department
        ) {
          fetchMessages();
        }
      });

      await fetchMessages();
    };

    init();

    return () => socketRef.current?.disconnect();
  }, [employeeId, department, customer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/chat/messages/department/${department}/${customer._id}`
      );
      if (res.data.success) {
        setMessages(res.data.messages);

        // Mark as read
        await axios.patch(
          `${API_BASE_URL}/api/chat/read/department/${department}/${customer._id}`
        );
      }
      setLoading(false);
    } catch (err) {
      console.log('Message fetch error:', err.message);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const tempMsg = {
      _id: Date.now().toString(),
      senderType: 'Employee',
      message: inputText.trim(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInputText('');

    try {
      await axios.post(`${API_BASE_URL}/api/chat/send`, {
        senderId: employeeId,
        receiverId: customer._id,
        senderType: 'Employee',
        department,
        message: tempMsg.message,
      });
    } catch (err) {
      console.log('Send error:', err.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      backgroundColor: '#fff',
      borderBottom: '1px solid #eee',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    backButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: 4,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
    },
    loader: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '15px 20px',
    },
    messageBubble: {
      maxWidth: '75%',
      padding: '10px 14px',
      borderRadius: 18,
      marginBottom: 10,
      wordWrap: 'break-word',
      fontSize: 14,
      lineHeight: 1.4,
    },
    myMessage: {
      backgroundColor: '#6200EE',
      color: '#fff',
      alignSelf: 'flex-end',
      borderBottomRightRadius: 4,
    },
    otherMessage: {
      backgroundColor: '#e0e0e0',
      color: '#333',
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 4,
    },
    inputContainer: {
      display: 'flex',
      gap: 10,
      padding: '10px 20px',
      backgroundColor: '#fff',
      borderTop: '1px solid #eee',
    },
    inputRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    input: {
      flex: 1,
      padding: '12px 18px',
      border: '1px solid #ddd',
      borderRadius: 24,
      fontSize: 14,
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    inputFocus: {
      borderColor: '#6200EE',
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#6200EE',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    sendButtonHover: {
      backgroundColor: '#4500b5',
    },
    sendButtonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>
          <div className="spinner"></div>
          <p style={{ marginLeft: 10, color: '#666' }}>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button
          style={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <IoArrowBack size={24} color="#6200EE" />
        </button>
        <span style={styles.headerTitle}>{customer?.fullName || 'Customer'}</span>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.map((msg) => (
          <div
            key={msg._id}
            style={{
              ...styles.messageBubble,
              ...(msg.senderType === 'Employee' ? styles.myMessage : styles.otherMessage),
            }}
          >
            {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputContainer}>
        <div style={styles.inputRow}>
          <input
            type="text"
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            style={{
              ...styles.sendButton,
              ...(!inputText.trim() ? styles.sendButtonDisabled : {}),
            }}
            onClick={sendMessage}
            disabled={!inputText.trim()}
            aria-label="Send message"
          >
            <IoSend size={18} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}