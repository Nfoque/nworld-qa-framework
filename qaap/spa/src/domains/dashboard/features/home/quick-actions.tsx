import AddIcon from "@mui/icons-material/Add";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const actionDefs = [
  {
    titleKey: "quickActions.newTestPlan",
    descKey: "quickActions.newTestPlanDesc",
    icon: AddIcon,
    color: "#217BEE",
    bg: "#EBF3FE",
  },
  {
    titleKey: "quickActions.runTests",
    descKey: "quickActions.runTestsDesc",
    icon: PlayCircleOutlinedIcon,
    color: "#16A34A",
    bg: "#F0FDF4",
  },
  {
    titleKey: "quickActions.aiProposals",
    descKey: "quickActions.aiProposalsDesc",
    icon: AutoAwesomeOutlinedIcon,
    color: "#EC683E",
    bg: "#FFF5F0",
  },
  {
    titleKey: "quickActions.generateReport",
    descKey: "quickActions.generateReportDesc",
    icon: AssessmentOutlinedIcon,
    color: "#8B5CF6",
    bg: "#8B5CF612",
  },
];

export function QuickActions() {
  const { t } = useTranslation();

  return (
    <Stack spacing={1}>
      {actionDefs.map((action) => (
        <ButtonBase
          key={action.titleKey}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            width: "100%",
            justifyContent: "flex-start",
            "&:hover": { bgcolor: "grey.100" },
            transition: "background 0.15s",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: action.bg,
              color: action.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <action.icon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ textAlign: "left" }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
              {t(action.titleKey)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 11 }}
            >
              {t(action.descKey)}
            </Typography>
          </Box>
        </ButtonBase>
      ))}
    </Stack>
  );
}
