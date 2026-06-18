import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import type { JiraProject } from "@/domains/knowledge-base/features/connector-list/connector-list.types";

interface ProjectCardProps {
  projectKey: string;
  detail?: JiraProject;
  selected: boolean;
  onToggle: (projectKey: string) => void;
}

export function ProjectCard({
  projectKey,
  detail,
  selected,
  onToggle,
}: ProjectCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        ...(selected && {
          borderColor: "primary.main",
          borderWidth: 2,
          bgcolor: "primary.light",
        }),
      }}
    >
      <CardActionArea
        onClick={() => onToggle(projectKey)}
        sx={{ height: "100%" }}
      >
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              {detail?.avatarUrl && (
                <Box
                  component="img"
                  src={detail.avatarUrl}
                  alt=""
                  sx={{ width: 16, height: 16, borderRadius: 0.5 }}
                />
              )}
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, fontSize: 13, color: "text.primary" }}
              >
                {projectKey}
              </Typography>
            </Stack>
            {selected ? (
              <CheckCircleIcon
                sx={{
                  fontSize: 20,
                  color: "primary.main",
                  ml: 1,
                  flexShrink: 0,
                }}
              />
            ) : (
              <RadioButtonUncheckedIcon
                sx={{
                  fontSize: 20,
                  color: "text.disabled",
                  ml: 1,
                  flexShrink: 0,
                }}
              />
            )}
          </Stack>

          {detail?.name && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: 11,
                mt: 0.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {detail.name}
            </Typography>
          )}

          <Stack
            direction="row"
            spacing={0.75}
            sx={{ mt: 1, alignItems: "center" }}
          >
            <Chip
              icon={
                <AssignmentOutlinedIcon sx={{ fontSize: "14px !important" }} />
              }
              label={detail?.projectTypeKey ?? "software"}
              size="small"
              sx={{ fontSize: 10, height: 18 }}
            />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
