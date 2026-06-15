import { Box } from "@mui/material";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const FONT_FAMILY = "'JetBrains Mono', 'Fira Code', monospace";
const FONT_SIZE = 13;
const LINE_HEIGHT = 1.7;

function GherkinLine({ text }: { text: string }) {
  if (!text.trim()) return <span>&nbsp;</span>;

  const tagMatch = text.match(/^(\s*)(@\S+.*)/);
  if (tagMatch) {
    return (
      <span>
        {tagMatch[1]}
        <Box
          component="span"
          sx={{ color: "text.disabled", fontStyle: "italic" }}
        >
          {tagMatch[2]}
        </Box>
      </span>
    );
  }

  const kwMatch = text.match(
    /^(\s*)(Feature|Scenario|Scenario Outline|Background|Examples|Rule)(:?)(.*)/,
  );
  if (kwMatch) {
    const [, indent, keyword, colon, rest] = kwMatch;
    return (
      <span>
        {indent}
        <Box component="span" sx={{ fontWeight: 700, color: "primary.main" }}>
          {keyword}
          {colon}
        </Box>
        {rest}
      </span>
    );
  }

  const stepMatch = text.match(/^(\s*)(Given|When|Then|And|But)\b(.*)/);
  if (stepMatch) {
    const [, indent, keyword, rest] = stepMatch;
    const parts: React.ReactNode[] = [];
    const strReg = /"([^"]*)"/g;
    let lastIdx = 0;
    let m: RegExpExecArray | null;
    while ((m = strReg.exec(rest)) !== null) {
      if (m.index > lastIdx) {
        parts.push(
          <span key={lastIdx}>{rest.substring(lastIdx, m.index)}</span>,
        );
      }
      parts.push(
        <Box key={m.index} component="span" sx={{ color: "success.main" }}>
          &quot;{m[1]}&quot;
        </Box>,
      );
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx < rest.length) {
      parts.push(<span key={lastIdx}>{rest.substring(lastIdx)}</span>);
    }
    return (
      <span>
        {indent}
        <Box component="span" sx={{ fontWeight: 700, color: "primary.main" }}>
          {keyword}
        </Box>
        {parts}
      </span>
    );
  }

  const commentMatch = text.match(/^(\s*)(#.*)/);
  if (commentMatch) {
    return (
      <span>
        {commentMatch[1]}
        <Box
          component="span"
          sx={{ color: "text.disabled", fontStyle: "italic" }}
        >
          {commentMatch[2]}
        </Box>
      </span>
    );
  }

  return <span>{text}</span>;
}

function measureLineHeights(pre: HTMLElement): number[] {
  const divs = pre.querySelectorAll<HTMLElement>("[data-line]");
  return Array.from(divs).map((d) => d.offsetHeight);
}

export function GherkinEditor({
  content,
  onChange,
}: {
  content: string;
  onChange?: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [lineHeights, setLineHeights] = useState<number[]>([]);
  const lines = content.split("\n");

  const syncHeights = useCallback(() => {
    if (!preRef.current) return;
    setLineHeights(measureLineHeights(preRef.current));
  }, []);

  useLayoutEffect(syncHeights, [content, syncHeights]);

  useEffect(() => {
    if (!preRef.current) return;
    const observer = new ResizeObserver(syncHeights);
    observer.observe(preRef.current);
    return () => observer.disconnect();
  }, [syncHeights]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const { selectionStart, selectionEnd } = ta;
      const val = ta.value;

      if (e.key === "Enter") {
        e.preventDefault();
        const lineStart = val.lastIndexOf("\n", selectionStart - 1) + 1;
        const indent = val.substring(lineStart).match(/^(\s*)/)?.[1] ?? "";
        const next =
          val.substring(0, selectionStart) +
          "\n" +
          indent +
          val.substring(selectionEnd);
        onChange?.(next);
        const cursor = selectionStart + 1 + indent.length;
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = cursor;
        });
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        if (!e.shiftKey) {
          const next =
            val.substring(0, selectionStart) +
            "  " +
            val.substring(selectionEnd);
          onChange?.(next);
          requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = selectionStart + 2;
          });
        } else {
          const lineStart = val.lastIndexOf("\n", selectionStart - 1) + 1;
          const linePrefix = val.substring(lineStart, selectionStart);
          const spaces = linePrefix.match(/^ {1,2}/)?.[0].length ?? 0;
          if (spaces > 0) {
            const next =
              val.substring(0, lineStart) + val.substring(lineStart + spaces);
            onChange?.(next);
            requestAnimationFrame(() => {
              ta.selectionStart = ta.selectionEnd = selectionStart - spaces;
            });
          }
        }
      }
    },
    [onChange],
  );

  const textStyles = {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  } as const;

  return (
    <Box sx={{ display: "flex", overflow: "auto", height: "100%" }}>
      {/* Line numbers — heights synced from pre measurement */}
      <Box
        sx={{
          flexShrink: 0,
          pt: 2,
          pb: 2,
          userSelect: "none",
          borderRight: "1px solid",
          borderColor: "divider",
        }}
      >
        {lineHeights.map((h, i) => (
          <Box
            key={i}
            sx={{
              height: h,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-end",
              pr: 1.5,
              pl: 2,
              fontFamily: FONT_FAMILY,
              fontSize: FONT_SIZE,
              lineHeight: LINE_HEIGHT,
              color: "text.disabled",
            }}
          >
            {i + 1}
          </Box>
        ))}
      </Box>

      {/* Editor: grid overlay — pre + textarea in same cell */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "grid",
          "& > *": { gridArea: "1 / 1" },
        }}
      >
        {/* Syntax-highlighted pre — each line in its own div for measurement */}
        <Box
          component="pre"
          ref={preRef}
          aria-hidden
          sx={{
            ...textStyles,
            px: 2,
            py: 2,
            m: 0,
            pointerEvents: "none",
          }}
        >
          {lines.map((line, i) => (
            <div key={i} data-line>
              <GherkinLine text={line} />
            </div>
          ))}
        </Box>

        {/* Editable textarea — transparent text, visible caret */}
        <Box
          component="textarea"
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          sx={{
            ...textStyles,
            px: 2,
            py: 2,
            m: 0,
            border: "none",
            outline: "none",
            resize: "none",
            bgcolor: "transparent",
            color: "transparent",
            caretColor: (theme) => theme.palette.text.primary,
            overflow: "hidden",
          }}
        />
      </Box>
    </Box>
  );
}
