import { Box } from "@mui/material";
import { useCallback, useRef } from "react";

export function ResizeHandle({
  onResize,
  direction = "horizontal",
}: {
  onResize: (delta: number) => void;
  direction?: "horizontal" | "vertical";
}) {
  const dragging = useRef(false);
  const lastPos = useRef(0);
  const isVertical = direction === "vertical";

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      lastPos.current = isVertical ? e.clientY : e.clientX;

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        const pos = isVertical ? ev.clientY : ev.clientX;
        const delta = pos - lastPos.current;
        lastPos.current = pos;
        onResize(delta);
      };

      const handleMouseUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = isVertical ? "row-resize" : "col-resize";
      document.body.style.userSelect = "none";
    },
    [onResize, isVertical],
  );

  return (
    <Box
      onMouseDown={handleMouseDown}
      sx={{
        ...(isVertical
          ? { height: 8, cursor: "row-resize" }
          : { width: 8, cursor: "col-resize" }),
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&:hover > div, &:active > div": {
          bgcolor: "primary.main",
          opacity: 0.5,
        },
      }}
    >
      <Box
        sx={{
          ...(isVertical ? { height: 3, width: 40 } : { width: 3, height: 40 }),
          borderRadius: 1,
          bgcolor: "grey.300",
          transition: "background-color 0.15s",
        }}
      />
    </Box>
  );
}
