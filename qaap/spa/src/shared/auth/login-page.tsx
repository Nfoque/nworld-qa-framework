import GoogleIcon from "@mui/icons-material/Google";
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
            component="img"
            src="/logos/qaap-logo-full.png"
            alt="QAAP"
            sx={{ height: 48, objectFit: "contain" }}
          />

          <Typography variant="body2" color="text.secondary">
            {t("login.subtitle")}
          </Typography>

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

          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center", pt: 1 }}
          >
            <Typography
              sx={{ fontSize: 9, color: "text.secondary", fontWeight: 500 }}
            >
              {t("sidebar.poweredBy")}
            </Typography>
            <Box
              component="img"
              src="/logos/nfq-logo.png"
              alt="NFQ"
              sx={{ height: 14, objectFit: "contain" }}
            />
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
