export interface TestPlan {
  id: string;
  name: string;
  modality: "web" | "api" | "ios";
  framework: string;
  status: "approved" | "review" | "generating" | "draft" | "archived";
  scenarioCount: number;
  passRate: number | null;
  lastUpdated: string;
  health: "healthy" | "degrading" | "critical" | null;
}

export interface Execution {
  id: string;
  date: string;
  env: string;
  status: "passed" | "failed" | "pending";
  passRate: number;
  duration: string;
  trigger: string;
}

export interface ActivityItem {
  text: string;
  time: string;
  status: "success" | "info" | "warning" | "error";
}
