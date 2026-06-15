import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import type { ReviewState } from "./proposal-review.types";
import { computeReviewStats } from "./proposal-review.utils";

export function ReviewStatsBar({
  state,
  onAccept,
  accepting,
}: {
  state: ReviewState;
  onAccept: () => void;
  accepting: boolean;
}) {
  const { t } = useTranslation();
  const review = computeReviewStats(state);

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mt: 2 }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("review.reviewProgress")}:
      </Typography>
      {review.approved > 0 && (
        <Chip
          label={`${review.approved} ${t("status.approved").toLowerCase()}`}
          size="small"
          color="success"
          variant="outlined"
          sx={{ fontSize: 12 }}
        />
      )}
      {review.rejected > 0 && (
        <Chip
          label={`${review.rejected} ${t("status.rejected").toLowerCase()}`}
          size="small"
          color="error"
          variant="outlined"
          sx={{ fontSize: 12 }}
        />
      )}
      {review.modified > 0 && (
        <Chip
          label={`${review.modified} ${t("review.modified").toLowerCase()}`}
          size="small"
          color="info"
          variant="outlined"
          sx={{ fontSize: 12 }}
        />
      )}
      {review.pending > 0 && (
        <Chip
          label={`${review.pending} ${t("status.pending").toLowerCase()}`}
          size="small"
          variant="outlined"
          sx={{ fontSize: 12 }}
        />
      )}
      <Box sx={{ flex: 1 }} />
      <Button
        variant="contained"
        size="small"
        startIcon={<CheckCircleOutlinedIcon />}
        onClick={onAccept}
        disabled={accepting}
        sx={{ fontWeight: 700, textTransform: "none" }}
      >
        {accepting ? t("review.accepting") : t("review.acceptProposal")}
      </Button>
    </Stack>
  );
}
