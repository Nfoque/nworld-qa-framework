import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import type { LayoutVariant } from "./test-plan-detail.types";

const VARIANTS: { id: LayoutVariant; labelKey: string }[] = [
  { id: "standard", labelKey: "testPlanDetail.layoutStandard" },
  { id: "ide", labelKey: "testPlanDetail.layoutIde" },
  { id: "ai-first", labelKey: "testPlanDetail.layoutAiFirst" },
];

export function LayoutSwitcher({
  value,
  onChange,
}: {
  value: LayoutVariant;
  onChange: (v: LayoutVariant) => void;
}) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        gap: "2px",
        bgcolor: "grey.100",
        borderRadius: 1,
        p: "2px",
      }}
    >
      {VARIANTS.map((v) => (
        <Box
          key={v.id}
          onClick={() => onChange(v.id)}
          sx={{
            px: 1.25,
            py: 0.5,
            fontSize: 11,
            fontWeight: value === v.id ? 600 : 400,
            cursor: "pointer",
            borderRadius: 0.75,
            bgcolor: value === v.id ? "background.paper" : "transparent",
            color: value === v.id ? "text.primary" : "text.secondary",
            boxShadow: value === v.id ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.15s",
            userSelect: "none",
          }}
        >
          {t(v.labelKey)}
        </Box>
      ))}
    </Box>
  );
}
