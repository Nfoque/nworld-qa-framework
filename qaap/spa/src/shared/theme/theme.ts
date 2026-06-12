import { createTheme, type Theme } from "@mui/material/styles";

import type { TenantBranding } from "@/shared/auth/auth.types";

const DEFAULTS = {
  primaryColor: "#217BEE",
  primaryColorLight: "#EBF3FE",
  primaryColorDark: "#1860BE",
} as const;

export function createAppTheme(branding: TenantBranding = {}): Theme {
  const primary = branding.primaryColor ?? DEFAULTS.primaryColor;
  const primaryLight = branding.primaryColorLight ?? DEFAULTS.primaryColorLight;
  const primaryDark = branding.primaryColorDark ?? DEFAULTS.primaryColorDark;

  return createTheme({
    palette: {
      mode: "light",
      primary: { main: primary, dark: primaryDark, light: primaryLight },
      secondary: { main: "#EC683E" },
      error: { main: "#D13B5F", light: "#FDF2F5" },
      warning: { main: "#EC683E", light: "#FFF5F0" },
      success: { main: "#16A34A", light: "#F0FDF4" },
      info: { main: primary, light: primaryLight },
      text: { primary: "#100D25", secondary: "#5D6066" },
      background: { default: "#F3F3F3", paper: "#FFFFFF" },
      divider: "#E1E1E1",
      grey: {
        100: "#F3F3F3",
        200: "#E1E1E1",
        300: "#BFBFBF",
        500: "#82858D",
        700: "#5D6066",
      },
    },
    typography: {
      fontFamily: "'Instrument Sans', system-ui, sans-serif",
      h1: {
        fontFamily: "'Sora', system-ui, sans-serif",
        fontWeight: 700,
        letterSpacing: "-0.03em",
      },
      h2: {
        fontFamily: "'Sora', system-ui, sans-serif",
        fontWeight: 700,
        letterSpacing: "-0.03em",
      },
      h3: {
        fontFamily: "'Sora', system-ui, sans-serif",
        fontWeight: 700,
        letterSpacing: "-0.02em",
      },
      h4: {
        fontFamily: "'Sora', system-ui, sans-serif",
        fontWeight: 700,
        letterSpacing: "-0.02em",
      },
      h5: {
        fontFamily: "'Sora', system-ui, sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
      h6: {
        fontFamily: "'Sora', system-ui, sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", fontWeight: 600 },
        },
        defaultProps: { disableElevation: true },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { border: "1px solid #E1E1E1" },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { border: "1px solid #E1E1E1", borderRadius: 12 },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { border: "none", borderRight: "1px solid #E1E1E1" },
        },
      },
      MuiTextField: {
        defaultProps: { variant: "outlined", size: "small" },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
    },
  });
}
