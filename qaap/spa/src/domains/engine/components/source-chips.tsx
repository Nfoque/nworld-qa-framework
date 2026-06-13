import { Chip, Stack } from "@mui/material";

import {
  CONNECTOR_ICONS,
  DEFAULT_CONNECTOR_ICON,
} from "@/domains/engine/engine.constants";
import type { SelectedSource } from "@/domains/engine/features/engine-run/engine-run.types";

interface SourceChipsProps {
  sources: SelectedSource[];
}

export function SourceChips({ sources }: SourceChipsProps) {
  return (
    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75 }}>
      {sources.flatMap((s) => {
        const Icon = CONNECTOR_ICONS[s.connector] ?? DEFAULT_CONNECTOR_ICON;
        return s.items.map((item) => (
          <Chip
            key={`${s.connector}:${item}`}
            icon={<Icon sx={{ fontSize: "14px !important" }} />}
            label={item}
            size="small"
            variant="outlined"
            sx={{
              fontSize: 12,
              fontWeight: 500,
              height: 26,
              "& .MuiChip-icon": { ml: 0.5 },
            }}
          />
        ));
      })}
    </Stack>
  );
}
