import type { SvgIconComponent } from "@mui/icons-material";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: SvgIconComponent;
  color?: string;
  trend?: { label: string; up: boolean };
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color = "#217BEE",
  trend,
}: StatCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: 12, fontWeight: 500, mb: 0.5 }}
            >
              {label}
            </Typography>
            <Typography variant="h4" sx={{ color, fontSize: 26 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.25, display: "block" }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: `${color}14`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ fontSize: 22, color }} />
          </Box>
        </Stack>
        {trend && (
          <Typography
            variant="caption"
            sx={{
              mt: 1,
              display: "block",
              fontWeight: 600,
              color: trend.up ? "success.main" : "error.main",
            }}
          >
            {trend.up ? "↑" : "↓"} {trend.label}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
