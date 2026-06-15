import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

import type { GitHubRepoResource } from "./knowledge-base.types";

interface RepoCardProps {
  fullName: string;
  resource?: GitHubRepoResource;
  isLoading: boolean;
  selected: boolean;
  onToggle: (fullName: string) => void;
}

export function RepoCard({
  fullName,
  resource,
  isLoading,
  selected,
  onToggle,
}: RepoCardProps) {
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
        onClick={() => onToggle(fullName)}
        sx={{ height: "100%" }}
      >
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: 13, color: "text.primary" }}
            >
              {fullName}
            </Typography>
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

          {isLoading ? (
            <Skeleton
              variant="text"
              width="80%"
              sx={{ fontSize: 11, mt: 0.5 }}
            />
          ) : resource?.description ? (
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
              {resource.description}
            </Typography>
          ) : null}

          <Stack
            direction="row"
            spacing={0.75}
            sx={{ mt: 1, alignItems: "center" }}
          >
            {isLoading ? (
              <Skeleton variant="rounded" width={60} height={18} />
            ) : (
              <>
                {resource?.language && (
                  <Chip
                    label={resource.language}
                    size="small"
                    sx={{ fontSize: 10, height: 18 }}
                  />
                )}
                {resource?.private !== undefined &&
                  (resource.private ? (
                    <LockOutlinedIcon
                      sx={{ fontSize: 14, color: "text.secondary" }}
                    />
                  ) : (
                    <PublicOutlinedIcon
                      sx={{ fontSize: 14, color: "text.secondary" }}
                    />
                  ))}
              </>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
