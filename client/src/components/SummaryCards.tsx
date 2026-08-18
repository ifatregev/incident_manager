import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatDuration, incidentDurationMinutes } from "../lib/incidentFormat";
import type { Incident } from "../types/incident";

interface SummaryCardsProps {
  incidents: Incident[];
}

export function SummaryCards({ incidents }: SummaryCardsProps) {
  const ongoing = incidents.filter((incident) => !incident.slackEnd).length;
  const urgent = incidents.filter(
    (incident) => incident.severity === "critical" || incident.severity === "high",
  ).length;

  const resolvedDurations = incidents
    .map(incidentDurationMinutes)
    .filter((minutes): minutes is number => minutes !== null);
  const averageDuration = resolvedDurations.length
    ? Math.round(resolvedDurations.reduce((sum, minutes) => sum + minutes, 0) / resolvedDurations.length)
    : null;

  const cards = [
    { label: "Total incidents", value: String(incidents.length) },
    { label: "Ongoing", value: String(ongoing), color: ongoing > 0 ? "error.main" : undefined },
    { label: "Critical / high", value: String(urgent) },
    { label: "Avg. resolution time", value: formatDuration(averageDuration) },
  ];

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      {cards.map((card) => (
        <Card key={card.label} variant="outlined" sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              {card.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: card.color }}>
              {card.value}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
