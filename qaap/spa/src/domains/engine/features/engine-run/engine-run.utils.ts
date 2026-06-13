import type { EngineJobStep, StepType } from "./engine-run.types";
import { PIPELINE_STEPS } from "./engine-run.types";

export function getStepState(
  step: EngineJobStep | undefined,
): "completed" | "active" | "pending" | "error" {
  if (!step) return "pending";
  switch (step.status) {
    case "completed":
      return "completed";
    case "running":
      return "active";
    case "failed":
      return "error";
    default:
      return "pending";
  }
}

export function getProgress(steps: EngineJobStep[]): {
  current: number;
  total: number;
} {
  const completed = steps.filter((s) => s.status === "completed").length;
  return { current: completed, total: PIPELINE_STEPS.length };
}

export function getStepSummary(step: EngineJobStep | undefined): string | null {
  if (!step) return null;
  const { status, stepType, output, input } = step;

  if (status === "running" && input) {
    const len = (obj: Record<string, unknown>, key: string) => {
      const arr = obj[key];
      return Array.isArray(arr) ? arr.length : 0;
    };
    switch (stepType) {
      case "extract_features": {
        const n = len(input, "raw_chunks");
        return n ? `Processing ${n} chunks…` : null;
      }
      case "extract_plans": {
        const n = len(input, "features");
        return n ? `Processing ${n} features…` : null;
      }
      case "extract_scenarios": {
        const n = len(input, "test_areas");
        return n ? `Processing ${n} test areas…` : null;
      }
      case "generate_proposal": {
        const n = len(input, "scenarios");
        return n ? `Assembling ${n} scenarios…` : null;
      }
      default:
        return null;
    }
  }

  if (status === "completed" && output) {
    const len = (key: string) => {
      const arr = output[key];
      return Array.isArray(arr) ? arr.length : 0;
    };
    const avgConf = (key: string) => {
      const arr = output[key];
      if (!Array.isArray(arr) || !arr.length) return 0;
      return Math.round(
        ((arr as Array<Record<string, unknown>>).reduce(
          (s, x) => s + (typeof x.confidence === "number" ? x.confidence : 0),
          0,
        ) /
          arr.length) *
          100,
      );
    };
    switch (stepType) {
      case "collect": {
        const n = len("raw_chunks");
        if (!n) return null;
        const sources = new Set(
          (output.raw_chunks as Array<Record<string, unknown>>).map(
            (c) => c.source,
          ),
        ).size;
        return `${n} chunks · ${sources} source${sources !== 1 ? "s" : ""}`;
      }
      case "extract_features": {
        const n = len("features");
        return n
          ? `${n} features · ${avgConf("features")}% avg confidence`
          : null;
      }
      case "extract_plans": {
        const n = len("test_areas");
        return n ? `${n} test areas` : null;
      }
      case "extract_scenarios": {
        const n = len("scenarios");
        return n
          ? `${n} scenarios · ${avgConf("scenarios")}% avg confidence`
          : null;
      }
      case "generate_proposal": {
        const proposal = output.proposal as Record<string, unknown> | undefined;
        const stats = proposal?.stats as Record<string, unknown> | undefined;
        const plans =
          typeof stats?.total_test_plans === "number"
            ? stats.total_test_plans
            : 0;
        const scenarios =
          typeof stats?.total_scenarios === "number"
            ? stats.total_scenarios
            : 0;
        return plans ? `${plans} test plans · ${scenarios} scenarios` : null;
      }
      default:
        return null;
    }
  }

  return null;
}

export function hasData(
  obj: Record<string, unknown> | null | undefined,
): boolean {
  return obj != null && Object.keys(obj).length > 0;
}

export const STEP_I18N_KEYS: Record<StepType, { label: string; desc: string }> =
  {
    collect: {
      label: "pipeline.stageCollecting",
      desc: "pipeline.stageCollectingDesc",
    },
    extract_features: {
      label: "pipeline.stageExtractingFeatures",
      desc: "pipeline.stageExtractingFeaturesDesc",
    },
    extract_plans: {
      label: "pipeline.stageExtractingPlans",
      desc: "pipeline.stageExtractingPlansDesc",
    },
    extract_scenarios: {
      label: "pipeline.stageExtractingScenarios",
      desc: "pipeline.stageExtractingScenariosDesc",
    },
    generate_proposal: {
      label: "pipeline.stageGenerateProposal",
      desc: "pipeline.stageGenerateProposalDesc",
    },
  };
