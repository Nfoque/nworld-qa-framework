import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
  Outlet,
} from "@tanstack/react-router";
import { EngineRun } from "@/domains/engine/features/engine-run/engine-run";
import { PipelineList } from "@/domains/engine/features/pipeline-list/pipeline-list";
import { ProposalReview } from "@/domains/engine/features/proposal-review/proposal-review";
import { ConnectorList } from "@/domains/knowledge-base/features/connector-list/connector-list";
import { KnowledgeBase } from "@/domains/knowledge-base/features/knowledge-base/knowledge-base";
import { LlmProviderList } from "@/domains/settings/features/llm-providers/llm-provider-list";
import { TestPlanDetail } from "@/domains/test-plans/features/test-plan-detail/test-plan-detail";
import { TestPlanList } from "@/domains/test-plans/features/test-plan-list/test-plan-list";
import { AuthenticatedGuard } from "@/shared/auth/authenticated-guard";
import { LoginGuard } from "@/shared/auth/login-guard";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginGuard,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "authenticated",
  component: AuthenticatedGuard,
});

const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/test-plans" });
  },
});

const connectorsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/connectors",
  component: ConnectorList,
});

const knowledgeBaseRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/knowledge-base",
  component: KnowledgeBase,
});

const pipelinesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/pipelines",
  component: PipelineList,
});

export const pipelineDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/pipelines/$jobId",
  component: EngineRun,
});

export const pipelineReviewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/pipelines/$jobId/review",
  component: ProposalReview,
});

const testPlansRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/test-plans",
  component: TestPlanList,
});

export const testPlanDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/test-plans/$planId",
  component: TestPlanDetail,
});

const settingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/settings",
  component: LlmProviderList,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    indexRoute,
    connectorsRoute,
    knowledgeBaseRoute,
    pipelinesRoute,
    pipelineDetailRoute,
    pipelineReviewRoute,
    testPlansRoute,
    testPlanDetailRoute,
    settingsRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
