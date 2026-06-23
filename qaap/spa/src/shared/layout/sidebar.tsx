import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CableOutlinedIcon from "@mui/icons-material/CableOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TranslateIcon from "@mui/icons-material/Translate";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import {
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { keyframes } from "@mui/system";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  isInProgress,
  useJobs,
} from "@/domains/engine/features/pipeline-list/pipeline-list.service";
import { useConnectors } from "@/domains/knowledge-base/features/connector-list/connector-list.service";
import { useLlmProviders } from "@/domains/settings/features/llm-providers/llm-provider.service";
import { useAuth } from "@/shared/auth/auth-provider";
import { useSidebar } from "@/shared/layout/sidebar-context";
import { useTenant } from "@/shared/tenant/tenant-provider";

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 68;

const TRANSITION = "width 0.2s ease-in-out";

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const matchRoute = useMatchRoute();
  const { profile, signOut } = useAuth();
  const {
    activeTenantId,
    setActiveTenantId,
    tenants,
    isLoadingTenants,
    isSuperadmin,
  } = useTenant();
  const { data: connectors } = useConnectors();
  const { data: jobs } = useJobs();
  const { data: llmProviders } = useLlmProviders();
  const { collapsed, setCollapsed } = useSidebar();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const connectedCount =
    connectors?.filter((c) => c.status === "connected").length || 0;
  const pipelinesInProgress =
    jobs?.filter((j) => isInProgress(j.status)).length || 0;

  const mainNavItems = [
    {
      label: t("sidebar.dashboard"),
      icon: DashboardOutlinedIcon,
      to: null,
    },
    {
      label: t("sidebar.testPlans"),
      icon: DescriptionOutlinedIcon,
      to: "/test-plans" as const,
    },
    { label: t("sidebar.health"), icon: MonitorHeartOutlinedIcon, to: null },
    {
      label: t("sidebar.aiProposals"),
      icon: AutoAwesomeOutlinedIcon,
      to: null,
      badge: 3,
    },
    {
      label: t("sidebar.executions"),
      icon: PlayCircleOutlinedIcon,
      to: null,
    },
    { label: t("sidebar.schedules"), icon: ScheduleOutlinedIcon, to: null },
    { label: t("sidebar.reports"), icon: AssessmentOutlinedIcon, to: null },
  ];

  const contextNavItems = [
    {
      label: t("sidebar.llmProviders"),
      icon: PsychologyOutlinedIcon,
      to: "/settings" as const,
      badge:
        llmProviders?.providers.filter((p) => p.status !== "not_configured")
          .length || 0,
    },
    {
      label: t("sidebar.connectors"),
      icon: CableOutlinedIcon,
      to: "/connectors" as const,
      badge: connectedCount,
    },
    {
      label: t("sidebar.knowledgeBase"),
      icon: MenuBookOutlinedIcon,
      to: "/knowledge-base" as const,
    },
    {
      label: t("sidebar.pipelines"),
      icon: AccountTreeOutlinedIcon,
      to: "/pipelines" as const,
      badge: pipelinesInProgress,
      pulse: pipelinesInProgress > 0,
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        transition: TRANSITION,
        "& .MuiDrawer-paper": {
          width,
          transition: TRANSITION,
          boxSizing: "border-box",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: collapsed ? 1 : 2,
          pt: 1.5,
          pb: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: collapsed ? "center" : "flex-start",
          }}
        >
          <Box
            component="img"
            src={
              collapsed
                ? "/logos/qaap-logo-img.png"
                : "/logos/qaap-logo-full.png"
            }
            alt="QAAP"
            sx={{
              height: collapsed ? 24 : 32,
              objectFit: "contain",
              display: "block",
            }}
          />
          {!collapsed && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mt: 0.5,
                px: 0.5,
              }}
            >
              <Typography
                sx={{ fontSize: 9, color: "text.secondary", fontWeight: 500 }}
              >
                {t("sidebar.poweredBy")}
              </Typography>
              <Box
                component="img"
                src="/logos/nfq-logo.png"
                alt="NFQ"
                sx={{ height: 14, objectFit: "contain" }}
              />
            </Box>
          )}
        </Box>
        {!collapsed && (
          <IconButton
            size="small"
            onClick={() => setCollapsed(true)}
            sx={{ color: "text.secondary", mt: 0.25 }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ px: 1, flex: 1 }}>
        {[...mainNavItems, ...contextNavItems].map((item, index) => {
          const isActive = item.to ? !!matchRoute({ to: item.to }) : false;
          const isDisabled = item.to === null;
          const showDivider = index === mainNavItems.length;
          const shouldPulse = "pulse" in item && !!item.pulse;

          const button = (
            <ListItemButton
              key={item.label}
              disabled={isDisabled}
              sx={{
                borderRadius: 1.5,
                mb: 0,
                py: 0.5,
                pr: collapsed ? 1 : 1.25,
                pl: collapsed ? 1 : 0.25,
                justifyContent: collapsed ? "center" : "flex-start",
                ...(isActive && {
                  bgcolor: "primary.light",
                  color: "primary.main",
                  "&:hover": { bgcolor: "primary.light" },
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                }),
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 36,
                  justifyContent: "center",
                }}
              >
                <item.icon fontSize="small" />
              </ListItemIcon>
              {!collapsed && (
                <>
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: 13,
                          fontWeight: isActive ? 600 : 500,
                        },
                      },
                    }}
                  />
                  {!!item.badge && (
                    <Box
                      sx={{
                        bgcolor: shouldPulse ? "#8B5CF6" : "primary.main",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        px: 0.75,
                        py: 0.125,
                        borderRadius: 2.5,
                        lineHeight: 1.5,
                        minWidth: 18,
                        textAlign: "center",
                        ...(shouldPulse && {
                          animation: `${pulse} 1.5s ease-in-out infinite`,
                        }),
                      }}
                    >
                      {item.badge}
                    </Box>
                  )}
                </>
              )}
              {collapsed && !!item.badge && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: shouldPulse ? "error.main" : "primary.main",
                    ...("pulse" in item &&
                      item.pulse && {
                        animation: `${pulse} 1.5s ease-in-out infinite`,
                      }),
                  }}
                />
              )}
            </ListItemButton>
          );

          const wrappedButton = collapsed ? (
            <Tooltip title={item.label} placement="right" arrow>
              <span>{button}</span>
            </Tooltip>
          ) : (
            button
          );

          const rendered = item.to ? (
            <Link
              key={item.label}
              to={item.to}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {wrappedButton}
            </Link>
          ) : (
            <Box key={item.label}>{wrappedButton}</Box>
          );

          return showDivider ? (
            <Box key={item.label}>
              <Divider sx={{ my: 1 }} />
              {rendered}
            </Box>
          ) : (
            rendered
          );
        })}
      </List>

      {/* Settings accordion — hidden when collapsed */}
      {!collapsed && (
        <Box sx={{ px: 1, borderTop: "1px solid", borderColor: "divider" }}>
          <ListItemButton
            onClick={() => setSettingsOpen(!settingsOpen)}
            sx={{ borderRadius: 1.5, my: 0.5, py: 0.75 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <SettingsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t("sidebar.settings")}
              slotProps={{
                primary: { sx: { fontSize: 13, fontWeight: 500 } },
              }}
            />
            <ExpandMoreIcon
              sx={{
                fontSize: 18,
                color: "text.secondary",
                transform: settingsOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </ListItemButton>
          <Collapse in={settingsOpen}>
            <Box sx={{ pb: 1.5 }}>
              <Box sx={{ px: 2 }}>
                {/* Language */}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center", mb: 1 }}
                >
                  <TranslateIcon
                    sx={{ fontSize: 16, color: "text.secondary" }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "text.secondary",
                    }}
                  >
                    {t("sidebar.language")}
                  </Typography>
                </Stack>
                <ToggleButtonGroup
                  value={i18n.language?.startsWith("es") ? "es" : "en"}
                  exclusive
                  onChange={(_, lang) => {
                    if (lang) i18n.changeLanguage(lang);
                  }}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiToggleButton-root": {
                      fontSize: 12,
                      fontWeight: 600,
                      py: 0.5,
                      textTransform: "none",
                    },
                  }}
                >
                  <ToggleButton value="es">Español</ToggleButton>
                  <ToggleButton value="en">English</ToggleButton>
                </ToggleButtonGroup>

                {/* Workspace (superadmin only) */}
                {isSuperadmin && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: 11,
                        fontWeight: 600,
                        mb: 0.75,
                        display: "block",
                      }}
                    >
                      {t("sidebar.workspace")}
                    </Typography>
                    {isLoadingTenants ? (
                      <Skeleton variant="rounded" width="100%" height={34} />
                    ) : (
                      <Select
                        value={activeTenantId ?? ""}
                        onChange={(e) => setActiveTenantId(e.target.value)}
                        size="small"
                        IconComponent={UnfoldMoreIcon}
                        sx={{
                          width: "100%",
                          fontWeight: 700,
                          fontFamily: "'Sora', sans-serif",
                          fontSize: 13,
                          "& .MuiSelect-select": { py: 0.75, px: 1 },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "divider",
                          },
                        }}
                      >
                        {tenants.map((tenant) => (
                          <MenuItem
                            key={tenant.id}
                            value={tenant.id}
                            sx={{ fontSize: 13 }}
                          >
                            {tenant.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Collapse>
        </Box>
      )}

      {/* Expand toggle (collapsed only) */}
      {collapsed && (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <IconButton
            size="small"
            onClick={() => setCollapsed(false)}
            sx={{ color: "text.secondary" }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* User profile */}
      {profile && (
        <Box
          sx={{
            p: collapsed ? 1 : 2,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: collapsed ? 0 : 1.5,
          }}
        >
          <Tooltip
            title={
              collapsed
                ? `${profile.name || profile.email} · ${profile.role}`
                : ""
            }
            placement="right"
            arrow
          >
            <Avatar
              src={profile.avatarUrl ?? undefined}
              slotProps={{ img: { referrerPolicy: "no-referrer" } }}
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.main",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {(profile.name?.[0] ?? profile.email[0]).toUpperCase()}
            </Avatar>
          </Tooltip>
          {!collapsed && (
            <>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}
                  noWrap
                >
                  {profile.name || profile.email}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: 11 }}
                  noWrap
                >
                  {profile.role}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={signOut}
                sx={{ color: "text.secondary" }}
              >
                <LogoutOutlinedIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      )}
    </Drawer>
  );
}
