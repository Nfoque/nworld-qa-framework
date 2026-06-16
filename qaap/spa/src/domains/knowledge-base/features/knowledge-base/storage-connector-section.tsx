import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { BucketCard } from "./bucket-card";

import type { SupabaseBucket } from "@/domains/knowledge-base/features/connector-list/connector-list.types";
import { StatusBadge } from "@/shared/components/status-badge";

interface StorageConnectorSectionProps {
  connectorName: string;
  status: "connected" | "not_configured" | "error";
  selectedBuckets: string[];
  bucketDetails: Map<string, SupabaseBucket>;
  selectedItems: Set<string>;
  onToggleItem: (bucketId: string) => void;
}

export function StorageConnectorSection({
  connectorName,
  status,
  selectedBuckets,
  bucketDetails,
  selectedItems,
  onToggleItem,
}: StorageConnectorSectionProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", mb: 2 }}
        >
          <StorageOutlinedIcon sx={{ fontSize: 22, color: "text.secondary" }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, fontSize: 15 }}
          >
            {connectorName}
          </Typography>
          <StatusBadge status={status} />
          <Chip
            label={t("knowledgeBase.bucket", { count: selectedBuckets.length })}
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
          {selectedBuckets.map((bucketId) => {
            const detail = bucketDetails.get(bucketId);
            return (
              <BucketCard
                key={bucketId}
                bucketId={bucketId}
                detail={detail}
                selected={selectedItems.has(bucketId)}
                onToggle={onToggleItem}
              />
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
