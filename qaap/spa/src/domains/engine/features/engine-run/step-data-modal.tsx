import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DataObjectIcon from "@mui/icons-material/DataObject";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { EngineJobStep } from "./engine-run.types";
import { STEP_I18N_KEYS, hasData } from "./engine-run.utils";

import { JsonValue } from "@/shared/components/json-viewer";

export function StepDataModal({
  step,
  onClose,
}: {
  step: EngineJobStep | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!step) return null;

  const i18nKeys = STEP_I18N_KEYS[step.stepType];
  const showInput = hasData(step.input);
  const showOutput = hasData(step.output);
  const showMeta = hasData(step.meta);

  const tabs = [
    ...(showInput ? [{ label: "Input", data: step.input }] : []),
    ...(showOutput ? [{ label: "Output", data: step.output }] : []),
    ...(showMeta ? [{ label: "Meta", data: step.meta }] : []),
  ];

  if (tabs.length === 0) return null;

  const safeTab = Math.min(tab, tabs.length - 1);
  const activeData = tabs[safeTab]?.data;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(activeData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", gap: 1, pr: 6 }}
      >
        <DataObjectIcon sx={{ fontSize: 20, color: "primary.main" }} />
        <Typography
          variant="subtitle1"
          component="span"
          sx={{ fontWeight: 600 }}
        >
          {t(i18nKeys.label)}
        </Typography>
        <Chip
          label={step.status}
          size="small"
          color={
            step.status === "completed"
              ? "success"
              : step.status === "failed"
                ? "error"
                : "default"
          }
          sx={{ ml: 1, height: 20, fontSize: 10, fontWeight: 600 }}
        />
        <Box sx={{ flex: 1 }} />
        <IconButton
          onClick={handleCopy}
          size="small"
          title="Copy JSON"
          sx={{ mr: 1 }}
        >
          <ContentCopyIcon
            sx={{
              fontSize: 16,
              color: copied ? "success.main" : "text.secondary",
            }}
          />
        </IconButton>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {tabs.length > 1 && (
          <Tabs
            value={safeTab}
            onChange={(_, v) => {
              setTab(v);
              setCopied(false);
            }}
            sx={{
              px: 3,
              borderBottom: "1px solid",
              borderColor: "divider",
              minHeight: 36,
              "& .MuiTab-root": {
                minHeight: 36,
                textTransform: "none",
                fontSize: 13,
                fontWeight: 500,
              },
            }}
          >
            {tabs.map((tb) => (
              <Tab key={tb.label} label={tb.label} />
            ))}
          </Tabs>
        )}
        <Box
          sx={{
            p: 2.5,
            maxHeight: "65vh",
            overflow: "auto",
            bgcolor: "#1e1e1e",
            color: "#d4d4d4",
            fontFamily:
              "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace",
            fontSize: 12.5,
            lineHeight: 1.5,
          }}
        >
          <JsonValue value={activeData} depth={0} />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
