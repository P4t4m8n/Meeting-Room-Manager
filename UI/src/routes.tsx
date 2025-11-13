import type { ReactNode } from "react";
import { Route, Routes } from "react-router";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import OrdersPage from "./pages/OrdersPage";

interface IRouteConfig {
  path: string;
  element: ReactNode;
  children?: IRouteConfig[];
}

export const renderRoutes = (routes: IRouteConfig[]) => {
  const _routes = routes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element}>
      {route.children && renderRoutes(route.children)}
    </Route>
  ));
  return <Routes>{_routes}</Routes>;
};

const AUTH_PAGE_ROUTE = "/auth";
const ADMIN_PAGE_ROUTE = "/admin";
const ORDERS_PAGE_ROUTE = "/orders";

export const CORE_ROUTES: IRouteConfig[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: AUTH_PAGE_ROUTE,
    element: <AuthPage />,
  },
  {
    path: ADMIN_PAGE_ROUTE,
    element: <AdminPage />,
  },
  {
    path: ORDERS_PAGE_ROUTE,
    element: <OrdersPage />,
  },
];

export const ROUTES: IRouteConfig[] = [...CORE_ROUTES];
