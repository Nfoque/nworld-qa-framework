import type {
  Proposal,
  ReviewState,
  ReviewStatus,
  ScenarioOverride,
} from "./proposal-review.types";

export type ReviewAction =
  | { type: "INIT"; proposal: Proposal }
  | { type: "MARK_INITIALIZED" }
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
      changes: {
        name?: string;
        description?: string;
        rationale?: string;
        gherkin?: string;
      };
    }
  | { type: "RESET_SCENARIO"; scenarioId: string }
  | { type: "APPROVE_ALL_IN_AREA"; planId: string; areaId: string }
  | { type: "APPROVE_ALL_IN_PLAN"; planId: string };

export const INITIAL_STATE: ReviewState = {
  proposal: null,
  selection: { planId: null, areaId: null, scenarioId: null },
  overrides: new Map(),
  expanded: {},
  initialized: false,
};

function collapseAllFeatures(proposal: Proposal): Record<string, boolean> {
  const exp: Record<string, boolean> = {};
  for (const f of proposal.features) {
    exp[f.id] = false;
    for (const a of f.test_areas) exp[a.id] = false;
  }
  return exp;
}

export function reviewReducer(
  state: ReviewState,
  action: ReviewAction,
): ReviewState {
  switch (action.type) {
    case "INIT": {
      const firstFeature = action.proposal.features[0];
      const firstArea = firstFeature?.test_areas[0];
      const firstScenario = firstArea?.scenarios[0];
      const expanded = collapseAllFeatures(action.proposal);
      if (firstFeature) expanded[firstFeature.id] = true;
      if (firstArea) expanded[firstArea.id] = true;
      return {
        proposal: action.proposal,
        selection: {
          planId: firstFeature?.id ?? null,
          areaId: firstArea?.id ?? null,
          scenarioId: firstScenario?.id ?? null,
        },
        overrides: new Map(),
        expanded,
        initialized: true,
      };
    }

    case "MARK_INITIALIZED":
      return { ...state, initialized: true };

    case "RESTORE_OVERRIDES": {
      if (state.proposal) {
        for (const feature of state.proposal.features) {
          for (const area of feature.test_areas) {
            for (const scenario of area.scenarios) {
              if (!action.overrides.get(scenario.id)?.review_status) {
                const expanded = collapseAllFeatures(state.proposal);
                expanded[feature.id] = true;
                expanded[area.id] = true;
                return {
                  ...state,
                  overrides: action.overrides,
                  selection: {
                    planId: feature.id,
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
      for (const f of state.proposal.features) {
        expanded[f.id] = false;
        for (const a of f.test_areas) expanded[a.id] = false;
      }
      if (!wasOpen) {
        expanded[action.planId] = true;
        const feature = state.proposal.features.find(
          (f) => f.id === action.planId,
        );
        if (feature?.test_areas[0]) expanded[feature.test_areas[0].id] = true;
      }
      return { ...state, expanded };
    }

    case "TOGGLE_AREA": {
      if (!state.proposal) return state;
      const feature = state.proposal.features.find(
        (f) => f.id === action.planId,
      );
      if (!feature) return state;
      const wasOpen = state.expanded[action.areaId];
      const expanded = { ...state.expanded };
      for (const a of feature.test_areas) expanded[a.id] = false;
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
      const feature = state.proposal.features.find(
        (f) => f.id === action.planId,
      );
      const area = feature?.test_areas.find((a) => a.id === action.areaId);
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
      const feature = state.proposal.features.find(
        (f) => f.id === action.planId,
      );
      if (!feature) return state;
      const next = new Map(state.overrides);
      for (const area of feature.test_areas) {
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
