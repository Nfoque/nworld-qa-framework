import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import SubjectOutlinedIcon from "@mui/icons-material/SubjectOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { ActivityFeed } from "./activity-feed";
import { ExecutionsTable } from "./executions-table";
import {
  MOCK_ACTIVITY,
  MOCK_EXECUTIONS,
  MOCK_TEST_PLANS,
} from "./home.mock-data";
import { PlansTable } from "./plans-table";
import { QuickActions } from "./quick-actions";

import { useAuth } from "@/shared/auth/auth-provider";
import { StatCard } from "@/shared/components/stat-card";

export function Home() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const approved = MOCK_TEST_PLANS.filter(
    (p) => p.status === "approved",
  ).length;
  const totalScenarios = MOCK_TEST_PLANS.reduce(
    (sum, p) => sum + p.scenarioCount,
    0,
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2.5,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontSize: 22 }}>
            {t("home.welcome", { name: firstName })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {t("home.subtitle")}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          {t("home.newTestPlan")}
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1.5,
          mb: 2,
        }}
      >
        <StatCard
          label={t("home.testPlans")}
          value={MOCK_TEST_PLANS.length}
          subtitle={t("home.approved", { count: approved })}
          icon={DescriptionOutlinedIcon}
          color="#217BEE"
        />
        <StatCard
          label={t("home.totalScenarios")}
          value={totalScenarios}
          subtitle={t("home.acrossAllPlans")}
          icon={SubjectOutlinedIcon}
          color="#8B5CF6"
        />
        <StatCard
          label={t("home.avgPassRate")}
          value="94.2%"
          icon={MonitorHeartOutlinedIcon}
          color="#16A34A"
          trend={{ label: t("home.vsLastWeek", { value: "2.1%" }), up: true }}
        />
        <StatCard
          label={t("home.pendingReviews")}
          value="4"
          subtitle={t("home.plansNeedAttention", { count: 2 })}
          icon={AccessTimeOutlinedIcon}
          color="#EC683E"
        />
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              px: 2.5,
              py: 1.75,
            }}
          >
            <Typography variant="h6" sx={{ fontSize: 14 }}>
              {t("home.testPlans")}
            </Typography>
            <Button
              size="small"
              endIcon={<ChevronRightIcon />}
              sx={{ fontSize: 12 }}
            >
              {t("home.viewAll")}
            </Button>
          </Stack>
          <PlansTable plans={MOCK_TEST_PLANS} />
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontSize: 14, mb: 1.5 }}>
              {t("home.recentActivity")}
            </Typography>
            <ActivityFeed items={MOCK_ACTIVITY} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontSize: 14, mb: 1.5 }}>
              {t("home.quickActions")}
            </Typography>
            <QuickActions />
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              px: 2.5,
              py: 1.75,
            }}
          >
            <Typography variant="h6" sx={{ fontSize: 14 }}>
              {t("home.recentExecutions")}
            </Typography>
            <Button
              size="small"
              endIcon={<ChevronRightIcon />}
              sx={{ fontSize: 12 }}
            >
              {t("home.viewAll")}
            </Button>
          </Stack>
          <ExecutionsTable executions={MOCK_EXECUTIONS} />
        </CardContent>
      </Card>
    </Box>
  );
}
