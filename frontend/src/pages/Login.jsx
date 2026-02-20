import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/I18nContext";
import { AuthLayout } from "@/components/layout/index";
import {
  Button,
  TextField,
  Checkbox,
  Alert,
  Card,
  CardContent,
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { socialAuthService } from "@/services/socialAuthService";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [socialLoading, setSocialLoading] = useState({});

  // Popup reference for social login
  const popupRef = useRef(null);
  const popupCheckInterval = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) {
      setApiError("");
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = t("required", { attribute: t("Email") });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("Email", { attribute: t("Email") });
    }

    if (!formData.password) {
      newErrors.password = t("Required", { attribute: t("Password") });
    } else if (formData.password.length < 6) {
      newErrors.password = t("Min", { attribute: t("Password"), min: 6 });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setApiError("");

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (error) {
      setApiError(error.message || t("Login failed. Please try again"));
    } finally {
      setLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider) => {
    setSocialLoading((prev) => ({ ...prev, [provider]: true }));
    setApiError("");

    try {
      const popup = await socialAuthService.loginWithProvider(provider);
      popupRef.current = popup;

      // Check if popup was blocked
      if (!popup || popup.closed) {
        throw new Error("Popup was blocked. Please allow popups for this site");
      }

      // Start polling for popup to close (indicates auth completed)
      popupCheckInterval.current = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupCheckInterval.current);
          popupCheckInterval.current = null;
          popupRef.current = null;
          // Check if user is now logged in
          checkAuthStatus();
        }
      }, 500);
    } catch (error) {
      setApiError(error.message || t("Login failed. Please try again"));
    } finally {
      setSocialLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  // Check if user is authenticated after social login
  const checkAuthStatus = async () => {
    try {
      const user = await useAuth.getState().getUser();
      if (user) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (popupCheckInterval.current) {
        clearInterval(popupCheckInterval.current);
      }
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  return (
    <AuthLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: 432,
          animation: "fadeIn 0.3s ease-in-out",
        }}
      >
        <Card sx={{ boxShadow: 4 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h5"
                component="h1"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                {t("Login to your account")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("Enter your email and password to access your account")}
              </Typography>
            </Box>

            {/* Error Alert */}
            {apiError && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => setApiError("")}
              >
                {apiError}
              </Alert>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <TextField
                label={t("Email")}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={"you@example.com"}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                autoComplete="email"
                autoFocus
                fullWidth
              />

              <Box>
                <TextField
                  label={t("Password")}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="current-password"
                  fullWidth
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Checkbox
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  label={t("Remember me")}
                />
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: "0.875rem",
                    textDecoration: "none",
                  }}
                >
                  {t("Forgot password")}
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {t("Login")}
              </Button>
            </form>

            {/* Divider */}
            <Box sx={{ position: "relative", my: 3 }}>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                />
              </Box>
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    px: 2,
                    bgcolor: "background.paper",
                    color: "text.secondary",
                  }}
                >
                  {t("Or continue with")}
                </Typography>
              </Box>
            </Box>

            {/* Social Login */}
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
            >
              <Button
                variant="outlined"
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={socialLoading.google}
                startIcon={<GoogleIcon />}
              >
                {t("Google")}
              </Button>
              <Button
                variant="outlined"
                type="button"
                onClick={() => handleSocialLogin("github")}
                disabled={socialLoading.github}
                startIcon={<GitHubIcon />}
              >
                {t("GitHub")}
              </Button>
            </Box>

            {/* Sign up link */}
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {t("Auth login no account")}{" "}
                <Link
                  to="/app/register"
                  style={{
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  {t("Sign up")}
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AuthLayout>
  );
};

export default Login;
