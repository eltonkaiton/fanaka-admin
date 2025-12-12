// src/components/Footer.jsx
import React from "react";
import { Box, Container, Grid, Typography, IconButton, Link } from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn, Email, Phone, LocationOn } from "@mui/icons-material";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#1a1a2e",
        color: "#ffffff",
        mt: "auto",
        borderTop: "1px solid #2d4059",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ py: 4 }}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ color: "#00adb5", fontWeight: 600 }}>
              Fanaka Arts
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "#b8b8b8" }}>
              A premier theatre company specializing in Gikuyu language comedy and cultural performances. 
              Preserving heritage through innovative storytelling.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <IconButton
                aria-label="Facebook"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#1877f2" },
                }}
                size="small"
              >
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Twitter"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#1da1f2" },
                }}
                size="small"
              >
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Instagram"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#e4405f" },
                }}
                size="small"
              >
                <Instagram fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="LinkedIn"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#0a66c2" },
                }}
                size="small"
              >
                <LinkedIn fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: "#00adb5", fontWeight: 600 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link href="/shows" underline="none" sx={{ color: "#b8b8b8", "&:hover": { color: "#00adb5" } }}>
                Upcoming Shows
              </Link>
              <Link href="/booking" underline="none" sx={{ color: "#b8b8b8", "&:hover": { color: "#00adb5" } }}>
                Book Tickets
              </Link>
              <Link href="/about" underline="none" sx={{ color: "#b8b8b8", "&:hover": { color: "#00adb5" } }}>
                About Us
              </Link>
              <Link href="/gallery" underline="none" sx={{ color: "#b8b8b8", "&:hover": { color: "#00adb5" } }}>
                Gallery
              </Link>
              <Link href="/contact" underline="none" sx={{ color: "#b8b8b8", "&:hover": { color: "#00adb5" } }}>
                Contact
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: "#00adb5", fontWeight: 600 }}>
              Contact Us
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOn sx={{ color: "#00adb5", fontSize: 16 }} />
                <Typography variant="body2" sx={{ color: "#b8b8b8" }}>
                  Alliance Française, Nairobi
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone sx={{ color: "#00adb5", fontSize: 16 }} />
                <Typography variant="body2" sx={{ color: "#b8b8b8" }}>
                  +254 712 345 678
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email sx={{ color: "#00adb5", fontSize: 16 }} />
                <Typography variant="body2" sx={{ color: "#b8b8b8" }}>
                  info@fanakaarts.com
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Admin Links (Visible only for admin users) */}
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: "#00adb5", fontWeight: 600 }}>
              Admin
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link href="/admin/dashboard" underline="none" sx={{ color: "#b8b8b8", "&:hover": { color: "#00adb5" } }}>
                Dashboard
              </Link>
              <Link href="/admin/reports" underline="none" sx={{ color: "#b8b8b8", "&:hover": { color: "#00adb5" } }}>
                Reports
              </Link>
              <Link href="/admin/settings" underline="none" sx={{ color: "#b8b8b8", "&:hover": { color: "#00adb5" } }}>
                Settings
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright Section */}
        <Box
          sx={{
            py: 2,
            borderTop: "1px solid #2d4059",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "#8a8a8a" }}>
            &copy; {currentYear} Fanaka Arts Management System. All rights reserved.
            <br />
            <Typography variant="caption" sx={{ color: "#666", display: "block", mt: 1 }}>
              Developed for Kenya Methodist University - Department of Information Technology
            </Typography>
            <Typography variant="caption" sx={{ color: "#666", display: "block" }}>
              Project by: Kevin Nyambura (BIT-0-0834-3/2015) | Supervisor: Mr. David Murithi Kaje
            </Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;