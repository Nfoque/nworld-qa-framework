import type {
  TestPlanDetail,
  TestPlanScenario,
} from "./test-plan-detail.service";

export type Tab = "description" | "gherkin" | "code" | "executions";
export type LayoutVariant = "standard" | "ide" | "ai-first";

export interface LayoutProps {
  plan: TestPlanDetail;
  scenarios: TestPlanScenario[];
  selectedScenario: TestPlanScenario | null;
  onSelectScenario: (id: string) => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  gherkinContent: string;
  descriptionContent: string;
  descriptionEditing: boolean;
  onDescriptionEditToggle: () => void;
  onGherkinChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  hasDraft: boolean;
  onSave: () => void;
  isSaving: boolean;
}
