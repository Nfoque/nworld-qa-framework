import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ChatPlaceholder } from "./chat-placeholder";
import { ConfidenceBar } from "./confidence-bar";
import { DescriptionEditor } from "./description-editor";
import { GherkinEditor } from "./gherkin-editor";
import { ScenarioSidebar } from "./scenario-sidebar";
import { useTestPlan } from "./test-plan-detail.service";

import { testPlanDetailRoute } from "@/router";
import { DetailPageHeader } from "@/shared/components/detail-page-header";
import { EmptyState } from "@/shared/components/empty-state";
import { ModalityBadge } from "@/shared/components/modality-badge";
import { ResizeHandle } from "@/shared/components/resize-handle";
import { StatusBadge } from "@/shared/components/status-badge";
import { useSidebar } from "@/shared/layout/sidebar-context";

type Tab = "description" | "gherkin" | "code" | "executions";

const TABS: {
  id: Tab;
  labelKey: string;
  icon: typeof DescriptionOutlinedIcon;
}[] = [
  {
    id: "description",
    labelKey: "testPlanDetail.description",
    icon: NotesOutlinedIcon,
  },
  {
    id: "gherkin",
    labelKey: "testPlanDetail.gherkin",
    icon: DescriptionOutlinedIcon,
  },
  {
    id: "code",
    labelKey: "testPlanDetail.generatedCode",
    icon: CodeOutlinedIcon,
  },
  {
    id: "executions",
    labelKey: "testPlanDetail.executions",
    icon: PlayCircleOutlinedIcon,
  },
];

