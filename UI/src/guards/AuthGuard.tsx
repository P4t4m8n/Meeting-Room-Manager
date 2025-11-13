import AuthPage from "../pages/AuthPage";

import { useAuth } from "../hooks/useAuth";
interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthProviderProps) {
  const { isLoading, user } = useAuth();

  if (isLoading) return <div>...Loading</div>;

  return user ? <>{children}</> : <AuthPage />;
}
