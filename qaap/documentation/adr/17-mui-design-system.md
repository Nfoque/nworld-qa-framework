# MUI Design System

> QAAP-specific: MUI v6 component patterns, theming conventions, and testing within VSA + Domain features.

## Overview

QAAP uses [MUI (Material UI) v6](https://mui.com/) as its design system. MUI provides 50+ React components, a theming system, and CSS-in-JS via Emotion. In QAAP:

| Package | Purpose |
|---------|---------|
| `@mui/material` | Core components (Button, TextField, DataGrid, etc.) |
| `@mui/icons-material` | Material Design icons |
| `@mui/x-data-grid` | Advanced data grid with sorting, filtering, pagination |
| `@mui/x-date-pickers` | Date and time pickers |

## Import Pattern

Import directly from the component path for better tree-shaking:

```tsx
// ✅ Preferred — named import
import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";

// ✅ Also fine — MUI v6 supports top-level imports efficiently
import Button from "@mui/material/Button";
```

## ThemeProvider Setup

QAAP uses MUI's `ThemeProvider` with a tenant-dynamic theme for per-client branding:

```typescript
// shared/theme/theme.ts
import { createTheme } from "@mui/material/styles";
import type { Tenant } from "@qaap/shared/types";

export const createTenantTheme = (tenant: Tenant) =>
  createTheme({
    palette: {
      primary: { main: tenant.primaryColor || "#1976d2" },
      secondary: { main: tenant.accentColor || "#9c27b0" },
      background: { default: tenant.backgroundColor || "#fafafa" },
    },
    typography: {
      fontFamily: tenant.fontFamily || '"Inter", "Roboto", sans-serif',
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
      MuiTextField: {
        defaultProps: { variant: "outlined", size: "small" },
      },
    },
  });
```

## QAAP Component Conventions

### Confidence Badges

Used throughout the app to show LLM confidence scores:

```tsx
import { Chip } from "@mui/material";

type ConfidenceBadgeProps = { confidence: number };

const getConfidenceColor = (c: number) =>
  c >= 0.85 ? "success" : c >= 0.60 ? "warning" : "error";

export const ConfidenceBadge = ({ confidence }: ConfidenceBadgeProps) => (
  <Chip
    label={`${Math.round(confidence * 100)}%`}
    color={getConfidenceColor(confidence)}
    size="small"
    variant="outlined"
  />
);
```

### Status Badges

Plan and execution status indicators:

```tsx
import { Chip } from "@mui/material";

const STATUS_COLORS: Record<string, "default" | "primary" | "warning" | "success" | "error"> = {
  draft: "default",
  generating: "primary",
  review: "warning",
  approved: "success",
  archived: "default",
  failed: "error",
};

export const StatusBadge = ({ status }: { status: string }) => (
  <Chip label={status} color={STATUS_COLORS[status] ?? "default"} size="small" />
);
```

### Data Display with DataGrid

```tsx
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", flex: 1 },
  { field: "modality", headerName: "Modality", width: 100 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: ({ value }) => <StatusBadge status={value} />,
  },
  { field: "scenarioCount", headerName: "Scenarios", type: "number", width: 100 },
];

<DataGrid
  rows={plans}
  columns={columns}
  loading={isLoading}
  pageSizeOptions={[10, 25, 50]}
  disableRowSelectionOnClick
/>
```

### Form Patterns

```tsx
import { TextField, Button, Stack } from "@mui/material";

<Stack spacing={2}>
  <TextField
    label="Plan Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    error={!!errors.name}
    helperText={errors.name}
    required
  />
  <TextField
    label="Description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    multiline
    rows={3}
  />
  <Button variant="contained" onClick={handleSubmit}>
    Create Plan
  </Button>
</Stack>
```

### Layout with Split Panels

The plan detail screen uses a split-panel layout:

```tsx
import { Box, Drawer } from "@mui/material";

<Box sx={{ display: "flex", height: "100vh" }}>
  {/* Scenario sidebar */}
  <Box sx={{ width: 280, borderRight: 1, borderColor: "divider", overflow: "auto" }}>
    <ScenarioList scenarios={scenarios} selected={selectedId} onSelect={setSelectedId} />
  </Box>

  {/* Main editor area */}
  <Box sx={{ flex: 1, overflow: "auto" }}>
    <ScenarioEditor scenario={selected} />
  </Box>

  {/* Chat panel (collapsible) */}
  <Drawer anchor="right" open={chatOpen} variant="persistent" sx={{ width: 360 }}>
    <ChatPanel planId={plan.id} />
  </Drawer>
</Box>
```

## Testing MUI Components

### With Vitest + RTL

MUI components render standard HTML — test via accessible queries:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

test("shows plan list", () => {
  renderWithTheme(<PlanList plans={mockPlans} />);
  expect(screen.getByRole("grid")).toBeInTheDocument();
  expect(screen.getAllByRole("row")).toHaveLength(mockPlans.length + 1); // +1 for header
});

test("opens create dialog", async () => {
  renderWithTheme(<PlanList plans={mockPlans} />);
  await userEvent.click(screen.getByRole("button", { name: "New Test Plan" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
```

### Accessible Selectors (prefer over testId)

MUI components have proper ARIA roles. Prefer role-based queries:

```tsx
// ✅ Prefer accessible queries
screen.getByRole("button", { name: "Save" });
screen.getByRole("textbox", { name: "Plan Name" });
screen.getByRole("grid");
screen.getByRole("dialog");
screen.getByRole("tab", { name: "Gherkin" });

// ✅ Also good for specific elements
screen.getByLabelText("Plan Name");

// ⚠️ Use testId only when no accessible alternative exists
screen.getByTestId("confidence-bar");
```

## VSA Integration Rules

### Where MUI components live in VSA

| Location | What goes there |
|----------|----------------|
| Feature `.tsx` | Direct use of MUI components (Button, TextField, DataGrid, etc.) |
| Feature `.css` | MUI theme token overrides via `sx` or CSS custom properties |
| `domains/{X}/shared/` | Domain-specific composed components (if 2+ features need identical config) |
| `src/shared/components/` | Cross-domain composed components (only after rule-of-3 promotion) |
| `src/shared/theme/` | Theme definition, tenant branding logic |
| `src/shared/layout/` | App shell (sidebar, topbar, navigation) |

### Do NOT create MUI wrapper components prematurely

Following [06 — Decision Rules](./06-decision-rules.md), don't abstract MUI components into reusable wrappers until 3+ consumers need the exact same configuration. Use MUI components directly in features.

```
❌ shared/components/app-button.tsx  (wraps Button with brand defaults — premature)
✅ <Button variant="contained" ...>  (use directly in features)
```

Exception: QAAP-specific compound components like `ConfidenceBadge` or `StatusBadge` that encode business logic — these belong in `src/shared/components/` from day one.

## Related Docs

- [03 — Feature Anatomy](./03-feature-anatomy.md) — where component files live
- [06 — Decision Rules](./06-decision-rules.md) — rule of 3 for promoting wrappers to shared
- [09 — QAAP Stack Adaptation](./09-qaap-stack-adaptation.md) — full stack mapping including MUI
