import type { ReactNode } from "react";
import { Route } from "react-router";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/Admin/AdminPage";
import OrdersPage from "./pages/OrdersPage";
import AdminBookingsPage from "./pages/Admin/AdminBookingsPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import AdminRoomsPage from "./pages/Admin/AdminRoomsPage";

interface IRouteConfig {
  path: string;
  element: ReactNode;
  children?: IRouteConfig[];
}

export const renderRoutes = (routes: IRouteConfig[]) => {
 return routes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element}>
      {route.children && renderRoutes(route.children)}
    </Route>
  ));

};

const AUTH_PAGE_ROUTE = "/auth";
const ADMIN_PAGE_ROUTE = "/admin";
const ORDERS_PAGE_ROUTE = "/orders";

const ADMIN_ROUTES: IRouteConfig[] = [
  {
    path: "bookings",
    element: <AdminBookingsPage />,
  },
  {
    path: "rooms",
    element: <AdminRoomsPage />,
  },
  {
    path: "users",
    element: <AdminUsersPage />,
  },
];

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
    children: ADMIN_ROUTES,
  },
  {
    path: ORDERS_PAGE_ROUTE,
    element: <OrdersPage />,
  },
];

export const ROUTES: IRouteConfig[] = [...CORE_ROUTES];
