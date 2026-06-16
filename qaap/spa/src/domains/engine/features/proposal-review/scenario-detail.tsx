import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RestoreIcon from "@mui/icons-material/Restore";
import { Box, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { ConfidenceIndicator } from "./confidence-indicator";
import { GherkinBlock } from "./gherkin-block";
import type { ReviewAction } from "./proposal-review.reducer";
import type { ReviewState } from "./proposal-review.types";
import {
  getEffectiveScenario,
  getEffectiveStatus,
  getSelectedArea,
  getSelectedScenario,
} from "./proposal-review.utils";

const STATUS_CHIP: Record<
  string,
  { label: string; color: "default" | "success" | "error" | "info" }
> = {
  pending: { label: "status.pending", color: "default" },
  approved: { label: "status.approved", color: "success" },
  rejected: { label: "status.rejected", color: "error" },
  modified: { label: "review.modified", color: "info" },
};

export function ScenarioDetail({
  state,
  dispatch,
}: {
  state: ReviewState;
  dispatch: React.Dispatch<ReviewAction>;
}) {
  const { t } = useTranslation();
  const { proposal, selection, overrides } = state;
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRationale, setEditRationale] = useState("");
  const [editGherkin, setEditGherkin] = useState("");

  const area = proposal ? getSelectedArea(proposal, selection) : null;

  const original = proposal ? getSelectedScenario(proposal, selection) : null;

  const scenario = original ? getEffectiveScenario(original, overrides) : null;

  const effectiveStatus = original
    ? getEffectiveStatus(original, overrides)
    : "pending";

  const hasOverride = original ? overrides.has(original.id) : false;

  const startEditing = useCallback(() => {
    if (!scenario) return;
    setEditTitle(scenario.name);
    setEditDescription(scenario.description);
    setEditRationale(scenario.rationale);
    setEditGherkin(scenario.gherkin);
    setEditing(true);
  }, [scenario]);

  const saveEdit = useCallback(() => {
    if (!original) return;
    dispatch({
      type: "EDIT_SCENARIO",
      scenarioId: original.id,
      changes: {
        name: editTitle,
        description: editDescription,
        rationale: editRationale,
        gherkin: editGherkin,
      },
    });
    setEditing(false);
  }, [dispatch, original, editTitle, editDescription, editRationale, editGherkin]);

  if (!scenario || !original) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
          p: 6,
        }}
      >
        <Typography>{t("review.selectScenario")}</Typography>
      </Box>
    );
  }

  const chipDef = STATUS_CHIP[effectiveStatus] ?? STATUS_CHIP.pending;

  return (
    <Box sx={{ flex: 1, overflow: "auto", px: 3, pt: 2, pb: 3 }}>
      <Stack spacing={2.5}>
        {/* Title */}
        {editing ? (
          <TextField
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            size="small"
            fullWidth
            autoFocus
          />
        ) : (
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {scenario.name}
          </Typography>
        )}

        {/* Metadata row */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ mt: "8px !important", alignItems: "center", flexWrap: "wrap" }}
        >
          <ConfidenceIndicator value={scenario.confidence} size="medium" />
          <Chip
            label={t(chipDef.label)}
            size="small"
            color={chipDef.color}
            sx={{ fontSize: 12 }}
          />
          {scenario.source_refs.length > 0 && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              refs: {scenario.source_refs.map((r) => r.chunk_id).join(", ")}
            </Typography>
          )}
        </Stack>

        {/* Description */}
        {(scenario.description || editing) && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: "text.secondary", mb: 0.5, fontWeight: "bold" }}
            >
              {t("review.description")}
            </Typography>
            {editing ? (
              <TextField
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                multiline
                minRows={3}
                maxRows={12}
                fullWidth
                slotProps={{
                  input: {
                    sx: {
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      fontSize: 13,
                    },
                  },
                }}
              />
            ) : (
              <Box
                component="pre"
                sx={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: 13,
                  lineHeight: 1.6,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: "grey.50",
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  m: 0,
                }}
              >
                {scenario.description}
              </Box>
            )}
          </Box>
        )}

        {/* Rationale */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ color: "text.secondary", mb: 0.5, fontWeight: "bold" }}
          >
            {t("review.rationale")}
          </Typography>
          {editing ? (
            <TextField
              value={editRationale}
              onChange={(e) => setEditRationale(e.target.value)}
              multiline
              minRows={2}
              maxRows={8}
              fullWidth
              slotProps={{
                input: {
                  sx: {
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: 13,
                  },
                },
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {scenario.rationale}
            </Typography>
          )}
        </Box>

        {/* Background (shared setup from test area) */}
        {area?.background && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: "text.secondary", mb: 0.5, fontWeight: "bold" }}
            >
              Background
            </Typography>
            <GherkinBlock text={area.background} />
          </Box>
        )}

        {/* Gherkin */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ color: "text.secondary", mb: 0.5, fontWeight: "bold" }}
          >
            Gherkin
          </Typography>
          {editing ? (
            <TextField
              value={editGherkin}
              onChange={(e) => setEditGherkin(e.target.value)}
              multiline
              minRows={6}
              maxRows={20}
              fullWidth
              slotProps={{
                input: {
                  sx: {
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: 13,
                  },
                },
              }}
            />
          ) : (
            <GherkinBlock text={scenario.gherkin} />
          )}
        </Box>

        {/* Action buttons */}
        <Stack direction="row" spacing={1}>
          {editing ? (
            <>
              <Button variant="contained" size="small" onClick={saveEdit}>
                {t("review.saveEdit")}
              </Button>
              <Button size="small" onClick={() => setEditing(false)}>
                {t("review.cancelEdit")}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<CheckCircleOutlinedIcon />}
                disabled={effectiveStatus === "approved"}
                onClick={() =>
                  dispatch({
                    type: "SET_SCENARIO_STATUS",
                    scenarioId: original.id,
                    status: "approved",
                  })
                }
              >
                {t("review.approve")}
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CancelOutlinedIcon />}
                disabled={effectiveStatus === "rejected"}
                onClick={() =>
                  dispatch({
                    type: "SET_SCENARIO_STATUS",
                    scenarioId: original.id,
                    status: "rejected",
                  })
                }
              >
                {t("review.reject")}
              </Button>
              <Button
                size="small"
                startIcon={<EditOutlinedIcon />}
                onClick={startEditing}
              >
                {t("review.edit")}
              </Button>
              {hasOverride && (
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<RestoreIcon />}
                  onClick={() =>
                    dispatch({
                      type: "RESET_SCENARIO",
                      scenarioId: original.id,
                    })
                  }
                >
                  {t("review.reset")}
                </Button>
              )}
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
