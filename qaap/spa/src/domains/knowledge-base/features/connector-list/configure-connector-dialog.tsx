import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Dialog,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import type { Connector } from "./connector-list.types";
import { GitHubConnectorDialog } from "./github-connector-dialog";
import { SupabaseStorageDialog } from "./supabase-storage-dialog";

interface ConfigureConnectorDialogProps {
  connector: Connector;
  open: boolean;
  onClose: () => void;
}

const CONNECTOR_DIALOGS: Record<
  string,
  React.ComponentType<{ connector: Connector; onClose: () => void }>
> = {
  github: GitHubConnectorDialog,
  "supabase-storage": SupabaseStorageDialog,
};

export function ConfigureConnectorDialog({
  connector,
  open,
  onClose,
}: ConfigureConnectorDialogProps) {
  const { t } = useTranslation();
  const ContentDialog =
    CONNECTOR_DIALOGS[connector.connectorId] ?? GitHubConnectorDialog;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
            {t("configureDialog.configureTitle", { name: connector.name })}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 12 }}
          >
            {connector.description}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <ContentDialog connector={connector} onClose={onClose} />
    </Dialog>
  );
}
