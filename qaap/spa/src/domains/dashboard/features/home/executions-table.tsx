import {
  Box,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import type { Execution } from "./home.types";

import { StatusBadge } from "@/shared/components/status-badge";
import { TABLE_HEADER_SX } from "@/shared/theme/table-styles";

interface ExecutionsTableProps {
  executions: Execution[];
}

export function ExecutionsTable({ executions }: ExecutionsTableProps) {
  const { t } = useTranslation();

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={TABLE_HEADER_SX}>{t("tables.status")}</TableCell>
            <TableCell sx={TABLE_HEADER_SX}>{t("tables.env")}</TableCell>
            <TableCell sx={TABLE_HEADER_SX}>{t("tables.date")}</TableCell>
            <TableCell sx={{ ...TABLE_HEADER_SX, minWidth: 160 }}>
              {t("tables.passRate")}
            </TableCell>
            <TableCell sx={TABLE_HEADER_SX}>{t("tables.duration")}</TableCell>
            <TableCell sx={TABLE_HEADER_SX}>{t("tables.trigger")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {executions.map((ex) => (
            <TableRow key={ex.id} hover sx={{ cursor: "pointer" }}>
              <TableCell>
                <StatusBadge status={ex.status} />
              </TableCell>
              <TableCell>
                <Chip
                  label={ex.env}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: 11 }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {ex.date}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={ex.passRate}
                    sx={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "grey.100",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 3,
                        bgcolor:
                          ex.passRate >= 90
                            ? "success.main"
                            : ex.passRate >= 70
                              ? "warning.main"
                              : "error.main",
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: 12,
                      minWidth: 32,
                      textAlign: "right",
                    }}
                  >
                    {ex.passRate}%
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {ex.duration}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {ex.trigger}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
