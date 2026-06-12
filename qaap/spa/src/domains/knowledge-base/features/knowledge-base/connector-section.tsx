import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CableOutlinedIcon from "@mui/icons-material/CableOutlined";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import type { GitHubRepoResource } from "./knowledge-base.types";
import { RepoCard } from "./repo-card";

import { StatusBadge } from "@/shared/components/status-badge";

const CONNECTOR_ICONS: Record<string, typeof faGithub> = {
  github: faGithub,
};

interface ConnectorSectionProps {
  connectorId: string;
  connectorName: string;
  status: "connected" | "not_configured" | "error";
  selectedRepos: string[];
  enrichedRepos: Map<string, GitHubRepoResource>;
  isLoadingDetails: boolean;
  selectedItems: Set<string>;
  onToggleItem: (fullName: string) => void;
}

export function ConnectorSection({
  connectorId,
  connectorName,
  status,
  selectedRepos,
  enrichedRepos,
  isLoadingDetails,
  selectedItems,
  onToggleItem,
}: ConnectorSectionProps) {
  const { t } = useTranslation();
  const faIcon = CONNECTOR_ICONS[connectorId];

  return (
    <Card>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", mb: 2 }}
        >
          {faIcon ? (
            <FontAwesomeIcon
              icon={faIcon}
              style={{ fontSize: 20, color: "#24292f" }}
            />
          ) : (
            <CableOutlinedIcon sx={{ fontSize: 22, color: "text.secondary" }} />
          )}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 15 }}>
            {connectorName}
          </Typography>
          <StatusBadge status={status} />
          <Chip
            label={t("knowledgeBase.repo", { count: selectedRepos.length })}
            size="small"
            sx={{ fontSize: 11, height: 20 }}
          />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 1.5,
          }}
        >
          {selectedRepos.map((fullName) => (
            <RepoCard
              key={fullName}
              fullName={fullName}
              resource={enrichedRepos.get(fullName)}
              isLoading={isLoadingDetails}
              selected={selectedItems.has(fullName)}
              onToggle={onToggleItem}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
