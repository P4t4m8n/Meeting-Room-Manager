import { IconLogo } from "../Icons/IconLogo";
import { useAuth } from "../../hooks/useAuth";
import { IconAvatar } from "../Icons/IconAvatar";
import AppNavLink from "../AppNavLink";

export default function AppHeader() {
  const { user } = useAuth();
  return (
    <header className="grid  justify-items-center py-4 gap-2 w-full border-b border-gray-700">
      <IconLogo className="w-12 h-12 stroke-gray-500 fill-gray-500" />
      <nav className="w-full flex gap-4 justify-center text-amber-50 font-semibold">
        <AppNavLink
          className={({ isActive }) =>
            isActive ? "text-blue-400 underline underline-offset-4" : ""
          }
          to="/"
        >
          בית
        </AppNavLink>
        <AppNavLink to="my-bookings">הזמנות</AppNavLink>
        <AppNavLink to="admin">מנהל</AppNavLink>
      </nav>
      <div className="fixed bottom-0">
        {user?.imgUrl ? (
          <img
            src={user?.imgUrl}
            alt="User Avatar"
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <IconAvatar className="w-12 h-12" />
        )}
      </div>
    </header>
  );
}
