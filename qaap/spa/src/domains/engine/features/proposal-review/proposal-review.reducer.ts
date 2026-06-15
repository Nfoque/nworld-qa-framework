import type {
  Proposal,
  ReviewState,
  ReviewStatus,
  ScenarioOverride,
} from "./proposal-review.types";

export type ReviewAction =
  | { type: "INIT"; proposal: Proposal }
  | { type: "RESTORE_OVERRIDES"; overrides: Map<string, ScenarioOverride> }
  | { type: "TOGGLE_PLAN"; planId: string }
  | { type: "TOGGLE_AREA"; planId: string; areaId: string }
  | { type: "SELECT_PLAN"; planId: string }
  | { type: "SELECT_AREA"; planId: string; areaId: string }
  | {
      type: "SELECT_SCENARIO";
      planId: string;
      areaId: string;
      scenarioId: string;
    }
  | {
      type: "SET_SCENARIO_STATUS";
      scenarioId: string;
      status: ReviewStatus;
    }
  | {
      type: "EDIT_SCENARIO";
      scenarioId: string;
      changes: { title?: string; gherkin_text?: string };
    }
  | { type: "RESET_SCENARIO"; scenarioId: string }
  | { type: "APPROVE_ALL_IN_AREA"; planId: string; areaId: string }
  | { type: "APPROVE_ALL_IN_PLAN"; planId: string };

export const INITIAL_STATE: ReviewState = {
  proposal: null,
  selection: { planId: null, areaId: null, scenarioId: null },
  overrides: new Map(),
  expanded: {},
};

function collapseAllPlans(proposal: Proposal): Record<string, boolean> {
  const exp: Record<string, boolean> = {};
  for (const p of proposal.test_plans) {
    exp[p.id] = false;
    for (const a of p.test_areas) exp[a.id] = false;
  }
  return exp;
}

export function reviewReducer(
  state: ReviewState,
  action: ReviewAction,
): ReviewState {
  switch (action.type) {
    case "INIT": {
      const firstPlan = action.proposal.test_plans[0];
      const firstArea = firstPlan?.test_areas[0];
      const firstScenario = firstArea?.scenarios[0];
      const expanded = collapseAllPlans(action.proposal);
      if (firstPlan) expanded[firstPlan.id] = true;
      if (firstArea) expanded[firstArea.id] = true;
      return {
        proposal: action.proposal,
        selection: {
          planId: firstPlan?.id ?? null,
          areaId: firstArea?.id ?? null,
          scenarioId: firstScenario?.id ?? null,
        },
        overrides: new Map(),
        expanded,
      };
    }

    case "RESTORE_OVERRIDES": {
      if (state.proposal) {
        for (const plan of state.proposal.test_plans) {
          for (const area of plan.test_areas) {
            for (const scenario of area.scenarios) {
              if (!action.overrides.get(scenario.id)?.review_status) {
                const expanded = collapseAllPlans(state.proposal);
                expanded[plan.id] = true;
                expanded[area.id] = true;
                return {
                  ...state,
                  overrides: action.overrides,
                  selection: {
                    planId: plan.id,
                    areaId: area.id,
                    scenarioId: scenario.id,
                  },
                  expanded,
                };
              }
            }
          }
        }
      }
      return { ...state, overrides: action.overrides };
    }

    case "TOGGLE_PLAN": {
      if (!state.proposal) return state;
      const wasOpen = state.expanded[action.planId];
      const expanded: Record<string, boolean> = { ...state.expanded };
      for (const p of state.proposal.test_plans) {
        expanded[p.id] = false;
        for (const a of p.test_areas) expanded[a.id] = false;
      }
      if (!wasOpen) {
        expanded[action.planId] = true;
        const plan = state.proposal.test_plans.find(
          (p) => p.id === action.planId,
        );
        if (plan?.test_areas[0]) expanded[plan.test_areas[0].id] = true;
      }
      return { ...state, expanded };
    }

    case "TOGGLE_AREA": {
      if (!state.proposal) return state;
      const plan = state.proposal.test_plans.find(
        (p) => p.id === action.planId,
      );
      if (!plan) return state;
      const wasOpen = state.expanded[action.areaId];
      const expanded = { ...state.expanded };
      for (const a of plan.test_areas) expanded[a.id] = false;
      if (!wasOpen) expanded[action.areaId] = true;
      return { ...state, expanded };
    }

    case "SELECT_PLAN": {
      return {
        ...state,
        selection: {
          planId: action.planId,
          areaId: state.selection.areaId,
          scenarioId: state.selection.scenarioId,
        },
      };
    }

    case "SELECT_AREA": {
      return {
        ...state,
        selection: {
          planId: action.planId,
          areaId: action.areaId,
          scenarioId: state.selection.scenarioId,
        },
      };
    }

    case "SELECT_SCENARIO":
      return {
        ...state,
        selection: {
          planId: action.planId,
          areaId: action.areaId,
          scenarioId: action.scenarioId,
        },
      };

    case "SET_SCENARIO_STATUS": {
      const next = new Map(state.overrides);
      const existing = next.get(action.scenarioId) ?? {};
      next.set(action.scenarioId, {
        ...existing,
        review_status: action.status,
      });
      return { ...state, overrides: next };
    }

    case "EDIT_SCENARIO": {
      const next = new Map(state.overrides);
      const existing = next.get(action.scenarioId) ?? {};
      next.set(action.scenarioId, {
        ...existing,
        ...action.changes,
        review_status: "modified" as ReviewStatus,
      });
      return { ...state, overrides: next };
    }

    case "RESET_SCENARIO": {
      const next = new Map(state.overrides);
      next.delete(action.scenarioId);
      return { ...state, overrides: next };
    }

    case "APPROVE_ALL_IN_AREA": {
      if (!state.proposal) return state;
      const plan = state.proposal.test_plans.find(
        (p) => p.id === action.planId,
      );
      const area = plan?.test_areas.find((a) => a.id === action.areaId);
      if (!area) return state;
      const next = new Map(state.overrides);
      for (const s of area.scenarios) {
        const existing = next.get(s.id) ?? {};
        next.set(s.id, { ...existing, review_status: "approved" });
      }
      return { ...state, overrides: next };
    }

    case "APPROVE_ALL_IN_PLAN": {
      if (!state.proposal) return state;
      const plan = state.proposal.test_plans.find(
        (p) => p.id === action.planId,
      );
      if (!plan) return state;
      const next = new Map(state.overrides);
      for (const area of plan.test_areas) {
        for (const s of area.scenarios) {
          const existing = next.get(s.id) ?? {};
          next.set(s.id, { ...existing, review_status: "approved" });
        }
      }
      return { ...state, overrides: next };
    }

    default:
      return state;
  }
}
