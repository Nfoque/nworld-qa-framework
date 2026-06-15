import { Box } from "@mui/material";
import { useCallback, useRef } from "react";

export function ResizeHandle({
  onResize,
}: {
  onResize: (deltaX: number) => void;
}) {
  const dragging = useRef(false);
  const lastX = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      lastX.current = e.clientX;

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        const delta = ev.clientX - lastX.current;
        lastX.current = ev.clientX;
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
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [onResize],
  );

  return (
    <Box
      onMouseDown={handleMouseDown}
      sx={{
        width: 8,
        flexShrink: 0,
        cursor: "col-resize",
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
          width: 3,
          height: 40,
          borderRadius: 1,
          bgcolor: "grey.300",
          transition: "background-color 0.15s",
        }}
      />
    </Box>
  );
}
