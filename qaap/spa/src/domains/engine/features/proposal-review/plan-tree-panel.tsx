import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import EditIcon from "@mui/icons-material/Edit";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import {
  Box,
  Button,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { ConfidenceIndicator } from "./confidence-indicator";
import { CoverageGapsSection } from "./coverage-gaps-section";
import type { ReviewAction } from "./proposal-review.reducer";
import type {
  ReviewState,
  ReviewStatus,
  ProposalScenario,
} from "./proposal-review.types";
import { getEffectiveStatus } from "./proposal-review.utils";

interface StatusCounts {
  approved: number;
  rejected: number;
  pending: number;
  modified: number;
  total: number;
}

function countStatuses(
  scenarios: ProposalScenario[],
  overrides: Map<string, { review_status?: string }>,
): StatusCounts {
  const counts: StatusCounts = {
    approved: 0,
    rejected: 0,
    pending: 0,
    modified: 0,
    total: scenarios.length,
  };
  for (const s of scenarios) {
    const status =
      (overrides.get(s.id)?.review_status as ReviewStatus) ?? s.review_status;
    counts[status]++;
  }
  return counts;
}

function StatusCountBadges({ counts }: { counts: StatusCounts }) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ flexShrink: 0, alignItems: "center" }}
    >
      {counts.approved > 0 && (
        <Typography
          component="span"
          sx={{ fontSize: 10, fontWeight: 700, color: "success.main" }}
        >
          {counts.approved}✓
        </Typography>
      )}
      {counts.rejected > 0 && (
        <Typography
          component="span"
          sx={{ fontSize: 10, fontWeight: 700, color: "error.main" }}
        >
          {counts.rejected}✗
        </Typography>
      )}
      {counts.pending > 0 && (
        <Typography
          component="span"
          sx={{ fontSize: 10, fontWeight: 600, color: "text.disabled" }}
        >
          {counts.pending}
        </Typography>
      )}
    </Stack>
  );
}

function StatusIcon({ status }: { status: ReviewStatus }) {
  const size = 14;
  switch (status) {
    case "approved":
      return <CheckCircleIcon sx={{ fontSize: size, color: "success.main" }} />;
    case "rejected":
      return <CancelIcon sx={{ fontSize: size, color: "error.main" }} />;
    case "modified":
      return <EditIcon sx={{ fontSize: size, color: "info.main" }} />;
    default:
      return <CircleOutlinedIcon sx={{ fontSize: size, color: "grey.400" }} />;
  }
}

