import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import AppBar from "@mui/material/AppBar";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";
import { USE_MOCK_DATA } from "./config";
import { IncidentsPage } from "./pages/IncidentsPage";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          <Stack direction="row" spacing={1.5} sx={{ flexGrow: 1, alignItems: "center" }}>
            <MonitorHeartIcon color="primary" />
            <Typography variant="h2" component="span">
              Incident Hub
            </Typography>
          </Stack>
          {USE_MOCK_DATA && (
            <Chip label="Debug · mock data" size="small" color="warning" variant="outlined" />
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <IncidentsPage />
      </Container>
    </ThemeProvider>
  );
}

export default App;
