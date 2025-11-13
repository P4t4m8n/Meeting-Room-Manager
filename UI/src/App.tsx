import { BrowserRouter } from "react-router";
import AppHeader from "./components/Header/AppHeader";
import AuthGuard from "./guards/AuthGuard";
import { AppProvider } from "./providers/AppProvider";
import { renderRoutes, ROUTES } from "./routes";

export default function App() {
  const routes = renderRoutes(ROUTES);

  return (
    <>
      <BrowserRouter>
        <AppProvider>
          <AuthGuard>
            <div className="bg-main-bg h-svh">
              <AppHeader />
              {routes}
            </div>
          </AuthGuard>
        </AppProvider>
      </BrowserRouter>
    </>
  );
}
