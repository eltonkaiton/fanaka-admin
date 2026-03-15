import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreatePlay() {
  const navigate = useNavigate();

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // YYYY-MM-DD
  const [venue, setVenue] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [vipPrice, setVipPrice] = useState("");
  const [vvipPrice, setVvipPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cleanup image preview on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview("");
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!venue.trim()) newErrors.venue = "Venue is required";
    if (!regularPrice.trim()) newErrors.regularPrice = "Regular price is required";
    if (!vipPrice.trim()) newErrors.vipPrice = "VIP price is required";
    if (!vvipPrice.trim()) newErrors.vvipPrice = "VVIP price is required";

    const regPrice = parseFloat(regularPrice);
    const vipP = parseFloat(vipPrice);
    const vvipP = parseFloat(vvipPrice);

    if (isNaN(regPrice) || regPrice < 0) newErrors.regularPrice = "Enter a valid price (numbers only)";
    if (isNaN(vipP) || vipP < 0) newErrors.vipPrice = "Enter a valid price (numbers only)";
    if (isNaN(vvipP) || vvipP < 0) newErrors.vvipPrice = "Enter a valid price (numbers only)";

    // Price hierarchy: VVIP > VIP > Regular
    if (regPrice >= vipP) newErrors.priceHierarchy = "VIP price must be higher than Regular";
    if (vipP >= vvipP) newErrors.priceHierarchy = "VVIP price must be higher than VIP";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("Please fix all errors before submitting.");
      return;
    }

    try {
      setLoading(true);
      const API_URL = "https://fanaka-server-1.onrender.com/api/plays";

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("date", date);
      formData.append("venue", venue.trim());
      formData.append("regularPrice", parseFloat(regularPrice));
      formData.append("vipPrice", parseFloat(vipPrice));
      formData.append("vvipPrice", parseFloat(vvipPrice));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 15000,
      });

      if (response.status === 201 || response.status === 200) {
        alert("Play created successfully!");
        // Clear form
        setTitle("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
        setVenue("");
        setRegularPrice("");
        setVipPrice("");
        setVvipPrice("");
        setImageFile(null);
        setImagePreview("");
        setErrors({});
        // Navigate back to play manager dashboard
        navigate("/play-manager");
      }
    } catch (error) {
      console.error("Create Play Error:", error);
      let errorMessage = "Failed to create play. Please try again.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timeout. Check your connection.";
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format number as currency
  const formatCurrency = (value) => {
    if (!value) return "";
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toLocaleString("en-KE");
  };

  // Inline styles (kept similar to React Native version)
  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      backgroundColor: "#f8f9fa",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    header: {
      marginBottom: "25px",
      textAlign: "center",
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#1a1a1a",
      margin: "0 0 5px 0",
    },
    subtitle: {
      fontSize: "14px",
      color: "#666",
      margin: 0,
    },
    section: {
      backgroundColor: "#fff",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#333",
      marginBottom: "8px",
    },
    sectionSubtitle: {
      fontSize: "14px",
      color: "#666",
      marginBottom: "15px",
    },
    inputGroup: {
      marginBottom: "15px",
    },
    label: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#444",
      marginBottom: "6px",
      display: "block",
    },
    input: {
      width: "100%",
      border: "1px solid #ddd",
      backgroundColor: "#fff",
      padding: "12px",
      borderRadius: "8px",
      fontSize: "16px",
      color: "#333",
      boxSizing: "border-box",
    },
    textArea: {
      minHeight: "100px",
      resize: "vertical",
    },
    inputError: {
      borderColor: "#ff4444",
      backgroundColor: "#fff8f8",
    },
    errorText: {
      color: "#ff4444",
      fontSize: "12px",
      marginTop: "4px",
      marginLeft: "4px",
    },
    dateInput: {
      width: "100%",
      border: "1px solid #ddd",
      backgroundColor: "#fff",
      padding: "12px",
      borderRadius: "8px",
      fontSize: "16px",
      color: "#333",
      boxSizing: "border-box",
    },
    disabledInput: {
      backgroundColor: "#f5f5f5",
      borderColor: "#eee",
      color: "#999",
    },
    // Pricing section
    pricingContainer: {
      marginTop: "10px",
    },
    priceInputGroup: {
      marginBottom: "18px",
    },
    priceLabelRow: {
      display: "flex",
      alignItems: "center",
      marginBottom: "8px",
    },
    priceTypeBadge: {
      padding: "4px 12px",
      borderRadius: "6px",
      marginRight: "10px",
      fontWeight: "700",
    },
    regularBadge: {
      backgroundColor: "#e6f2ff",
      color: "#0066cc",
    },
    vipBadge: {
      backgroundColor: "#fff0e6",
      color: "#ff6600",
    },
    vvipBadge: {
      backgroundColor: "#f0e6ff",
      color: "#9900cc",
    },
    priceTypeSubtext: {
      fontSize: "13px",
      color: "#666",
    },
    priceInputWrapper: {
      display: "flex",
      alignItems: "center",
      border: "1px solid #ddd",
      backgroundColor: "#fff",
      borderRadius: "8px",
      padding: "0 12px",
    },
    currencyLabel: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#333",
      marginRight: "8px",
    },
    priceInputField: {
      flex: 1,
      border: "none",
      fontSize: "16px",
      color: "#333",
      padding: "12px 5px",
      outline: "none",
    },
    formattedPriceText: {
      fontSize: "13px",
      color: "#666",
      fontStyle: "italic",
      marginTop: "4px",
      marginLeft: "4px",
    },
    priceWarning: {
      backgroundColor: "#fff8e6",
      padding: "10px",
      borderRadius: "8px",
      marginBottom: "10px",
      border: "1px solid #ffcc80",
    },
    warningText: {
      color: "#ff9800",
      fontSize: "12px",
      margin: 0,
    },
    // Image section
    pickImageButton: {
      backgroundColor: "#6200ee",
      padding: "15px",
      borderRadius: "8px",
      textAlign: "center",
      marginBottom: "15px",
      cursor: "pointer",
      color: "#fff",
      fontWeight: "600",
      fontSize: "16px",
    },
    disabledButton: {
      backgroundColor: "#999",
      cursor: "not-allowed",
    },
    imagePreviewContainer: {
      textAlign: "center",
    },
    previewImage: {
      maxWidth: "100%",
      maxHeight: "200px",
      borderRadius: "10px",
      marginBottom: "10px",
      border: "2px solid #eee",
    },
    removeButton: {
      backgroundColor: "#ff4444",
      padding: "10px 25px",
      borderRadius: "8px",
      color: "#fff",
      fontWeight: "600",
      fontSize: "14px",
      border: "none",
      cursor: "pointer",
    },
    noImageContainer: {
      height: "100px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f8f9fa",
      borderRadius: "10px",
      border: "2px dashed #ddd",
      marginBottom: "5px",
    },
    noImageText: {
      color: "#888",
      fontSize: "14px",
    },
    // Buttons
    buttonSection: {
      marginTop: "10px",
    },
    createButton: {
      backgroundColor: "#28a745",
      padding: "18px",
      borderRadius: "10px",
      textAlign: "center",
      marginBottom: "12px",
      cursor: "pointer",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    createButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: "18px",
    },
    createButtonSubtext: {
      color: "rgba(255,255,255,0.9)",
      fontSize: "12px",
      marginTop: "2px",
    },
    cancelButton: {
      padding: "16px",
      borderRadius: "10px",
      textAlign: "center",
      border: "1px solid #dc3545",
      backgroundColor: "#fff",
      cursor: "pointer",
    },
    cancelButtonText: {
      color: "#dc3545",
      fontWeight: "600",
      fontSize: "16px",
    },
    hiddenFileInput: {
      display: "none",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Create New Play</h1>
        <p style={styles.subtitle}>Fill in play details and pricing</p>
      </div>

      {/* Basic Information */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Basic Information</h2>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Play Title *</label>
          <input
            type="text"
            style={{ ...styles.input, ...(errors.title ? styles.inputError : {}) }}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors({ ...errors, title: null });
            }}
            placeholder="Enter play title"
            disabled={loading}
          />
          {errors.title && <p style={styles.errorText}>{errors.title}</p>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Description *</label>
          <textarea
            style={{ ...styles.input, ...styles.textArea, ...(errors.description ? styles.inputError : {}) }}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors({ ...errors, description: null });
            }}
            placeholder="Enter description..."
            rows={4}
            disabled={loading}
          />
          {errors.description && <p style={styles.errorText}>{errors.description}</p>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Date *</label>
          <input
            type="date"
            style={{ ...styles.dateInput, ...(loading ? styles.disabledInput : {}) }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            disabled={loading}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Venue *</label>
          <input
            type="text"
            style={{ ...styles.input, ...(errors.venue ? styles.inputError : {}) }}
            value={venue}
            onChange={(e) => {
              setVenue(e.target.value);
              if (errors.venue) setErrors({ ...errors, venue: null });
            }}
            placeholder="Enter venue location"
            disabled={loading}
          />
          {errors.venue && <p style={styles.errorText}>{errors.venue}</p>}
        </div>
      </div>

      {/* Ticket Pricing */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Ticket Pricing (KES)</h2>
        <p style={styles.sectionSubtitle}>Set prices for different ticket categories</p>

        {errors.priceHierarchy && (
          <div style={styles.priceWarning}>
            <p style={styles.warningText}>⚠️ {errors.priceHierarchy}</p>
          </div>
        )}

        <div style={styles.pricingContainer}>
          {/* Regular Price */}
          <div style={styles.priceInputGroup}>
            <div style={styles.priceLabelRow}>
              <span style={{ ...styles.priceTypeBadge, ...styles.regularBadge }}>Regular</span>
              <span style={styles.priceTypeSubtext}>Basic seating</span>
            </div>
            <div style={{ ...styles.priceInputWrapper, ...(errors.regularPrice ? styles.inputError : {}) }}>
              <span style={styles.currencyLabel}>KES</span>
              <input
                type="text"
                style={styles.priceInputField}
                value={regularPrice}
                onChange={(e) => {
                  const filtered = e.target.value.replace(/[^0-9]/g, "");
                  setRegularPrice(filtered);
                  if (errors.regularPrice) setErrors({ ...errors, regularPrice: null });
                }}
                placeholder="Enter amount"
                disabled={loading}
              />
            </div>
            {regularPrice && <p style={styles.formattedPriceText}>{formatCurrency(regularPrice)}</p>}
            {errors.regularPrice && <p style={styles.errorText}>{errors.regularPrice}</p>}
          </div>

          {/* VIP Price */}
          <div style={styles.priceInputGroup}>
            <div style={styles.priceLabelRow}>
              <span style={{ ...styles.priceTypeBadge, ...styles.vipBadge }}>VIP</span>
              <span style={styles.priceTypeSubtext}>Premium seating</span>
            </div>
            <div style={{ ...styles.priceInputWrapper, ...(errors.vipPrice ? styles.inputError : {}) }}>
              <span style={styles.currencyLabel}>KES</span>
              <input
                type="text"
                style={styles.priceInputField}
                value={vipPrice}
                onChange={(e) => {
                  const filtered = e.target.value.replace(/[^0-9]/g, "");
                  setVipPrice(filtered);
                  if (errors.vipPrice) setErrors({ ...errors, vipPrice: null });
                }}
                placeholder="Enter amount"
                disabled={loading}
              />
            </div>
            {vipPrice && <p style={styles.formattedPriceText}>{formatCurrency(vipPrice)}</p>}
            {errors.vipPrice && <p style={styles.errorText}>{errors.vipPrice}</p>}
          </div>

          {/* VVIP Price */}
          <div style={styles.priceInputGroup}>
            <div style={styles.priceLabelRow}>
              <span style={{ ...styles.priceTypeBadge, ...styles.vvipBadge }}>VVIP</span>
              <span style={styles.priceTypeSubtext}>Luxury seating</span>
            </div>
            <div style={{ ...styles.priceInputWrapper, ...(errors.vvipPrice ? styles.inputError : {}) }}>
              <span style={styles.currencyLabel}>KES</span>
              <input
                type="text"
                style={styles.priceInputField}
                value={vvipPrice}
                onChange={(e) => {
                  const filtered = e.target.value.replace(/[^0-9]/g, "");
                  setVvipPrice(filtered);
                  if (errors.vvipPrice) setErrors({ ...errors, vvipPrice: null });
                }}
                placeholder="Enter amount"
                disabled={loading}
              />
            </div>
            {vvipPrice && <p style={styles.formattedPriceText}>{formatCurrency(vvipPrice)}</p>}
            {errors.vvipPrice && <p style={styles.errorText}>{errors.vvipPrice}</p>}
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Play Image</h2>
        <p style={styles.sectionSubtitle}>Add an image for the play (Optional)</p>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={styles.hiddenFileInput}
          id="play-image-upload"
          disabled={loading}
        />
        <label htmlFor="play-image-upload" style={{ ...styles.pickImageButton, ...(loading ? styles.disabledButton : {}) }}>
          📁 Choose Image
        </label>

        {imagePreview ? (
          <div style={styles.imagePreviewContainer}>
            <img src={imagePreview} alt="Preview" style={styles.previewImage} />
            {!loading && (
              <button
                style={styles.removeButton}
                onClick={() => {
                  setImageFile(null);
                  setImagePreview("");
                  document.getElementById("play-image-upload").value = "";
                }}
              >
                Remove Image
              </button>
            )}
          </div>
        ) : (
          <div style={styles.noImageContainer}>
            <p style={styles.noImageText}>No image selected</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={styles.buttonSection}>
        <div
          style={{ ...styles.createButton, ...(loading ? styles.disabledButton : {}) }}
          onClick={!loading ? handleSubmit : null}
        >
          {loading ? (
            <span style={styles.createButtonText}>Creating Play...</span>
          ) : (
            <>
              <span style={styles.createButtonText}>Create Play</span>
              <p style={styles.createButtonSubtext}>Save and publish</p>
            </>
          )}
        </div>

        {!loading && (
          <div style={styles.cancelButton} onClick={() => navigate("/play-manager")}>
            <span style={styles.cancelButtonText}>Cancel</span>
          </div>
        )}
      </div>
    </div>
  );
}