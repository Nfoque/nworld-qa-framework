import { Box, Chip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { ScenarioItem } from "./scenario-item";
import type { TestPlanScenario } from "./test-plan-detail.service";

export function ScenarioSidebar({
  scenarios,
  selectedId,
  onSelect,
}: {
  scenarios: TestPlanScenario[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          height: 44,
          flexShrink: 0,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "text.secondary",
          }}
        >
          {t("testPlanDetail.scenarios")}
        </Typography>
        <Chip
          label={scenarios.length}
          size="small"
          sx={{
            height: 20,
            fontSize: 11,
            fontWeight: 700,
            bgcolor: "grey.100",
            color: "text.secondary",
          }}
        />
      </Box>

      {/* Scenario list */}
      <Box sx={{ flex: 1, overflow: "auto", px: 0.5, py: 0.5 }}>
        {scenarios.map((s) => (
          <ScenarioItem
            key={s.id}
            scenario={s}
            selected={selectedId === s.id}
            onSelect={() => onSelect(s.id)}
          />
        ))}
      </Box>
    </Box>
  );
}
