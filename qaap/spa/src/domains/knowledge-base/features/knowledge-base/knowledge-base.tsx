import { faJira } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CableOutlinedIcon from "@mui/icons-material/CableOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ConnectorSection } from "./connector-section";
import { EmptyState } from "./empty-state";
import { JiraConnectorSection } from "./jira-connector-section";
import {
  getSelectedBuckets,
  getSelectedProjects,
  getSelectedRepos,
  useKnowledgeBaseDetails,
} from "./knowledge-base.service";
import type { GitHubRepoResource } from "./knowledge-base.types";
import { SelectionBar } from "./selection-bar";
import { StorageConnectorSection } from "./storage-connector-section";

import { useCreateJob } from "@/domains/engine/features/engine-run/engine-run.service";
import { useConnectors } from "@/domains/knowledge-base/features/connector-list/connector-list.service";
import type {
  JiraProject,
  JiraTestResult,
  SupabaseBucket,
  SupabaseStorageTestResult,
} from "@/domains/knowledge-base/features/connector-list/connector-list.types";
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

  const jiraConnector = activeConnectors.find(
    (c) => c.connectorId === "jira",
  );
  const selectedProjectKeys = jiraConnector
    ? getSelectedProjects(jiraConnector.config)
    : [];

  const storageConnector = activeConnectors.find(
    (c) => c.connectorId === "supabase-storage",
  );
  const selectedBuckets = storageConnector
    ? getSelectedBuckets(storageConnector.config)
    : [];

  const { data: githubDetails, isLoading: isLoadingDetails } =
    useKnowledgeBaseDetails("github", !!githubConnector);

  const { data: jiraDetails } = useKnowledgeBaseDetails(
    "jira",
    !!jiraConnector,
  );

  const { data: storageDetails } = useKnowledgeBaseDetails(
    "supabase-storage",
    !!storageConnector,
  );

  const enrichedRepos = useMemo(() => {
    const map = new Map<string, GitHubRepoResource>();
    if (!githubDetails?.result?.repos) return map;
    const repos = githubDetails.result.repos as unknown as GitHubRepoResource[];
    for (const repo of repos) {
      map.set(repo.fullName, repo);
    }
    return map;
  }, [githubDetails]);

  const projectDetails = useMemo(() => {
    const map = new Map<string, JiraProject>();
    const result = jiraDetails?.result as JiraTestResult | undefined;
    if (!result?.projects) return map;
    for (const project of result.projects) {
      map.set(project.key, project);
    }
    return map;
  }, [jiraDetails]);

  const bucketDetails = useMemo(() => {
    const map = new Map<string, SupabaseBucket>();
    const result = storageDetails?.result as
      | SupabaseStorageTestResult
      | undefined;
    if (!result?.buckets) return map;
    for (const bucket of result.buckets) {
      map.set(bucket.id, bucket);
    }
    return map;
  }, [storageDetails]);

  const toggleItem = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedItems(new Set()), []);

  const totalResources =
    selectedRepos.length + selectedProjectKeys.length + selectedBuckets.length;

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
          label={t("knowledgeBase.jiraProjects")}
          value={selectedProjectKeys.length}
          icon={() => (
            <FontAwesomeIcon
              icon={faJira}
              style={{ fontSize: 18, color: "#0052CC" }}
            />
          )}
          color="#0052CC"
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
          {jiraConnector && selectedProjectKeys.length > 0 && (
            <JiraConnectorSection
              connectorName={jiraConnector.name}
              status="connected"
              selectedProjects={selectedProjectKeys}
              projectDetails={projectDetails}
              selectedItems={selectedItems}
              onToggleItem={toggleItem}
            />
          )}
          {storageConnector && selectedBuckets.length > 0 && (
            <StorageConnectorSection
              connectorName={storageConnector.name}
              status="connected"
              selectedBuckets={selectedBuckets}
              bucketDetails={bucketDetails}
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
          const sources = [];
          const ghSelected = Array.from(selectedItems).filter((id) =>
            selectedRepos.includes(id),
          );
          const jiraSelected = Array.from(selectedItems).filter((id) =>
            selectedProjectKeys.includes(id),
          );
          const storageSelected = Array.from(selectedItems).filter((id) =>
            selectedBuckets.includes(id),
          );
          if (ghSelected.length > 0) {
            sources.push({ connector: "github", items: ghSelected });
          }
          if (jiraSelected.length > 0) {
            sources.push({ connector: "jira", items: jiraSelected });
          }
          if (storageSelected.length > 0) {
            sources.push({
              connector: "supabase-storage",
              items: storageSelected,
            });
          }
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