export function PlanTreePanel({
  state,
  dispatch,
}: {
  state: ReviewState;
  dispatch: React.Dispatch<ReviewAction>;
}) {
  const { t } = useTranslation();
  const { proposal, selection, overrides, expanded } = state;

  if (!proposal) return null;

  return (
    <Box>
      <List dense disablePadding>
        {proposal.test_plans
          .filter((p) => p.test_areas.some((a) => a.scenarios.length > 0))
          .map((plan) => {
            const planExpanded = expanded[plan.id] ?? false;
            const allPlanScenarios = plan.test_areas.flatMap(
              (a) => a.scenarios,
            );
            const planCounts = countStatuses(allPlanScenarios, overrides);

            return (
              <Box key={plan.id}>
                {/* Plan level */}
                <Box
                  sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 3,
                    bgcolor: "background.paper",
                  }}
                >
                  <ListItemButton
                    selected={selection.planId === plan.id}
                    onClick={() => {
                      dispatch({ type: "TOGGLE_PLAN", planId: plan.id });
                      dispatch({ type: "SELECT_PLAN", planId: plan.id });
                    }}
                    sx={{
                      py: 0.75,
                      borderBottom: "1px solid",
                      borderColor: "grey.200",
                      "&.Mui-selected": { bgcolor: "transparent" },
                      "&.Mui-selected:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    {planExpanded ? (
                      <FolderOpenOutlinedIcon
                        sx={{ fontSize: 20, mr: 0.75, color: "primary.main" }}
                      />
                    ) : (
                      <FolderOutlinedIcon
                        sx={{ fontSize: 20, mr: 0.75, color: "text.secondary" }}
                      />
                    )}
                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          spacing={0.5}
                          sx={{ alignItems: "center", minWidth: 0 }}
                        >
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ fontWeight: 600, flex: 1, minWidth: 0 }}
                          >
                            {plan.name}
                          </Typography>
                          <StatusCountBadges counts={planCounts} />
                        </Stack>
                      }
                    />
                    {planCounts.approved < planCounts.total && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({
                            type: "APPROVE_ALL_IN_PLAN",
                            planId: plan.id,
                          });
                        }}
                        sx={{
                          ml: 1.5,
                          fontSize: 10,
                          textTransform: "none",
                          py: 0,
                          px: 1,
                          minWidth: "auto",
                          lineHeight: 1.8,
                        }}
                      >
                        {t("review.approveAll")}
                      </Button>
                    )}
                  </ListItemButton>
                </Box>

                {/* Areas */}
                <Collapse in={planExpanded}>
                  <Box
                    sx={{
                      ml: "25px",
                      borderLeft: "1px solid",
                      borderColor: "grey.300",
                    }}
                  >
                    {plan.test_areas
                      .filter((a) => a.scenarios.length > 0)
                      .map((area, areaIdx, filteredAreas) => {
                        const areaExpanded = expanded[area.id] ?? false;
                        const isLast = areaIdx === filteredAreas.length - 1;
                        const areaCounts = countStatuses(
                          area.scenarios,
                          overrides,
                        );

                        return (
                          <Box
                            key={area.id}
                            sx={
                              isLast
                                ? {
                                    ml: "-1px",
                                    pl: "1px",
                                    bgcolor: "background.paper",
                                    position: "relative",
                                    "&::before": {
                                      content: '""',
                                      position: "absolute",
                                      left: 0,
                                      top: 0,
                                      height: "50%",
                                      borderLeft: "1px solid",
                                      borderColor: "grey.300",
                                    },
                                  }
                                : undefined
                            }
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                position: "sticky",
                                top: 42,
                                zIndex: 2,
                                bgcolor: "background.paper",
                                boxShadow:
                                  "0 1px 0 0 var(--mui-palette-grey-200)",
                              }}
                            >
                              <Box
                                sx={{
                                  width: 12,
                                  flexShrink: 0,
                                  borderBottom: "1px solid",
                                  borderColor: "grey.300",
                                  alignSelf: "center",
                                }}
                              />
                              <ListItemButton
                                selected={selection.areaId === area.id}
                                onClick={() => {
                                  dispatch({
                                    type: "TOGGLE_AREA",
                                    planId: plan.id,
                                    areaId: area.id,
                                  });
                                  dispatch({
                                    type: "SELECT_AREA",
                                    planId: plan.id,
                                    areaId: area.id,
                                  });
                                }}
                                sx={{
                                  py: 0.5,
                                  pl: 0.5,
                                  flex: 1,
                                  borderBottom: "1px solid",
                                  borderColor: "grey.200",
                                  "&.Mui-selected": { bgcolor: "transparent" },
                                  "&.Mui-selected:hover": {
                                    bgcolor: "action.hover",
                                  },
                                }}
                              >
                                <ChecklistRtlIcon
                                  sx={{
                                    fontSize: 18,
                                    mr: 0.75,
                                    color: areaExpanded
                                      ? "primary.main"
                                      : "text.secondary",
                                  }}
                                />
                                <ListItemText
                                  primary={
                                    <Stack
                                      direction="row"
                                      spacing={0.5}
                                      sx={{ alignItems: "center", minWidth: 0 }}
                                    >
                                      <Typography
                                        variant="body2"
                                        noWrap
                                        sx={{
                                          fontSize: 13,
                                          fontWeight: 500,
                                          flex: 1,
                                          minWidth: 0,
                                        }}
                                      >
                                        {area.name}
                                      </Typography>
                                      <StatusCountBadges counts={areaCounts} />
                                    </Stack>
                                  }
                                />
                                {areaCounts.approved < areaCounts.total && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      dispatch({
                                        type: "APPROVE_ALL_IN_AREA",
                                        planId: plan.id,
                                        areaId: area.id,
                                      });
                                    }}
                                    sx={{
                                      ml: 1.5,
                                      fontSize: 10,
                                      textTransform: "none",
                                      py: 0,
                                      px: 1,
                                      minWidth: "auto",
                                      lineHeight: 1.8,
                                    }}
                                  >
                                    {t("review.approveAll")}
                                  </Button>
                                )}
                              </ListItemButton>
                            </Box>

                            {/* Scenarios */}
                            <Collapse in={areaExpanded}>
                              <Box>
                                {area.scenarios.map((scenario, scenarioIdx) => {
                                  const effectiveStatus = getEffectiveStatus(
                                    scenario,
                                    overrides,
                                  );
                                  return (
                                    <ListItemButton
                                      key={scenario.id}
                                      ref={
                                        selection.scenarioId === scenario.id
                                          ? (el) =>
                                              el?.scrollIntoView({
                                                block: "nearest",
                                                behavior: "smooth",
                                              })
                                          : undefined
                                      }
                                      selected={
                                        selection.scenarioId === scenario.id
                                      }
                                      onClick={() =>
                                        dispatch({
                                          type: "SELECT_SCENARIO",
                                          planId: plan.id,
                                          areaId: area.id,
                                          scenarioId: scenario.id,
                                        })
                                      }
                                      sx={{
                                        pl: 2,
                                        pr: 1,
                                        pt: 1,
                                        pb: 0.75,
                                        alignItems: "flex-start",
                                        gap: 1.5,
                                        "&.Mui-selected": {
                                          bgcolor: "grey.100",
                                        },
                                        "&.Mui-selected:hover": {
                                          bgcolor: "grey.100",
                                        },
                                      }}
                                    >
                                      <Box sx={{ mt: "-1px", flexShrink: 0 }}>
                                        <StatusIcon status={effectiveStatus} />
                                      </Box>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          flex: 1,
                                          minWidth: 0,
                                          fontSize: 12.5,
                                          lineHeight: 1.4,
                                          fontWeight:
                                            selection.scenarioId === scenario.id
                                              ? 600
                                              : 400,
                                        }}
                                      >
                                        <ConfidenceIndicator
                                          value={scenario.confidence}
                                        />{" "}
                                        {scenario.title}
                                      </Typography>
                                      <ChevronRightIcon
                                        sx={{
                                          fontSize: 16,
                                          color:
                                            selection.scenarioId === scenario.id
                                              ? "text.primary"
                                              : "grey.400",
                                          flexShrink: 0,
                                          mt: "1px",
                                        }}
                                      />
                                    </ListItemButton>
                                  );
                                })}
                              </Box>
                            </Collapse>
                          </Box>
                        );
                      })}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
      </List>

      {/* Coverage gaps at the bottom */}
      {proposal.coverage_gaps.length > 0 && (
        <Box sx={{ px: 2, pb: 2, pt: 1 }}>
          <CoverageGapsSection gaps={proposal.coverage_gaps} />
        </Box>
      )}
    </Box>
  );
}