export function TestPlanDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { planId } = testPlanDetailRoute.useParams();
  const { data: plan, isLoading, error } = useTestPlan(planId);
  const { setCollapsed } = useSidebar();

  useEffect(() => {
    setCollapsed(true);
    return () => setCollapsed(false);
  }, [setCollapsed]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const [chatOpen, setChatOpen] = useState(true);
  const [gherkinDraft, setGherkinDraft] = useState<string | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState<string | null>(null);
  const [descriptionEditing, setDescriptionEditing] = useState(false);

  const scenarios = plan?.scenarios ?? [];

  const selectedScenario = useMemo(
    () => scenarios.find((s) => s.id === selectedId) ?? scenarios[0] ?? null,
    [scenarios, selectedId],
  );

  const prevSelectedRef = useRef<string | null>(null);
  useEffect(() => {
    const id = selectedScenario?.id ?? null;
    if (id !== prevSelectedRef.current) {
      prevSelectedRef.current = id;
      setGherkinDraft(null);
      setDescriptionDraft(null);
      setDescriptionEditing(false);
    }
  }, [selectedScenario?.id]);

  const sourceModel = useMemo(() => {
    const models = new Set(
      scenarios.map((s) => s.source_model).filter(Boolean),
    );
    return models.size === 1 ? [...models][0] : null;
  }, [scenarios]);

  const gherkinBase = useMemo(() => {
    if (!selectedScenario) return "";
    const pct = Math.round(selectedScenario.confidence * 100);
    return `@${selectedScenario.review_status} @confidence:${pct}\n${selectedScenario.gherkin_text}`;
  }, [selectedScenario]);

  const gherkinContent = gherkinDraft ?? gherkinBase;
  const descriptionContent =
    descriptionDraft ?? selectedScenario?.description ?? "";
  const hasDraft = gherkinDraft !== null || descriptionDraft !== null;

  // Resize: sidebar
  const [sidebarWidth, setSidebarWidth] = useState<number | null>(null);
  const sidebarWidthRef = useRef(0);
  const sidebarCardRef = useRef<HTMLDivElement>(null);
  const handleSidebarResize = useCallback((delta: number) => {
    if (!sidebarWidthRef.current && sidebarCardRef.current) {
      sidebarWidthRef.current = sidebarCardRef.current.offsetWidth;
    }
    sidebarWidthRef.current = Math.max(
      200,
      Math.min(500, sidebarWidthRef.current + delta),
    );
    setSidebarWidth(sidebarWidthRef.current);
  }, []);

  // Resize: chat
  const [chatWidth, setChatWidth] = useState<number | null>(null);
  const chatWidthRef = useRef(0);
  const chatCardRef = useRef<HTMLDivElement>(null);
  const handleChatResize = useCallback((delta: number) => {
    if (!chatWidthRef.current && chatCardRef.current) {
      chatWidthRef.current = chatCardRef.current.offsetWidth;
    }
    chatWidthRef.current = Math.max(
      200,
      Math.min(500, chatWidthRef.current - delta),
    );
    setChatWidth(chatWidthRef.current);
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{t("testPlanDetail.loadError")}</Alert>
      </Box>
    );
  }

  if (!plan) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">{t("testPlanDetail.notFound")}</Alert>
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
        title={plan.name}
        onBack={() => navigate({ to: "/test-plans" })}
        subtitle={
          <>
            <ModalityBadge modality={plan.modality} />
            <StatusBadge status={plan.status} />
            {sourceModel && (
              <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
                {t("testPlanDetail.generatedBy", { model: sourceModel })}
              </Typography>
            )}
          </>
        }
        action={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<ChatBubbleOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => setChatOpen(!chatOpen)}
              sx={{
                fontSize: 12,
                textTransform: "none",
                fontWeight: 600,
                color: "text.secondary",
              }}
            >
              {chatOpen
                ? t("testPlanDetail.hideChat")
                : t("testPlanDetail.showChat")}
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              disabled
              sx={{
                fontSize: 12,
                textTransform: "none",
                color: "text.secondary",
              }}
            >
              {t("testPlanDetail.export")}
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<PlayArrowOutlinedIcon sx={{ fontSize: 16 }} />}
              disabled
              sx={{ fontSize: 12, textTransform: "none", fontWeight: 700 }}
            >
              {t("testPlanDetail.run")}
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
        {/* Scenario sidebar */}
        <Card
          ref={sidebarCardRef}
          variant="outlined"
          sx={{
            ...(sidebarWidth != null
              ? { width: sidebarWidth, flexShrink: 0 }
              : { flex: "0 0 260px" }),
            minWidth: 200,
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, height: "100%" }}>
            <ScenarioSidebar
              scenarios={scenarios}
              selectedId={selectedScenario?.id ?? null}
              onSelect={setSelectedId}
            />
          </CardContent>
        </Card>

        <ResizeHandle onResize={handleSidebarResize} />

        {/* Editor area */}
        <Card
          variant="outlined"
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Tabs */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: 44,
              flexShrink: 0,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            {TABS.map((tab) => (
              <Box
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 2,
                  height: "100%",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  color:
                    activeTab === tab.id ? "primary.main" : "text.secondary",
                  borderBottom: "2px solid",
                  borderColor:
                    activeTab === tab.id ? "primary.main" : "transparent",
                  transition: "all 0.15s",
                  "&:hover": { color: "text.primary" },
                }}
              >
                <tab.icon sx={{ fontSize: 16 }} />
                {t(tab.labelKey)}
              </Box>
            ))}

            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5, mr: 1 }}>
              {activeTab === "description" && selectedScenario && (
                <Tooltip title={descriptionEditing ? t("testPlanDetail.preview") : t("testPlanDetail.edit")}>
                  <IconButton
                    size="small"
                    onClick={() => setDescriptionEditing(!descriptionEditing)}
                    sx={{ color: descriptionEditing ? "primary.main" : "text.secondary" }}
                  >
                    {descriptionEditing ? (
                      <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <EditOutlinedIcon sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                </Tooltip>
              )}
              {hasDraft && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<SaveOutlinedIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    fontSize: 12,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {t("testPlanDetail.save")}
                </Button>
              )}
            </Box>
          </Box>

          {/* Tab content */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {activeTab === "description" &&
              (selectedScenario ? (
                <DescriptionEditor
                  content={descriptionContent}
                  editing={descriptionEditing}
                  onChange={(value) => setDescriptionDraft(value)}
                />
              ) : (
                <EmptyState
                  icon={
                    <NotesOutlinedIcon
                      sx={{ fontSize: 48, color: "text.disabled" }}
                    />
                  }
                  title={t("testPlanDetail.noScenarios")}
                />
              ))}
            {activeTab === "gherkin" &&
              (selectedScenario ? (
                <GherkinEditor
                  content={gherkinContent}
                  onChange={(value) => setGherkinDraft(value)}
                />
              ) : (
                <EmptyState
                  icon={
                    <DescriptionOutlinedIcon
                      sx={{ fontSize: 48, color: "text.disabled" }}
                    />
                  }
                  title={t("testPlanDetail.noScenarios")}
                />
              ))}
            {activeTab === "code" && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography sx={{ color: "text.disabled", fontSize: 13 }}>
                  {t("testPlanDetail.codePlaceholder")}
                </Typography>
              </Box>
            )}
            {activeTab === "executions" && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography sx={{ color: "text.disabled", fontSize: 13 }}>
                  {t("testPlanDetail.executionsPlaceholder")}
                </Typography>
              </Box>
            )}
          </Box>

          <ConfidenceBar scenarios={scenarios} />
        </Card>

        {/* Chat panel */}
        {chatOpen && (
          <>
            <ResizeHandle onResize={handleChatResize} />
            <Card
              ref={chatCardRef}
              variant="outlined"
              sx={{
                ...(chatWidth != null
                  ? { width: chatWidth, flexShrink: 0 }
                  : { flex: "0 0 300px" }),
                minWidth: 200,
              }}
            >
              <CardContent
                sx={{
                  p: 0,
                  "&:last-child": { pb: 0 },
                  height: "100%",
                }}
              >
                <ChatPlaceholder />
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </Box>
  );
}
