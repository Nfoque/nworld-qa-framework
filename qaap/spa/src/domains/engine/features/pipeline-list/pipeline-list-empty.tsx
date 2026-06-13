import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import { Button } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@/shared/components/empty-state";

interface PipelineListEmptyProps {
  isFiltered: boolean;
}

export function PipelineListEmpty({ isFiltered }: PipelineListEmptyProps) {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={
        <AccountTreeOutlinedIcon
          sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }}
        />
      }
      title={
        isFiltered ? t("pipelines.emptyFiltered") : t("pipelines.emptyAll")
      }
      action={
        !isFiltered ? (
          <Link to="/knowledge-base" style={{ textDecoration: "none" }}>
            <Button variant="contained" size="small">
              {t("pipelines.goToKnowledgeBase")}
            </Button>
          </Link>
        ) : undefined
      }
    />
  );
}
