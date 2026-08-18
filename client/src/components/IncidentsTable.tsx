import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  formatDateTime,
  formatDuration,
  incidentDurationMinutes,
  severityColor,
  severityRank,
} from "../lib/incidentFormat";
import type { Incident } from "../types/incident";

type SortKey = "id" | "title" | "severity" | "duration" | "ownerName" | "service" | "createdAt";
type SortDirection = "asc" | "desc";

interface Column {
  key: SortKey | "description";
  label: string;
  sortable: boolean;
  align?: "right";
  width?: number | string;
}

const COLUMNS: Column[] = [
  { key: "id", label: "ID", sortable: true, width: 72 },
  { key: "title", label: "Title", sortable: true, width: "22%" },
  { key: "description", label: "Description", sortable: false, width: "28%" },
  { key: "severity", label: "Severity", sortable: true, width: 116 },
  { key: "duration", label: "Duration", sortable: true, align: "right", width: 110 },
  { key: "ownerName", label: "Owner", sortable: true, width: 150 },
  { key: "service", label: "Service", sortable: true, width: 140 },
  { key: "createdAt", label: "Created at", sortable: true, width: 170 },
];

function sortValue(incident: Incident, key: SortKey): number | string {
  switch (key) {
    case "id":
      return incident.id;
    case "severity":
      return severityRank(incident.severity);
    case "duration":
      return incidentDurationMinutes(incident) ?? Number.POSITIVE_INFINITY;
    case "createdAt":
      return new Date(incident.createdAt).getTime();
    case "title":
    case "ownerName":
    case "service":
      return (incident[key] ?? "").toLowerCase();
  }
}

function compare(a: Incident, b: Incident, key: SortKey): number {
  const left = sortValue(a, key);
  const right = sortValue(b, key);
  if (typeof left === "string" && typeof right === "string") return left.localeCompare(right);
  return (left as number) - (right as number);
}

interface IncidentsTableProps {
  incidents: Incident[];
  isLoading: boolean;
}

export function IncidentsTable({ incidents, isLoading }: IncidentsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sorted = useMemo(() => {
    const rows = [...incidents].sort((a, b) => compare(a, b, sortKey));
    return sortDirection === "asc" ? rows : rows.reverse();
  }, [incidents, sortKey, sortDirection]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "createdAt" || key === "severity" ? "desc" : "asc");
    }
  };

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table size="medium" sx={{ minWidth: 1080 }}>
        <TableHead>
          <TableRow>
            {COLUMNS.map((column) => (
              <TableCell
                key={column.key}
                align={column.align}
                sx={{ width: column.width }}
                sortDirection={column.sortable && sortKey === column.key ? sortDirection : false}
              >
                {column.sortable ? (
                  <TableSortLabel
                    active={sortKey === column.key}
                    direction={sortKey === column.key ? sortDirection : "asc"}
                    onClick={() => toggleSort(column.key as SortKey)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading
            ? Array.from({ length: 5 }, (_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {COLUMNS.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : sorted.map((incident) => {
                const duration = incidentDurationMinutes(incident);
                const isOngoing = duration === null;

                return (
                  <TableRow key={incident.id} hover>
                    <TableCell sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                      #{incident.id}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {incident.title ?? "Untitled incident"}
                      </Typography>
                      {isOngoing && (
                        <Chip label="Ongoing" size="small" color="error" variant="outlined" sx={{ mt: 0.5 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={incident.description ?? ""} placement="top-start">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {incident.description ?? "—"}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={incident.severity ?? "unknown"}
                        size="small"
                        color={severityColor(incident.severity)}
                        variant="filled"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatDuration(duration)}
                    </TableCell>
                    <TableCell>{incident.ownerName ?? "Unassigned"}</TableCell>
                    <TableCell>
                      <Chip label={incident.service ?? "unknown"} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                      {formatDateTime(incident.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>

      {!isLoading && sorted.length === 0 && (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography color="text.secondary">No incidents yet.</Typography>
        </Box>
      )}
    </TableContainer>
  );
}
