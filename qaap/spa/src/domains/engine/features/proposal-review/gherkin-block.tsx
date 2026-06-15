import { Box } from "@mui/material";

function highlightGherkin(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const match = line.match(
      /^(\s*)(Feature|Scenario|Scenario Outline|Background|Given|When|Then|And|But|Examples)(:?)(.*)/,
    );
    if (!match) return <span key={i}>{line + "\n"}</span>;

    const [, indent, keyword, colon, rest] = match;
    return (
      <span key={i}>
        {indent}
        <Box component="span" sx={{ fontWeight: 700, color: "primary.main" }}>
          {keyword}
          {colon}
        </Box>
        {rest}
        {"\n"}
      </span>
    );
  });
}

export function GherkinBlock({ text }: { text: string }) {
  return (
    <Box
      component="pre"
      sx={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 13,
        lineHeight: 1.6,
        p: 2,
        borderRadius: 1,
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "divider",
        overflow: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        m: 0,
      }}
    >
      {highlightGherkin(text)}
    </Box>
  );
}
