import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import type { ReviewState } from "./proposal-review.types";
import { computeReviewStats } from "./proposal-review.utils";

export function AcceptDialog({
  open,
  state,
  accepting,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  state: ReviewState;
  accepting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const review = computeReviewStats(state);
  const materialized = review.approved + review.pending + review.modified;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{t("review.acceptTitle")}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ pt: 1 }}>
          <Typography variant="body2">
            {t("review.acceptDescription")}
          </Typography>

          <Stack spacing={0.5}>
            <Typography variant="body2">
              • {t("review.acceptPlans", {
                count: state.proposal?.test_plans.length ?? 0,
              })}
            </Typography>
            <Typography variant="body2" sx={{ color: "success.main" }}>
              • {t("review.acceptMaterialized", { count: materialized })}
            </Typography>
            {review.rejected > 0 && (
              <Typography variant="body2" sx={{ color: "error.main" }}>
                • {t("review.acceptExcluded", { count: review.rejected })}
              </Typography>
            )}
            {review.pending > 0 && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                • {t("review.acceptPending", { count: review.pending })}
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={accepting}>
          {t("review.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={accepting}
        >
          {accepting ? t("review.accepting") : t("review.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
