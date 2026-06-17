import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { AcceptDialog } from "./accept-dialog";
import { PlanTreePanel } from "./plan-tree-panel";
import { INITIAL_STATE, reviewReducer } from "./proposal-review.reducer";
import { useAcceptProposal, useJob } from "./proposal-review.service";
import {
  buildAcceptPayload,
  clearOverrides,
  computeReviewStats,
  extractProposal,
  loadOverrides,
  saveOverrides,
} from "./proposal-review.utils";
import { ScenarioDetail } from "./scenario-detail";

import { pipelineReviewRoute } from "@/router";
import { DetailPageHeader } from "@/shared/components/detail-page-header";
import { ResizeHandle } from "@/shared/components/resize-handle";
import { useSnackbar } from "@/shared/components/snackbar-provider";
import { useSidebar } from "@/shared/layout/sidebar-context";

function ReviewChips({ state }: { state: typeof INITIAL_STATE }) {
  const { t } = useTranslation();
  const review = computeReviewStats(state);

  return (
    <>
      {review.approved > 0 && (
        <Chip
          label={`${review.approved} ${t("status.approved").toLowerCase()}`}
          size="small"
          color="success"
          variant="outlined"
          sx={{ fontSize: 11, height: 22 }}
        />
      )}
      {review.rejected > 0 && (
        <Chip
          label={`${review.rejected} ${t("status.rejected").toLowerCase()}`}
          size="small"
          color="error"
          variant="outlined"
          sx={{ fontSize: 11, height: 22 }}
        />
      )}
      {review.modified > 0 && (
        <Chip
          label={`${review.modified} ${t("review.modified").toLowerCase()}`}
          size="small"
          color="info"
          variant="outlined"
          sx={{ fontSize: 11, height: 22 }}
        />
      )}
      {review.pending > 0 && (
        <Chip
          label={`${review.pending} ${t("status.pending").toLowerCase()}`}
          size="small"
          variant="outlined"
          sx={{ fontSize: 11, height: 22 }}
        />
      )}
    </>
  );
}

export function ProposalReview() {
  const { t } = useTranslation();
  const { jobId } = useParams({ from: pipelineReviewRoute.id });
  const navigate = useNavigate();
  const { data: job, isLoading } = useJob(jobId);
  const acceptMutation = useAcceptProposal();
  const { showSnackbar } = useSnackbar();
  const { setCollapsed } = useSidebar();
  const [state, dispatch] = useReducer(reviewReducer, INITIAL_STATE);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setCollapsed(true);
    return () => setCollapsed(false);
  }, [setCollapsed]);
  const [treeWidth, setTreeWidth] = useState<number | null>(null);
  const treeWidthRef = useRef(0);

  const treeCardRef = useRef<HTMLDivElement>(null);
  const handleResize = useCallback((delta: number) => {
    if (!treeWidthRef.current && treeCardRef.current) {
      treeWidthRef.current = treeCardRef.current.offsetWidth;
    }
    treeWidthRef.current = Math.max(
      260,
      Math.min(900, treeWidthRef.current + delta),
    );
    setTreeWidth(treeWidthRef.current);
  }, []);

  useEffect(() => {
    if (!job) return;
    const proposal = extractProposal(job.steps ?? []);
    if (proposal) {
      dispatch({ type: "INIT", proposal });
      const saved = loadOverrides(job.id);
      if (saved?.size) {
        dispatch({ type: "RESTORE_OVERRIDES", overrides: saved });
      }
    }
    dispatch({ type: "MARK_INITIALIZED" });
  }, [job]);

  useEffect(() => {
    if (!jobId || !state.proposal) return;
    saveOverrides(jobId, state.overrides);
  }, [jobId, state.proposal, state.overrides]);

  const handleAccept = useCallback(() => {
    if (!state.proposal || !job) return;
    const payload = buildAcceptPayload(state.proposal, state.overrides);
    acceptMutation.mutate(
      { jobId: job.id, proposal: payload },
      {
        onSuccess: (data) => {
          clearOverrides(job.id);
          showSnackbar(
            t("review.acceptSuccess", {
              plans: data.testPlanIds.length,
              scenarios: data.totalScenarios,
            }),
            "success",
          );
          navigate({ to: "/pipelines/$jobId", params: { jobId: job.id } });
        },
        onError: () => {
          showSnackbar(t("review.acceptError"), "error");
        },
      },
    );
    setDialogOpen(false);
  }, [state, job, acceptMutation, showSnackbar, t, navigate]);

  if (isLoading || (job && !state.initialized)) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{t("pipeline.jobNotFound")}</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate({ to: "/pipelines" })}
          sx={{ mt: 2 }}
        >
          {t("pipeline.backToPipelines")}
        </Button>
      </Box>
    );
  }

  if (job.status !== "paused" && job.status !== "completed") {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ color: "warning.main" }}>
          {t("review.notReady")}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate({ to: "/pipelines/$jobId", params: { jobId } })
          }
          sx={{ mt: 2 }}
        >
          {t("review.backToPipeline")}
        </Button>
      </Box>
    );
  }

  if (!state.proposal) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{t("review.noProposal")}</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate({ to: "/pipelines/$jobId", params: { jobId } })
          }
          sx={{ mt: 2 }}
        >
          {t("review.backToPipeline")}
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <DetailPageHeader
        title={t("review.title")}
        jobId={job.id}
        status={job.status}
        createdAt={job.createdAt}
        onBack={() => navigate({ to: "/pipelines/$jobId", params: { jobId } })}
        subtitle={<ReviewChips state={state} />}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              onClick={() =>
                navigate({ to: "/pipelines/$jobId", params: { jobId } })
              }
              sx={{
                fontWeight: 600,
                textTransform: "none",
                color: "text.secondary",
              }}
            >
              {t("review.dismissProposal")}
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<CheckCircleOutlinedIcon />}
              onClick={() => setDialogOpen(true)}
              disabled={acceptMutation.isPending}
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              {acceptMutation.isPending
                ? t("review.accepting")
                : t("review.acceptProposal")}
            </Button>
          </Stack>
        }
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          mt: 2,
          flex: 1,
          minHeight: 0,
        }}
      >
        <Card
          ref={treeCardRef}
          variant="outlined"
          sx={{
            ...(treeWidth != null
              ? { width: treeWidth, flexShrink: 0 }
              : { flex: "0 0 40%" }),
            minWidth: 260,
            overflow: "auto",
          }}
        >
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <PlanTreePanel state={state} dispatch={dispatch} />
          </CardContent>
        </Card>

        <ResizeHandle onResize={handleResize} />

        <Card
          variant="outlined"
          sx={{ flex: 1, minWidth: 0, overflow: "auto" }}
        >
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <ScenarioDetail
              key={state.selection.scenarioId}
              state={state}
              dispatch={dispatch}
            />
          </CardContent>
        </Card>
      </Box>

      <AcceptDialog
        open={dialogOpen}
        state={state}
        accepting={acceptMutation.isPending}
        onConfirm={handleAccept}
        onCancel={() => setDialogOpen(false)}
      />
    </Box>
  );
}
