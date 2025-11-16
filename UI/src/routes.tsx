import { Route } from "react-router";

import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/Admin/AdminPage";
import RoomDetails from "./pages/Room/RoomDetailsPage";
import RoomEditPage from "./pages/Room/RoomEditPage";
import RoomListPage from "./pages/Room/RoomListPage";
import BookingEditPage from "./pages/Bookings/BookingEditPage";

import type { ReactNode } from "react";

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
const BOOKINGS_PAGE_ROUTE = "/bookings";
const ROOMS_PAGE_ROUTE = "/rooms";

const ADMIN_ROUTES: IRouteConfig[] = [
  {
    path: ADMIN_PAGE_ROUTE,
    element: <AdminPage />,
    children: [],
  },
];

const ROOMS_ROUTES: IRouteConfig[] = [
  { path: ROOMS_PAGE_ROUTE, element: <RoomListPage /> },
  {
    path: ROOMS_PAGE_ROUTE + "/:roomId",
    element: <RoomDetails />,
  },
  { path: ROOMS_PAGE_ROUTE + "/edit", element: <RoomEditPage /> },
  { path: ROOMS_PAGE_ROUTE + "/edit/:roomId", element: <RoomEditPage /> },
];

const BOOKING_ROUTES: IRouteConfig[] = [
  {
    path: BOOKINGS_PAGE_ROUTE + "/edit/:bookingId/:roomId",
    element: <BookingEditPage />,
  },
];

const AUTH_ROUTES: IRouteConfig[] = [
  {
    path: AUTH_PAGE_ROUTE,
    element: <AuthPage />,
  },
];

export const CORE_ROUTES: IRouteConfig[] = [
  {
    path: "/",
    element: <HomePage />,
  },
];

export const ROUTES: IRouteConfig[] = [
  ...CORE_ROUTES,
  ...ADMIN_ROUTES,
  ...AUTH_ROUTES,
  ...ROOMS_ROUTES,
  ...BOOKING_ROUTES,
];
