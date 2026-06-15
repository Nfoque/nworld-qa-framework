import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
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

export function LayoutStandard({
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
  chatOpen,
}: LayoutProps & { chatOpen: boolean }) {
  const { t } = useTranslation();

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
            onSelect={onSelectScenario}
          />
        </CardContent>
      </Card>

      <ResizeHandle onResize={handleSidebarResize} />

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
              onClick={() => onTabChange(tab.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                px: 2,
                height: "100%",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? "primary.main" : "text.secondary",
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

          <Box
            sx={{
              ml: "auto",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mr: 1,
            }}
          >
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
                onClick={onSave}
                disabled={isSaving}
                startIcon={
                  isSaving ? (
                    <CircularProgress size={14} />
                  ) : (
                    <SaveOutlinedIcon sx={{ fontSize: 14 }} />
                  )
                }
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

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {activeTab === "description" &&
            (selectedScenario ? (
              <DescriptionEditor
                content={descriptionContent}
                editing={descriptionEditing}
                onChange={onDescriptionChange}
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
                onChange={onGherkinChange}
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
              sx={{ p: 0, "&:last-child": { pb: 0 }, height: "100%" }}
            >
              <ChatPlaceholder />
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
