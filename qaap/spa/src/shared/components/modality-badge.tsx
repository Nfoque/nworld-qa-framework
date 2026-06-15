import type { SvgIconComponent } from "@mui/icons-material";
import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import { Chip } from "@mui/material";

const MODALITY_MAP: Record<
  string,
  { label: string; icon: SvgIconComponent; color: string }
> = {
  web: { label: "Web", icon: ComputerOutlinedIcon, color: "#217BEE" },
  api: { label: "API", icon: TerminalOutlinedIcon, color: "#8B5CF6" },
  ios: { label: "iOS", icon: PhoneIphoneOutlinedIcon, color: "#EC683E" },
};

interface ModalityBadgeProps {
  modality: string;
}

export function ModalityBadge({ modality }: ModalityBadgeProps) {
  const config = MODALITY_MAP[modality] ?? MODALITY_MAP.web;
  const Icon = config.icon;
  return (
    <Chip
      icon={<Icon sx={{ color: `${config.color} !important`, fontSize: 16 }} />}
      label={config.label}
      size="small"
      sx={{
        color: config.color,
        bgcolor: `${config.color}12`,
        border: "none",
        fontWeight: 600,
        fontSize: 11,
      }}
    />
  );
}
