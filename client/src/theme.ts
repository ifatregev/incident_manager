import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#5b4bff" },
    background: { default: "#f6f7fb", paper: "#ffffff" },
    text: { primary: "#14121f", secondary: "#6b6375" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ['"Inter"', "system-ui", '"Segoe UI"', "Roboto", "sans-serif"].join(","),
    h1: { fontSize: "1.75rem", fontWeight: 600, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.25rem", fontWeight: 600, letterSpacing: "-0.01em" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          whiteSpace: "nowrap",
          backgroundColor: "#f1f2f8",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});
