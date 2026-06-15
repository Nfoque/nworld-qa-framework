import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState } from "react";

const JSON_COLORS = {
  key: "#9cdcfe",
  string: "#ce9178",
  number: "#b5cea8",
  boolean: "#569cd6",
  null: "#569cd6",
  bracket: "#808080",
  toggle: "#6a9955",
} as const;

export function JsonValue({ value, depth }: { value: unknown; depth: number }) {
  if (value === null)
    return (
      <span style={{ color: JSON_COLORS.null, fontStyle: "italic" }}>null</span>
    );
  if (typeof value === "boolean")
    return <span style={{ color: JSON_COLORS.boolean }}>{String(value)}</span>;
  if (typeof value === "number")
    return <span style={{ color: JSON_COLORS.number }}>{value}</span>;
  if (typeof value === "string") {
    if (value.length > 300) {
      return <JsonLongString value={value} />;
    }
    return (
      <span style={{ color: JSON_COLORS.string }}>&quot;{value}&quot;</span>
    );
  }
  if (Array.isArray(value)) return <JsonArray items={value} depth={depth} />;
  if (typeof value === "object")
    return <JsonObject data={value as Record<string, unknown>} depth={depth} />;
  return <span>{String(value)}</span>;
}

function JsonLongString({ value }: { value: string }) {
  const [expanded, setExpanded] = useState(false);
  const preview = value.slice(0, 120);
  return (
    <span style={{ color: JSON_COLORS.string }}>
      &quot;{expanded ? value : `${preview}…`}&quot;
      <span
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        style={{
          color: JSON_COLORS.toggle,
          cursor: "pointer",
          marginLeft: 4,
          fontSize: 10,
          userSelect: "none",
        }}
      >
        {expanded ? "collapse" : `+${value.length - 120} chars`}
      </span>
    </span>
  );
}

function JsonObject({
  data,
  depth,
}: {
  data: Record<string, unknown>;
  depth: number;
}) {
  const entries = Object.entries(data);
  const [collapsed, setCollapsed] = useState(false);

  if (entries.length === 0)
    return <span style={{ color: JSON_COLORS.bracket }}>{"{}"}</span>;

  return (
    <span>
      <span
        onClick={(e) => {
          e.stopPropagation();
          setCollapsed(!collapsed);
        }}
        style={{
          cursor: "pointer",
          userSelect: "none",
          display: "inline-flex",
          alignItems: "center",
          verticalAlign: "middle",
        }}
      >
        {collapsed ? (
          <KeyboardArrowRightIcon
            sx={{ fontSize: 14, color: JSON_COLORS.toggle }}
          />
        ) : (
          <KeyboardArrowDownIcon
            sx={{ fontSize: 14, color: JSON_COLORS.toggle }}
          />
        )}
      </span>
      <span style={{ color: JSON_COLORS.bracket }}>{"{"}</span>
      {collapsed ? (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed(false);
          }}
          style={{ color: JSON_COLORS.toggle, cursor: "pointer", fontSize: 11 }}
        >
          {" "}
          {entries.length} keys…{" "}
        </span>
      ) : (
        <div style={{ paddingLeft: 20 }}>
          {entries.map(([key, val], i) => (
            <div key={key} style={{ lineHeight: 1.7 }}>
              <span style={{ color: JSON_COLORS.key, fontWeight: 500 }}>
                &quot;{key}&quot;
              </span>
              <span style={{ color: JSON_COLORS.bracket }}>: </span>
              <JsonValue value={val} depth={depth + 1} />
              {i < entries.length - 1 && (
                <span style={{ color: JSON_COLORS.bracket }}>,</span>
              )}
            </div>
          ))}
        </div>
      )}
      <span style={{ color: JSON_COLORS.bracket }}>{"}"}</span>
    </span>
  );
}

function JsonArray({ items, depth }: { items: unknown[]; depth: number }) {
  const [collapsed, setCollapsed] = useState(false);

  if (items.length === 0)
    return <span style={{ color: JSON_COLORS.bracket }}>[]</span>;

  const allPrimitive = items.every((i) => i === null || typeof i !== "object");
  if (allPrimitive && items.length <= 5) {
    return (
      <span>
        <span style={{ color: JSON_COLORS.bracket }}>[</span>
        {items.map((item, i) => (
          <span key={i}>
            <JsonValue value={item} depth={depth + 1} />
            {i < items.length - 1 && (
              <span style={{ color: JSON_COLORS.bracket }}>, </span>
            )}
          </span>
        ))}
        <span style={{ color: JSON_COLORS.bracket }}>]</span>
      </span>
    );
  }

  return (
    <span>
      <span
        onClick={(e) => {
          e.stopPropagation();
          setCollapsed(!collapsed);
        }}
        style={{
          cursor: "pointer",
          userSelect: "none",
          display: "inline-flex",
          alignItems: "center",
          verticalAlign: "middle",
        }}
      >
        {collapsed ? (
          <KeyboardArrowRightIcon
            sx={{ fontSize: 14, color: JSON_COLORS.toggle }}
          />
        ) : (
          <KeyboardArrowDownIcon
            sx={{ fontSize: 14, color: JSON_COLORS.toggle }}
          />
        )}
      </span>
      <span style={{ color: JSON_COLORS.bracket }}>[</span>
      {collapsed ? (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed(false);
          }}
          style={{ color: JSON_COLORS.toggle, cursor: "pointer", fontSize: 11 }}
        >
          {" "}
          {items.length} items…{" "}
        </span>
      ) : (
        <div style={{ paddingLeft: 20 }}>
          {items.map((item, i) => (
            <div key={i} style={{ lineHeight: 1.7 }}>
              <span
                style={{
                  color: JSON_COLORS.toggle,
                  fontSize: 10,
                  marginRight: 6,
                  userSelect: "none",
                }}
              >
                {i}
              </span>
              <JsonValue value={item} depth={depth + 1} />
              {i < items.length - 1 && (
                <span style={{ color: JSON_COLORS.bracket }}>,</span>
              )}
            </div>
          ))}
        </div>
      )}
      <span style={{ color: JSON_COLORS.bracket }}>]</span>
    </span>
  );
}
