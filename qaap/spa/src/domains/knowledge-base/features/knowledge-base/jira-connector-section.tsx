import { faJira } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { ProjectCard } from "./project-card";

import type { JiraProject } from "@/domains/knowledge-base/features/connector-list/connector-list.types";
import { StatusBadge } from "@/shared/components/status-badge";

interface JiraConnectorSectionProps {
  connectorName: string;
  status: "connected" | "not_configured" | "error";
  selectedProjects: string[];
  projectDetails: Map<string, JiraProject>;
  selectedItems: Set<string>;
  onToggleItem: (projectKey: string) => void;
}

export function JiraConnectorSection({
  connectorName,
  status,
  selectedProjects,
  projectDetails,
  selectedItems,
  onToggleItem,
}: JiraConnectorSectionProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", mb: 2 }}
        >
          <FontAwesomeIcon
            icon={faJira}
            style={{ fontSize: 20, color: "#0052CC" }}
          />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, fontSize: 15 }}
          >
            {connectorName}
          </Typography>
          <StatusBadge status={status} />
          <Chip
            label={t("knowledgeBase.project", {
              count: selectedProjects.length,
            })}
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
          {selectedProjects.map((key) => (
            <ProjectCard
              key={key}
              projectKey={key}
              detail={projectDetails.get(key)}
              selected={selectedItems.has(key)}
              onToggle={onToggleItem}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
