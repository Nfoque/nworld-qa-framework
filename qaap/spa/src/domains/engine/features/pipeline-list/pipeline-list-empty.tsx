import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

interface PipelineListEmptyProps {
  isFiltered: boolean;
}

export function PipelineListEmpty({ isFiltered }: PipelineListEmptyProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ textAlign: "center", py: 10 }}>
      <AccountTreeOutlinedIcon
        sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }}
      />
      <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>
        {isFiltered ? t("pipelines.emptyFiltered") : t("pipelines.emptyAll")}
      </Typography>
      {!isFiltered && (
        <Link to="/knowledge-base" style={{ textDecoration: "none" }}>
          <Button variant="contained" size="small" sx={{ mt: 2 }}>
            {t("pipelines.goToKnowledgeBase")}
          </Button>
        </Link>
      )}
    </Box>
  );
}
