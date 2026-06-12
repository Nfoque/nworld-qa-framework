import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CableOutlinedIcon from "@mui/icons-material/CableOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
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
  Typography,
} from "@mui/material";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  isInProgress,
  useJobs,
} from "@/domains/engine/features/pipeline-list/pipeline-list.service";
import { useConnectors } from "@/domains/knowledge-base/features/connector-list/connector-list.service";
import { useAuth } from "@/shared/auth/auth-provider";
import { useTenant } from "@/shared/tenant/tenant-provider";

export const SIDEBAR_WIDTH = 240;

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
  const [settingsOpen, setSettingsOpen] = useState(false);

  const connectedCount =
    connectors?.filter((c) => c.status === "connected").length || 0;
  const pipelinesInProgress =
    jobs?.filter((j) => isInProgress(j.status)).length || 0;

  const mainNavItems = [
    {
      label: t("sidebar.dashboard"),
      icon: DashboardOutlinedIcon,
      to: "/" as const,
    },
    {
      label: t("sidebar.testPlans"),
      icon: DescriptionOutlinedIcon,
      to: null,
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
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          boxSizing: "border-box",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Box
          component="img"
          src="/logos/qaap-logo-full.png"
          alt="QAAP"
          sx={{ height: 32, objectFit: "contain", display: "block" }}
        />
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
      </Box>

      {/* Navigation */}
      <List sx={{ px: 1, flex: 1 }}>
        {[...mainNavItems, ...contextNavItems].map((item, index) => {
          const isActive = item.to ? !!matchRoute({ to: item.to }) : false;
          const isDisabled = item.to === null;
          const showDivider = index === mainNavItems.length;

          const button = (
            <ListItemButton
              key={item.label}
              disabled={isDisabled}
              sx={{
                borderRadius: 1.5,
                mb: 0.25,
                py: 0.75,
                ...(isActive && {
                  bgcolor: "primary.light",
                  color: "primary.main",
                  "&:hover": { bgcolor: "primary.light" },
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                }),
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <item.icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    sx: { fontSize: 13, fontWeight: isActive ? 600 : 500 },
                  },
                }}
              />
              {!!item.badge && (
                <Box
                  sx={{
                    bgcolor: "primary.main",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    px: 0.75,
                    py: 0.125,
                    borderRadius: 2.5,
                    lineHeight: 1.5,
                    minWidth: 18,
                    textAlign: "center",
                  }}
                >
                  {item.badge}
                </Box>
              )}
            </ListItemButton>
          );

          const rendered = item.to ? (
            <Link
              key={item.label}
              to={item.to}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {button}
            </Link>
          ) : (
            <Box key={item.label}>{button}</Box>
          );

          return showDivider ? (
            <Box key={item.label}>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  pt: 0.5,
                  pb: 0.25,
                  display: "block",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {t("sidebar.contextSection")}
              </Typography>
              {rendered}
            </Box>
          ) : (
            rendered
          );
        })}
      </List>

      {/* Settings accordion */}
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
          <Box sx={{ px: 2, pb: 1.5 }}>
            {/* Language */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 1 }}
            >
              <TranslateIcon sx={{ fontSize: 16, color: "text.secondary" }} />
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
        </Collapse>
      </Box>

      {/* User profile */}
      {profile && (
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            src={profile.avatarUrl ?? undefined}
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
        </Box>
      )}
    </Drawer>
  );
}
