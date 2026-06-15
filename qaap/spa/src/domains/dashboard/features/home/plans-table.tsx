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
import { useTranslation } from "react-i18next";

import type { TestPlan } from "./home.types";

import { HealthIndicator } from "@/shared/components/health-indicator";
import { ModalityBadge } from "@/shared/components/modality-badge";
import { StatusBadge } from "@/shared/components/status-badge";
import { TABLE_HEADER_SX } from "@/shared/theme/table-styles";

interface PlansTableProps {
  plans: TestPlan[];
}

export function PlansTable({ plans }: PlansTableProps) {
  const { t } = useTranslation();

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={TABLE_HEADER_SX}>{t("tables.name")}</TableCell>
            <TableCell sx={TABLE_HEADER_SX}>{t("tables.type")}</TableCell>
            <TableCell sx={TABLE_HEADER_SX}>{t("tables.status")}</TableCell>
            <TableCell align="right" sx={TABLE_HEADER_SX}>
              {t("tables.scenarios")}
            </TableCell>
            <TableCell align="right" sx={TABLE_HEADER_SX}>
              {t("tables.passRate")}
            </TableCell>
            <TableCell sx={TABLE_HEADER_SX}>{t("tables.health")}</TableCell>
            <TableCell sx={TABLE_HEADER_SX}>{t("tables.updated")}</TableCell>
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
