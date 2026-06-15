import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export function ChatPlaceholder() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          height: 44,
          flexShrink: 0,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <ChatBubbleOutlinedIcon
          sx={{ fontSize: 16, color: "text.secondary" }}
        />
        <Typography
          sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}
        >
          {t("testPlanDetail.aiAssistant")}
        </Typography>
      </Box>

      {/* Placeholder body */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            color: "text.disabled",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          {t("testPlanDetail.aiAssistantPlaceholder")}
        </Typography>
      </Box>

      {/* Input */}
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t("testPlanDetail.askAboutPlan")}
          disabled
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" disabled>
                    <SendOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ "& .MuiOutlinedInput-root": { fontSize: 13 } }}
        />
      </Box>
    </Box>
  );
}
