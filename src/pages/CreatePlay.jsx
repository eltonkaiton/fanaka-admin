import React, { useState } from "react";

const CreatePlay = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [vipPrice, setVipPrice] = useState("");
  const [vvipPrice, setVvipPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!venue.trim()) newErrors.venue = "Venue is required";
    if (!regularPrice) newErrors.regularPrice = "Regular price is required";
    if (!vipPrice) newErrors.vipPrice = "VIP price is required";
    if (!vvipPrice) newErrors.vvipPrice = "VVIP price is required";

    const r = parseFloat(regularPrice);
    const v = parseFloat(vipPrice);
    const vv = parseFloat(vvipPrice);

    if (isNaN(r) || r < 0) newErrors.regularPrice = "Enter valid number";
    if (isNaN(v) || v < 0) newErrors.vipPrice = "Enter valid number";
    if (isNaN(vv) || vv < 0) newErrors.vvipPrice = "Enter valid number";

    if (r >= v) newErrors.priceHierarchy = "VIP price must be higher than Regular";
    if (v >= vv) newErrors.priceHierarchy = "VVIP price must be higher than VIP";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("venue", venue);
    formData.append("regularPrice", parseFloat(regularPrice));
    formData.append("vipPrice", parseFloat(vipPrice));
    formData.append("vvipPrice", parseFloat(vvipPrice));
    if (imageFile) formData.append("image", imageFile);

    try {
      if (onSubmit) await onSubmit(formData);
      alert("Play created successfully!");
      // reset form
      setTitle("");
      setDescription("");
      setDate("");
      setVenue("");
      setRegularPrice("");
      setVipPrice("");
      setVvipPrice("");
      setImageFile(null);
      setErrors({});
    } catch (err) {
      alert("Failed to create play");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) setImageFile(e.target.files[0]);
  };

  const styles = {
    container: {
      maxWidth: 800,
      margin: "40px auto",
      padding: 20,
      backgroundColor: "#f8f9fa",
      borderRadius: 8,
      fontFamily: "Arial, sans-serif",
    },
    header: { textAlign: "center", marginBottom: 25 },
    title: { fontSize: 28, fontWeight: "bold", color: "#1a1a1a" },
    subtitle: { fontSize: 14, color: "#666", marginTop: 5 },
    section: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    },
    sectionTitle: { fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 8 },
    sectionSubtitle: { fontSize: 14, color: "#666", marginBottom: 15 },
    label: { display: "block", fontWeight: 600, marginBottom: 6 },
    input: {
      width: "100%",
      padding: 12,
      fontSize: 16,
      borderRadius: 8,
      border: "1px solid #ddd",
      marginBottom: 5,
    },
    inputError: { borderColor: "#ff4444", backgroundColor: "#fff8f8" },
    errorText: { color: "#ff4444", fontSize: 12, marginBottom: 6 },
    priceBadge: {
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: 6,
      marginRight: 8,
      fontWeight: 700,
      fontSize: 14,
    },
    regularBadge: { backgroundColor: "#e6f2ff", color: "#0066cc" },
    vipBadge: { backgroundColor: "#fff0e6", color: "#ff6600" },
    vvipBadge: { backgroundColor: "#f0e6ff", color: "#9900cc" },
    imagePreview: { maxWidth: "100%", height: 200, borderRadius: 10, marginTop: 10 },
    button: {
      padding: 16,
      borderRadius: 10,
      fontWeight: "bold",
      fontSize: 16,
      cursor: "pointer",
      marginTop: 10,
      width: "100%",
    },
    createButton: { backgroundColor: "#28a745", color: "#fff", border: "none" },
    cancelButton: { backgroundColor: "#fff", color: "#dc3545", border: "1px solid #dc3545" },
    disabledButton: { opacity: 0.7, cursor: "not-allowed" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Create New Play</h1>
        <p style={styles.subtitle}>Fill in play details and pricing</p>
      </div>

      <div style={styles.section}>
        <div>
          <label style={styles.label}>Play Title *</label>
          <input
            style={{ ...styles.input, ...(errors.title && styles.inputError) }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          {errors.title && <p style={styles.errorText}>{errors.title}</p>}
        </div>

        <div>
          <label style={styles.label}>Description *</label>
          <textarea
            style={{ ...styles.input, height: 100, ...(errors.description && styles.inputError) }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
          {errors.description && <p style={styles.errorText}>{errors.description}</p>}
        </div>

        <div>
          <label style={styles.label}>Date *</label>
          <input
            type="date"
            style={styles.input}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label style={styles.label}>Venue *</label>
          <input
            style={{ ...styles.input, ...(errors.venue && styles.inputError) }}
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            disabled={loading}
          />
          {errors.venue && <p style={styles.errorText}>{errors.venue}</p>}
        </div>
      </div>

      <div style={styles.section}>
        <div style={{ marginBottom: 10 }}>
          <p style={styles.sectionTitle}>Ticket Pricing (KES)</p>
          {errors.priceHierarchy && <p style={styles.errorText}>{errors.priceHierarchy}</p>}
        </div>

        <div style={{ marginBottom: 8 }}>
          <span style={{ ...styles.priceBadge, ...styles.regularBadge }}>Regular</span>
          <input
            style={{ ...styles.input, display: "inline-block", width: "auto" }}
            value={regularPrice}
            onChange={(e) => setRegularPrice(e.target.value.replace(/[^0-9]/g, ""))}
            disabled={loading}
          />
          {errors.regularPrice && <p style={styles.errorText}>{errors.regularPrice}</p>}
        </div>

        <div style={{ marginBottom: 8 }}>
          <span style={{ ...styles.priceBadge, ...styles.vipBadge }}>VIP</span>
          <input
            style={{ ...styles.input, display: "inline-block", width: "auto" }}
            value={vipPrice}
            onChange={(e) => setVipPrice(e.target.value.replace(/[^0-9]/g, ""))}
            disabled={loading}
          />
          {errors.vipPrice && <p style={styles.errorText}>{errors.vipPrice}</p>}
        </div>

        <div style={{ marginBottom: 8 }}>
          <span style={{ ...styles.priceBadge, ...styles.vvipBadge }}>VVIP</span>
          <input
            style={{ ...styles.input, display: "inline-block", width: "auto" }}
            value={vvipPrice}
            onChange={(e) => setVvipPrice(e.target.value.replace(/[^0-9]/g, ""))}
            disabled={loading}
          />
          {errors.vvipPrice && <p style={styles.errorText}>{errors.vvipPrice}</p>}
        </div>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>Play Image (Optional)</p>
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={loading} />
        {imageFile && (
          <img
            src={URL.createObjectURL(imageFile)}
            alt="Preview"
            style={styles.imagePreview}
          />
        )}
      </div>

      <button
        style={{ ...styles.button, ...styles.createButton, ...(loading && styles.disabledButton) }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Creating Play..." : "Create Play"}
      </button>

      <button
        style={{ ...styles.button, ...styles.cancelButton }}
        onClick={() => window.history.back()}
      >
        Cancel
      </button>
    </div>
  );
};

export default CreatePlay;