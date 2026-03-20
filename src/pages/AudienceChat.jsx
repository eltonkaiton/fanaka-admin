import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API_BASE_URL = "http://localhost:5000";
const SOCKET_URL = "http://localhost:5000";

// Allowed employees – now only finance and venue operation
const ALLOWED_DEPARTMENTS = ["finance", "venue operation"];
const ALLOWED_POSITIONS = [];

const AudienceChat = () => {
  const [customerId, setCustomerId] = useState(localStorage.getItem("customerId"));
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmployeeList, setShowEmployeeList] = useState(true);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!customerId) {
      alert("Login required");
      return;
    }

    fetchEmployees();

    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current.emit("join", customerId);

    socketRef.current.on("newMessage", (msg) => {
      if (selectedEmployee && msg.department === selectedEmployee.department) {
        fetchMessages(selectedEmployee);
      }
    });

    return () => socketRef.current?.disconnect();
  }, [selectedEmployee, customerId]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/employees`);
      const filtered = (res.data || []).filter((emp) => {
        const dept = (emp.department || "").toLowerCase();
        const pos = (emp.position || "").toLowerCase();
        return (
          ALLOWED_DEPARTMENTS.some((k) => dept.includes(k)) ||
          ALLOWED_POSITIONS.some((k) => pos.includes(k))
        );
      });
      setEmployees(filtered);
    } catch (err) {
      console.error("Employee fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (emp) => {
    if (!customerId || !emp?.department) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/chat/messages/department/${emp.department}/${customerId}`
      );
      if (res.data.success) {
        setMessages(res.data.messages);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !selectedEmployee) return;

    const tempMessage = {
      _id: Date.now().toString(),
      senderId: customerId,
      senderType: "User",
      message: inputText.trim(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputText("");

    try {
      await axios.post(`${API_BASE_URL}/api/chat/send`, {
        senderId: customerId,
        receiverId: selectedEmployee._id,
        senderType: "User",
        department: selectedEmployee.department,
        message: tempMessage.message,
      });
    } catch (err) {
      console.error("Send error:", err.response?.data || err.message);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // ---------- Inline styles ----------
  const styles = {
    chatContainer: { display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" },
    employeeList: { width: 300, borderRight: "1px solid #ddd", padding: 20, overflowY: "auto" },
    employeeCard: {
      display: "flex",
      alignItems: "center",
      padding: 12,
      borderRadius: 10,
      backgroundColor: "#f8f8f8",
      marginBottom: 10,
      cursor: "pointer",
      transition: "background 0.2s",
    },
    employeeCardHover: { backgroundColor: "#e0e0e0" },
    employeeAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#6200ee",
      color: "#fff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    employeeInfo: { flex: 1 },
    employeeDept: { margin: 0, fontSize: 12, color: "#555" },
    chatSection: { flexGrow: 1, display: "flex", flexDirection: "column" },
    chatHeader: {
      display: "flex",
      alignItems: "center",
      padding: "10px 15px",
      background: "#fff",
      borderBottom: "1px solid #ddd",
    },
    backButton: { background: "none", border: "none", fontSize: 20, cursor: "pointer" },
    messagesContainer: {
      flexGrow: 1,
      padding: 15,
      overflowY: "auto",
      backgroundColor: "#f2f2f2",
      display: "flex",
      flexDirection: "column",  // <-- ADDED: makes alignSelf work
    },
    messageBubble: {
      maxWidth: "70%",
      padding: 10,
      borderRadius: 12,
      marginBottom: 8,
      color: "#fff",
    },
    myMessage: { backgroundColor: "#6200ee", alignSelf: "flex-end" },
    otherMessage: { backgroundColor: "#9e9e9e", alignSelf: "flex-start" },
    inputContainer: { display: "flex", padding: 10, borderTop: "1px solid #ddd", backgroundColor: "#fff" },
    input: { flexGrow: 1, padding: "10px 15px", borderRadius: 20, border: "1px solid #ccc" },
    sendButton: {
      marginLeft: 10,
      padding: "0 20px",
      borderRadius: 20,
      border: "none",
      backgroundColor: "#6200ee",
      color: "#fff",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.chatContainer}>
      {showEmployeeList ? (
        <div style={styles.employeeList}>
          {employees.map((emp) => (
            <div
              key={emp._id}
              style={styles.employeeCard}
              onClick={() => {
                setSelectedEmployee(emp);
                setShowEmployeeList(false);
                fetchMessages(emp);
              }}
            >
              <div style={styles.employeeAvatar}>{emp.fullName?.charAt(0) || "E"}</div>
              <div style={styles.employeeInfo}>
                <strong>{emp.fullName}</strong>
                <p style={styles.employeeDept}>Tap to chat ({emp.department})</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.chatSection}>
          <div style={styles.chatHeader}>
            <button
              style={styles.backButton}
              onClick={() => {
                setShowEmployeeList(true);
                setSelectedEmployee(null);
                setMessages([]);
              }}
            >
              ←
            </button>
            <h3 style={{ marginLeft: 10 }}>{selectedEmployee?.fullName}</h3>
          </div>

          <div style={styles.messagesContainer}>
            {messages.map((msg) => {
              const isMyMessage = msg.senderType === "User" || msg.senderId === customerId;
              return (
                <div
                  key={msg._id}
                  style={{
                    ...styles.messageBubble,
                    ...(isMyMessage ? styles.myMessage : styles.otherMessage),
                  }}
                >
                  {msg.message}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputContainer}>
            <input
              style={styles.input}
              type="text"
              placeholder="Type message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button style={styles.sendButton} onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudienceChat;