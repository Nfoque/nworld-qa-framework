import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function EmptyState() {
  const { t } = useTranslation();

  return (
    <Box sx={{ textAlign: "center", py: 10 }}>
      <MenuBookOutlinedIcon
        sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }}
      />
      <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>
        {t("knowledgeBase.emptyTitle")}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: 13, mb: 3 }}
      >
        {t("knowledgeBase.emptyDesc")}
      </Typography>
      <Link to="/connectors" style={{ textDecoration: "none" }}>
        <Button variant="contained" size="small">
          {t("knowledgeBase.configureConnectors")}
        </Button>
      </Link>
    </Box>
  );
}
