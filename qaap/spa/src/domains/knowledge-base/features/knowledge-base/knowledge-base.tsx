import CableOutlinedIcon from "@mui/icons-material/CableOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ConnectorSection } from "./connector-section";
import { EmptyState } from "./empty-state";
import {
  getSelectedRepos,
  useKnowledgeBaseDetails,
} from "./knowledge-base.service";
import type { GitHubRepoResource } from "./knowledge-base.types";
import { SelectionBar } from "./selection-bar";

import { useCreateJob } from "@/domains/engine/features/engine-run/engine-run.service";
import { useConnectors } from "@/domains/knowledge-base/features/connector-list/connector-list.service";
import { StatCard } from "@/shared/components/stat-card";

export function KnowledgeBase() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: connectors = [], isLoading: isLoadingConnectors } =
    useConnectors();
  const createJob = useCreateJob();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const activeConnectors = connectors.filter((c) => c.status === "connected");
  const githubConnector = activeConnectors.find(
    (c) => c.connectorId === "github",
  );
  const selectedRepos = githubConnector
    ? getSelectedRepos(githubConnector.config)
    : [];

  const { data: githubDetails, isLoading: isLoadingDetails } =
    useKnowledgeBaseDetails("github", !!githubConnector);

  const enrichedRepos = useMemo(() => {
    const map = new Map<string, GitHubRepoResource>();
    if (!githubDetails?.result?.repos) return map;
    for (const repo of githubDetails.result.repos) {
      map.set(repo.fullName, repo);
    }
    return map;
  }, [githubDetails]);

  const toggleItem = useCallback((fullName: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(fullName)) {
        next.delete(fullName);
      } else {
        next.add(fullName);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedItems(new Set()), []);

  const totalResources = selectedRepos.length;

  if (isLoadingConnectors) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, pb: 12 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={{ fontSize: 22 }}>
          {t("knowledgeBase.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {t("knowledgeBase.subtitle")}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <StatCard
          label={t("knowledgeBase.activeSources")}
          value={activeConnectors.length}
          subtitle={t("knowledgeBase.configured", {
            count: connectors.length,
          })}
          icon={CableOutlinedIcon}
          color="#217BEE"
        />
        <StatCard
          label={t("knowledgeBase.totalResources")}
          value={totalResources}
          icon={SourceOutlinedIcon}
          color="#16A34A"
        />
        <StatCard
          label={t("knowledgeBase.githubRepos")}
          value={selectedRepos.length}
          icon={GitHubIcon}
          color="#24292f"
        />
        <StatCard
          label={t("knowledgeBase.knowledgeItems")}
          value={0}
          subtitle={t("knowledgeBase.syncToPopulate")}
          icon={MenuBookOutlinedIcon}
          color="#82858D"
        />
      </Box>

      {activeConnectors.length === 0 ? (
        <EmptyState />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {githubConnector && selectedRepos.length > 0 && (
            <ConnectorSection
              connectorId="github"
              connectorName={githubConnector.name}
              status="connected"
              selectedRepos={selectedRepos}
              enrichedRepos={enrichedRepos}
              isLoadingDetails={isLoadingDetails}
              selectedItems={selectedItems}
              onToggleItem={toggleItem}
            />
          )}
        </Box>
      )}

      <SelectionBar
        selectedItems={Array.from(selectedItems)}
        onClear={clearSelection}
        isCreating={createJob.isPending}
        onContinue={() => {
          const sources = [
            { connector: "github", items: Array.from(selectedItems) },
          ];
          createJob.mutate(sources, {
            onSuccess: (job) => {
              navigate({ to: "/pipelines/$jobId", params: { jobId: job.id } });
            },
          });
        }}
      />
    </Box>
  );
}
