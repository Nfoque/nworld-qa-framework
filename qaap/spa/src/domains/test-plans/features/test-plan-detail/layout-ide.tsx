import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SplitscreenOutlinedIcon from "@mui/icons-material/SplitscreenOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ChatPlaceholder } from "./chat-placeholder";
import { ConfidenceBar } from "./confidence-bar";
import { DescriptionEditor } from "./description-editor";
import { GherkinEditor } from "./gherkin-editor";
import { ScenarioSidebar } from "./scenario-sidebar";
import type { LayoutProps, Tab } from "./test-plan-detail.types";

import { EmptyState } from "@/shared/components/empty-state";
import { ResizeHandle } from "@/shared/components/resize-handle";

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

export function LayoutIde({
  scenarios,
  selectedScenario,
  onSelectScenario,
  activeTab,
  onTabChange,
  gherkinContent,
  descriptionContent,
  descriptionEditing,
  onDescriptionEditToggle,
  onGherkinChange,
  onDescriptionChange,
  hasDraft,
  onSave,
  isSaving,
}: LayoutProps) {
  const { t } = useTranslation();
  const [splitView, setSplitView] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState<number | null>(null);
  const sidebarWidthRef = useRef(0);
  const sidebarCardRef = useRef<HTMLDivElement>(null);
  const handleSidebarResize = useCallback((delta: number) => {
    if (!sidebarWidthRef.current && sidebarCardRef.current) {
      sidebarWidthRef.current = sidebarCardRef.current.offsetWidth;
    }
    sidebarWidthRef.current = Math.max(
      160,
      Math.min(400, sidebarWidthRef.current + delta),
    );
    setSidebarWidth(sidebarWidthRef.current);
  }, []);

  const [bottomHeight, setBottomHeight] = useState<number | null>(null);
  const bottomHeightRef = useRef(0);
  const bottomCardRef = useRef<HTMLDivElement>(null);
  const handleBottomResize = useCallback((delta: number) => {
    if (!bottomHeightRef.current && bottomCardRef.current) {
      bottomHeightRef.current = bottomCardRef.current.offsetHeight;
    }
    bottomHeightRef.current = Math.max(
      120,
      Math.min(500, bottomHeightRef.current - delta),
    );
    setBottomHeight(bottomHeightRef.current);
  }, []);

  function renderTabContent() {
    if (activeTab === "description") {
      return selectedScenario ? (
        <DescriptionEditor
          content={descriptionContent}
          editing={descriptionEditing}
          onChange={onDescriptionChange}
        />
      ) : (
        <EmptyState
          icon={
            <NotesOutlinedIcon sx={{ fontSize: 48, color: "text.disabled" }} />
          }
          title={t("testPlanDetail.noScenarios")}
        />
      );
    }
    if (activeTab === "gherkin") {
      return selectedScenario ? (
        <GherkinEditor content={gherkinContent} onChange={onGherkinChange} />
      ) : (
        <EmptyState
          icon={
            <DescriptionOutlinedIcon
              sx={{ fontSize: 48, color: "text.disabled" }}
            />
          }
          title={t("testPlanDetail.noScenarios")}
        />
      );
    }
    const placeholderKey =
      activeTab === "code"
        ? "testPlanDetail.codePlaceholder"
        : "testPlanDetail.executionsPlaceholder";
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography sx={{ color: "text.disabled", fontSize: 13 }}>
          {t(placeholderKey)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "stretch",
        mt: 2,
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Compact sidebar */}
      <Card
        ref={sidebarCardRef}
        variant="outlined"
        sx={{
          ...(sidebarWidth != null
            ? { width: sidebarWidth, flexShrink: 0 }
            : { flex: "0 0 220px" }),
          minWidth: 160,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, height: "100%" }}>
          <ScenarioSidebar
            scenarios={scenarios}
            selectedId={selectedScenario?.id ?? null}
            onSelect={onSelectScenario}
            compact
          />
        </CardContent>
      </Card>

      <ResizeHandle onResize={handleSidebarResize} />

      {/* Main area: editors top + chat bottom */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Editors area */}
        <Card
          variant="outlined"
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Dense tab bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: 36,
              flexShrink: 0,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            {TABS.map((tab) => (
              <Box
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1.5,
                  height: "100%",
                  cursor: "pointer",
                  fontSize: 12,
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
                <tab.icon sx={{ fontSize: 14 }} />
                {t(tab.labelKey)}
              </Box>
            ))}

            <Box
              sx={{
                ml: "auto",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mr: 0.5,
              }}
            >
              <Tooltip title={t("testPlanDetail.splitView")}>
                <IconButton
                  size="small"
                  onClick={() => setSplitView(!splitView)}
                  sx={{
                    color: splitView ? "primary.main" : "text.disabled",
                  }}
                >
                  <SplitscreenOutlinedIcon
                    sx={{ fontSize: 15, transform: "rotate(90deg)" }}
                  />
                </IconButton>
              </Tooltip>
              {activeTab === "description" && selectedScenario && (
                <Tooltip
                  title={
                    descriptionEditing
                      ? t("testPlanDetail.preview")
                      : t("testPlanDetail.edit")
                  }
                >
                  <IconButton
                    size="small"
                    onClick={onDescriptionEditToggle}
                    sx={{
                      color: descriptionEditing
                        ? "primary.main"
                        : "text.secondary",
                    }}
                  >
                    {descriptionEditing ? (
                      <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <EditOutlinedIcon sx={{ fontSize: 14 }} />
                    )}
                  </IconButton>
                </Tooltip>
              )}
              {hasDraft && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={onSave}
                  disabled={isSaving}
                  startIcon={
                    isSaving ? (
                      <CircularProgress size={12} />
                    ) : (
                      <SaveOutlinedIcon sx={{ fontSize: 12 }} />
                    )
                  }
                  sx={{
                    fontSize: 11,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 0.25,
                  }}
                >
                  {t("testPlanDetail.save")}
                </Button>
              )}
            </Box>
          </Box>

          {/* Editor(s) content */}
          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              ...(splitView && { gap: "1px", bgcolor: "divider" }),
            }}
          >
            <Box
              sx={{ flex: 1, overflow: "auto", bgcolor: "background.paper" }}
            >
              {renderTabContent()}
            </Box>
            {splitView && (
              <Box
                sx={{
                  flex: 1,
                  overflow: "auto",
                  bgcolor: "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ color: "text.disabled", fontSize: 13 }}>
                  {t("testPlanDetail.codePlaceholder")}
                </Typography>
              </Box>
            )}
          </Box>

          <ConfidenceBar scenarios={scenarios} />
        </Card>

        {/* Bottom chat panel (terminal style) */}
        <ResizeHandle direction="vertical" onResize={handleBottomResize} />
        <Card
          ref={bottomCardRef}
          variant="outlined"
          sx={{
            ...(bottomHeight != null
              ? { height: bottomHeight, flexShrink: 0 }
              : { flex: "0 0 200px" }),
            minHeight: 120,
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, height: "100%" }}>
            <ChatPlaceholder compact />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
