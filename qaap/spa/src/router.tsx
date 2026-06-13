import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";

import { Home } from "@/domains/dashboard/features/home/home";
import { EngineRun } from "@/domains/engine/features/engine-run/engine-run";
import { PipelineList } from "@/domains/engine/features/pipeline-list/pipeline-list";
import { ConnectorList } from "@/domains/knowledge-base/features/connector-list/connector-list";
import { KnowledgeBase } from "@/domains/knowledge-base/features/knowledge-base/knowledge-base";
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

const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/",
  component: Home,
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

const engineRunRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/engine/$jobId",
  component: EngineRun,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    connectorsRoute,
    knowledgeBaseRoute,
    pipelinesRoute,
    engineRunRoute,
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
