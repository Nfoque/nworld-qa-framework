import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { Button } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { EmptyState as GenericEmptyState } from "@/shared/components/empty-state";

export function EmptyState() {
  const { t } = useTranslation();

  return (
    <GenericEmptyState
      icon={
        <MenuBookOutlinedIcon
          sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }}
        />
      }
      title={t("knowledgeBase.emptyTitle")}
      description={t("knowledgeBase.emptyDesc")}
      action={
        <Link to="/connectors" style={{ textDecoration: "none" }}>
          <Button variant="contained" size="small">
            {t("knowledgeBase.configureConnectors")}
          </Button>
        </Link>
      }
    />
  );
}
