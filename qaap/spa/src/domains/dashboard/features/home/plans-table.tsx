import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { TestPlan } from "./home.types";

import { HealthIndicator } from "@/shared/components/health-indicator";
import { ModalityBadge } from "@/shared/components/modality-badge";
import { StatusBadge } from "@/shared/components/status-badge";

interface PlansTableProps {
  plans: TestPlan[];
}

export function PlansTable({ plans }: PlansTableProps) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "text.secondary",
              }}
            >
              Name
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "text.secondary",
              }}
            >
              Type
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "text.secondary",
              }}
            >
              Status
            </TableCell>
            <TableCell
              align="right"
              sx={{
                fontWeight: 600,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "text.secondary",
              }}
            >
              Scenarios
            </TableCell>
            <TableCell
              align="right"
              sx={{
                fontWeight: 600,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "text.secondary",
              }}
            >
              Pass Rate
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "text.secondary",
              }}
            >
              Health
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "text.secondary",
              }}
            >
              Updated
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id} hover sx={{ cursor: "pointer" }}>
              <TableCell>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {plan.framework}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <ModalityBadge modality={plan.modality} />
              </TableCell>
              <TableCell>
                <StatusBadge status={plan.status} />
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">{plan.scenarioCount}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {plan.passRate != null ? `${plan.passRate}%` : "—"}
                </Typography>
              </TableCell>
              <TableCell>
                {plan.health ? (
                  <HealthIndicator health={plan.health} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {plan.lastUpdated}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
