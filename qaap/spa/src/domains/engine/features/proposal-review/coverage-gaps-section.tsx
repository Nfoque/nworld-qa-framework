import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import type { CoverageGap } from "./proposal-review.types";

export function CoverageGapsSection({ gaps }: { gaps: CoverageGap[] }) {
  const { t } = useTranslation();

  if (gaps.length === 0) return null;

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "warning.light",
        borderRadius: "4px !important",
        "&::before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 40 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <WarningAmberIcon fontSize="small" color="warning" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {t("review.coverageGaps", { count: gaps.length })}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <Stack spacing={1}>
          {gaps.map((gap, i) => (
            <Stack key={i} spacing={0.5}>
              <Typography variant="body2">{gap.description}</Typography>
              {gap.sources_missing.length > 0 && (
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                  {gap.sources_missing.map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ fontSize: 11 }}
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
