import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";

export function DescriptionEditor({
  content,
  editing,
  onChange,
}: {
  content: string;
  editing: boolean;
  onChange?: (value: string) => void;
}) {
  const { t } = useTranslation();

  if (editing) {
    return (
      <Box
        component="textarea"
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange?.(e.target.value)
        }
        spellCheck={false}
        sx={{
          width: "100%",
          height: "100%",
          border: "none",
          outline: "none",
          resize: "none",
          p: 2.5,
          m: 0,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 13,
          lineHeight: 1.7,
          bgcolor: "transparent",
          color: "text.primary",
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        p: 2.5,
        fontSize: 14,
        lineHeight: 1.8,
        overflow: "auto",
        height: "100%",
        "& h1, & h2, & h3": {
          fontSize: 16,
          fontWeight: 600,
          mt: 2,
          mb: 1,
        },
        "& ul, & ol": { pl: 2.5, my: 1 },
        "& li": { mb: 0.5 },
        "& p": { my: 1 },
        "& strong": { fontWeight: 600 },
        "& code": {
          px: 0.5,
          py: 0.25,
          borderRadius: 0.5,
          bgcolor: "grey.100",
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
        },
      }}
    >
      <Markdown>
        {(content || t("testPlanDetail.noDescription")).replace(/\n/g, "\n\n")}
      </Markdown>
    </Box>
  );
}
