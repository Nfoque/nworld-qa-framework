import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import type { SupabaseBucket } from "@/domains/knowledge-base/features/connector-list/connector-list.types";

interface BucketCardProps {
  bucketId: string;
  detail?: SupabaseBucket;
  selected: boolean;
  onToggle: (bucketId: string) => void;
}

export function BucketCard({
  bucketId,
  detail,
  selected,
  onToggle,
}: BucketCardProps) {
  const { t } = useTranslation();

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
        onClick={() => onToggle(bucketId)}
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
              {bucketId}
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
            {t("knowledgeBase.bucketSubtitle")}
          </Typography>

          <Stack
            direction="row"
            spacing={0.75}
            sx={{ mt: 1, alignItems: "center" }}
          >
            <Chip
              icon={<FolderOutlinedIcon sx={{ fontSize: "14px !important" }} />}
              label={t("knowledgeBase.storage")}
              size="small"
              sx={{ fontSize: 10, height: 18 }}
            />
            {detail?.public !== undefined &&
              (detail.public ? (
                <PublicOutlinedIcon
                  sx={{ fontSize: 14, color: "text.secondary" }}
                />
              ) : (
                <LockOutlinedIcon
                  sx={{ fontSize: 14, color: "text.secondary" }}
                />
              ))}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
