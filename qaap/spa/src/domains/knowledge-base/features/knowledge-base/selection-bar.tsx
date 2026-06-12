import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Slide,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface SelectionBarProps {
  selectedItems: string[];
  onClear: () => void;
  onContinue: () => void;
  isCreating?: boolean;
}

export function SelectionBar({
  selectedItems,
  onClear,
  onContinue,
  isCreating,
}: SelectionBarProps) {
  const { t } = useTranslation();

  return (
    <Slide
      direction="up"
      in={selectedItems.length > 0}
      mountOnEnter
      unmountOnExit
    >
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1300,
          borderRadius: 3,
          px: 3,
          py: 1.5,
          minWidth: 400,
          maxWidth: 600,
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <IconButton
            size="small"
            onClick={onClear}
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
              {t("knowledgeBase.sourcesSelected", {
                count: selectedItems.length,
              })}
            </Typography>
            <Box
              sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}
            >
              {selectedItems.slice(0, 3).map((item) => (
                <Chip
                  key={item}
                  label={item}
                  size="small"
                  sx={{ fontSize: 10, height: 20, maxWidth: 160 }}
                />
              ))}
              {selectedItems.length > 3 && (
                <Chip
                  label={t("knowledgeBase.more", {
                    count: selectedItems.length - 3,
                  })}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: 10, height: 20 }}
                />
              )}
            </Box>
          </Stack>

          <Button
            variant="contained"
            size="small"
            endIcon={
              isCreating ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <ArrowForwardIcon />
              )
            }
            onClick={onContinue}
            disabled={isCreating}
            sx={{ flexShrink: 0 }}
          >
            {isCreating
              ? t("knowledgeBase.creating")
              : t("knowledgeBase.generate")}
          </Button>
        </Stack>
      </Paper>
    </Slide>
  );
}
