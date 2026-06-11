import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#217BEE", dark: "#1860BE", light: "#EBF3FE" },
    secondary: { main: "#EC683E" },
    error: { main: "#D13B5F", light: "#FDF2F5" },
    warning: { main: "#EC683E", light: "#FFF5F0" },
    success: { main: "#16A34A", light: "#F0FDF4" },
    info: { main: "#217BEE", light: "#EBF3FE" },
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
