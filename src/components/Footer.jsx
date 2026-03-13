// src/components/Footer.jsx
import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Link
} from "@mui/material";

import {
  Facebook,
  Instagram,
  Twitter,
  LinkedIn,
  Email,
  Phone,
  LocationOn
} from "@mui/icons-material";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        background: "linear-gradient(270deg,#020617,#0f172a,#020617)",
        backgroundSize: "600% 600%",
        animation: "gradientMove 12s ease infinite",
        color: "#fff",
        mt: 6,
        overflow: "hidden"
      }}
    >
      {/* Glass effect */}
      <Box
        sx={{
          backdropFilter: "blur(12px)",
          background: "rgba(255,255,255,0.02)",
          borderTop: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={5} sx={{ py: 6 }}>

            {/* Brand */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: "#38bdf8",
                  mb: 1
                }}
              >
                Fanaka Arts
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: "#cbd5f5", mb: 2 }}
              >
                A modern platform for managing theatre performances,
                ticket bookings and entertainment events.
              </Typography>

              <Box>
                {[Facebook, Instagram, Twitter, LinkedIn].map((Icon, i) => (
                  <IconButton
                    key={i}
                    sx={{
                      color: "#94a3b8",
                      transition: "0.3s",
                      "&:hover": {
                        color: "#38bdf8",
                        transform: "translateY(-4px)"
                      }
                    }}
                  >
                    <Icon />
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* Fanaka Arts Contact */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: "#38bdf8",
                  fontWeight: 600
                }}
              >
                Fanaka Arts Contact
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <LocationOn sx={{ mr: 1, color: "#38bdf8" }} />
                <Typography variant="body2">
                  Alliance Française, Nairobi
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Phone sx={{ mr: 1, color: "#38bdf8" }} />
                <Typography variant="body2">
                  +254 712 345 678
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Email sx={{ mr: 1, color: "#38bdf8" }} />
                <Typography variant="body2">
                  info@fanakaarts.com
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Bottom section */}
          <Box
            sx={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              textAlign: "center",
              py: 3
            }}
          >
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              © {year} Fanaka Arts Management System
            </Typography>

            <Typography variant="caption" sx={{ color: "#64748b" }}>
              System developed and maintained by{" "}
              <Link
                href="https://wa.me/254797133131?text=Hello%20I%20saw%20the%20Fanaka%20Arts%20system%20and%20I%20would%20like%20to%20contact%20you."
                target="_blank"
                underline="none"
                sx={{
                  color: "#38bdf8",
                  fontWeight: 600,
                  "&:hover": {
                    textDecoration: "underline"
                  }
                }}
              >
                Ektora Softwares
              </Link>
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "#64748b",
                mt: 1
              }}
            >
              Developer Contact:{" "}
              <Link
                href="tel:0797133131"
                underline="none"
                sx={{ color: "#38bdf8" }}
              >
                0797 133 131
              </Link>{" "}
              |{" "}
              <Link
                href="mailto:eltonkaiton@gmail.com"
                underline="none"
                sx={{ color: "#38bdf8" }}
              >
                eltonkaiton@gmail.com
              </Link>
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Animation */}
      <style>
        {`
          @keyframes gradientMove {
            0% {background-position:0% 50%}
            50% {background-position:100% 50%}
            100% {background-position:0% 50%}
          }
        `}
      </style>
    </Box>
  );
};

export default Footer;