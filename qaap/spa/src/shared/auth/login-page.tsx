import GoogleIcon from "@mui/icons-material/Google";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "./auth-provider";

export function LoginPage() {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("login.error"));
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper sx={{ p: 5, width: 420, maxWidth: "90vw" }}>
        <Stack spacing={3} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RocketLaunchIcon sx={{ fontSize: 32, color: "#fff" }} />
          </Box>

          <Stack spacing={0.5} sx={{ alignItems: "center" }}>
            <Typography variant="h4">QAAP</Typography>
            <Typography variant="body2" color="text.secondary">
              {t("login.subtitle")}
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            fullWidth
            sx={{ fontSize: "1rem", py: 1.5 }}
          >
            {loading ? t("login.redirecting") : t("login.signIn")}
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            {t("login.ssoNote")}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
