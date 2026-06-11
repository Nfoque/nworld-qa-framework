import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";

import { ConnectorList } from "@/domains/connectors/features/connector-list/connector-list";
import { Home } from "@/domains/dashboard/features/home/home";
import { AuthenticatedGuard, LoginGuard } from "@/shared/auth/route-guards";

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

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([dashboardRoute, connectorsRoute]),
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
