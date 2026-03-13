import React from "react";

const ContactUs = () => {
  const styles = {
    container: {
      maxWidth: 800,
      margin: "40px auto",
      padding: 20,
      backgroundColor: "#f8f8f8",
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      fontFamily: "Arial, sans-serif",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 20,
      color: "#6200EE",
      textAlign: "center",
    },
    label: {
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 15,
      marginBottom: 5,
    },
    info: {
      fontSize: 16,
      marginBottom: 5,
      color: "#333",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Contact Us</h1>

      <div>
        <p style={styles.label}>Fanaka Arts</p>
        <p style={styles.info}>Email: info@fanakaarts.com</p>
        <p style={styles.info}>Phone: +254 798 562 533</p>
        <p style={styles.info}>Address: Nairobi, Kenya</p>
      </div>

      <div>
        <p style={styles.label}>Working Hours</p>
        <p style={styles.info}>Monday - Friday: 9:00 AM - 6:00 PM</p>
        <p style={styles.info}>Saturday: 10:00 AM - 4:00 PM</p>
        <p style={styles.info}>Sunday: Closed</p>
      </div>
    </div>
  );
};

export default ContactUs;