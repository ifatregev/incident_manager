import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IncidentsTable } from "../components/IncidentsTable";
import { SummaryCards } from "../components/SummaryCards";
import { useIncidents } from "../hooks/useIncidents";

export function IncidentsPage() {
  const { incidents, isLoading, error, reload } = useIncidents();

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h1">Incidents</Typography>
          <Typography color="text.secondary">
            Every incident captured from Slack, newest first.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={reload}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <SummaryCards incidents={incidents} />
      <IncidentsTable incidents={incidents} isLoading={isLoading} />
    </Stack>
  );
}
