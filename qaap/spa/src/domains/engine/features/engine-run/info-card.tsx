import { Card, CardContent, Stack, Typography } from "@mui/material";

export function InfoCard({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 0 }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", mb: 0.5 }}
        >
          <Icon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              color: "text.secondary",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.3,
            }}
          >
            {label}
          </Typography>
        </Stack>
        {value && (
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
            {value}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
