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

export interface StepSummaryI18n {
  key: string;
  params: Record<string, unknown>;
}

export function getStepSummary(
  step: EngineJobStep | undefined,
): StepSummaryI18n | null {
  if (!step) return null;
  const { status, stepType, output, input } = step;

  const arrLen = (obj: Record<string, unknown>, key: string) => {
    const arr = obj[key];
    return Array.isArray(arr) ? arr.length : 0;
  };

  if (status === "running" && input) {
    switch (stepType) {
      case "extract_features": {
        const n = arrLen(input, "raw_chunks");
        return n
          ? { key: "pipeline.summaryProcessingChunks", params: { count: n } }
          : null;
      }
      case "extract_plans": {
        const n = arrLen(input, "features");
        return n
          ? { key: "pipeline.summaryProcessingFeatures", params: { count: n } }
          : null;
      }
      case "extract_scenarios": {
        const n = arrLen(input, "test_areas");
        return n
          ? { key: "pipeline.summaryProcessingAreas", params: { count: n } }
          : null;
      }
      case "generate_proposal": {
        const n = arrLen(input, "scenarios");
        return n
          ? {
              key: "pipeline.summaryAssemblingScenarios",
              params: { count: n },
            }
          : null;
      }
      default:
        return null;
    }
  }

  if (status === "completed" && output) {
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
        const n = arrLen(output, "raw_chunks");
        if (!n) return null;
        const sources = new Set(
          (output.raw_chunks as Array<Record<string, unknown>>).map(
            (c) => c.source,
          ),
        ).size;
        return {
          key: "pipeline.summaryCollected",
          params: { chunks: n, sources, count: sources },
        };
      }
      case "extract_features": {
        const n = arrLen(output, "features");
        return n
          ? {
              key: "pipeline.summaryFeatures",
              params: { count: n, confidence: avgConf("features") },
            }
          : null;
      }
      case "extract_plans": {
        const n = arrLen(output, "test_areas");
        return n
          ? { key: "pipeline.summaryTestAreas", params: { count: n } }
          : null;
      }
      case "extract_scenarios": {
        const n = arrLen(output, "scenarios");
        return n
          ? {
              key: "pipeline.summaryScenarios",
              params: { count: n, confidence: avgConf("scenarios") },
            }
          : null;
      }
      case "generate_proposal": {
        const summary = output.summary as Record<string, unknown> | undefined;
        const plans =
          typeof summary?.features === "number" ? summary.features : 0;
        const scenarios =
          typeof summary?.scenarios === "number" ? summary.scenarios : 0;
        return plans
          ? { key: "pipeline.summaryProposal", params: { plans, scenarios } }
          : null;
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
