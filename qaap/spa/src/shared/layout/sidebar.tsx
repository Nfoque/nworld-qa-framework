import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CableOutlinedIcon from "@mui/icons-material/CableOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import {
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  Typography,
} from "@mui/material";
import { Link, useMatchRoute } from "@tanstack/react-router";

import { useAuth } from "@/shared/auth/auth-provider";
import { useTenant } from "@/shared/tenant/tenant-provider";

export const SIDEBAR_WIDTH = 240;

const navItems = [
  { label: "Dashboard", icon: DashboardOutlinedIcon, to: "/" as const },
  { label: "Test Plans", icon: DescriptionOutlinedIcon, to: null },
  { label: "Health", icon: MonitorHeartOutlinedIcon, to: null },
  { label: "AI Proposals", icon: AutoAwesomeOutlinedIcon, to: null, badge: 3 },
  { label: "Executions", icon: PlayCircleOutlinedIcon, to: null },
  { label: "Schedules", icon: ScheduleOutlinedIcon, to: null },
  { label: "Reports", icon: AssessmentOutlinedIcon, to: null },
  { label: "Connectors", icon: CableOutlinedIcon, to: "/connectors" as const },
];

export function Sidebar() {
  const matchRoute = useMatchRoute();
  const { profile, signOut } = useAuth();
  const {
    activeTenantId,
    activeTenantName,
    setActiveTenantId,
    tenants,
    isLoadingTenants,
    isSuperadmin,
  } = useTenant();

  const renderTenantHeader = () => {
    if (isSuperadmin && isLoadingTenants) {
      return <Skeleton variant="rounded" width="100%" height={34} />;
    }

    if (isSuperadmin && tenants.length > 0) {
      return (
        <Select
          value={activeTenantId ?? ""}
          onChange={(e) => setActiveTenantId(e.target.value)}
          size="small"
          IconComponent={UnfoldMoreIcon}
          sx={{
            width: "100%",
            fontWeight: 700,
            fontFamily: "'Sora', sans-serif",
            fontSize: 14,
            "& .MuiSelect-select": { py: 0.75, px: 1 },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
          }}
        >
          {tenants.map((t) => (
            <MenuItem key={t.id} value={t.id} sx={{ fontSize: 13 }}>
              {t.name}
            </MenuItem>
          ))}
        </Select>
      );
    }

    return (
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          fontFamily: "'Sora', sans-serif",
          lineHeight: 1.3,
        }}
      >
        {activeTenantName ?? "QAAP"}
      </Typography>
    );
  };

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
      {/* Header: tenant + subtitle + powered by */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        {renderTenantHeader()}
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "block",
            fontSize: 10,
            mt: 0.5,
            px: 0.5,
          }}
        >
          QA Automation Platform
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mt: 0.25,
            px: 0.5,
          }}
        >
          <Typography
            sx={{ fontSize: 9, color: "text.secondary", fontWeight: 500 }}
          >
            powered by
          </Typography>
          <Box
            component="img"
            src="/nfq-logo.png"
            alt="NFQ"
            sx={{ height: 14, objectFit: "contain" }}
          />
        </Box>
      </Box>

      {/* Main navigation */}
      <List sx={{ px: 1, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = item.to ? !!matchRoute({ to: item.to }) : false;
          const isDisabled = item.to === null;

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
              {item.badge && (
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
                  }}
                >
                  {item.badge}
                </Box>
              )}
            </ListItemButton>
          );

          if (item.to) {
            return (
              <Link
                key={item.label}
                to={item.to}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {button}
              </Link>
            );
          }

          return <Box key={item.label}>{button}</Box>;
        })}
      </List>

      {/* Settings — separated at bottom */}
      <Box sx={{ px: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <ListItemButton disabled sx={{ borderRadius: 1.5, my: 0.5, py: 0.75 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            slotProps={{ primary: { sx: { fontSize: 13, fontWeight: 500 } } }}
          />
          <ChevronRightIcon
            sx={{ fontSize: 18, color: "text.secondary", opacity: 0.5 }}
          />
        </ListItemButton>
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
