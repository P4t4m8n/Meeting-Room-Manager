import { IconLogo } from "../Icons/IconLogo";
import { useAuth } from "../../hooks/useAuth";
import { IconAvatar } from "../Icons/IconAvatar";
import { NavLink } from "react-router";

export default function AppHeader() {
  const { user } = useAuth();
  return (
    <header className="grid  justify-items-center py-4 gap-2 w-full border-b border-gray-700">
      <IconLogo className="w-16 h-16 stroke-gray-500 fill-gray-500" />
      <nav className="w-full flex gap-4 justify-center text-main-blue font-semibold">
        <NavLink
          className={({ isActive }) =>
            isActive ? "text-main-white underline underline-offset-4" : ""
          }
          to="/"
        >
          בית
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive ? "text-main-white underline underline-offset-4" : ""
          }
          to="my-bookings"
        >
          הזמנות
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive ? "text-main-white underline underline-offset-4" : ""
          }
          to="admin"
        >
          מנהל
        </NavLink>
      </nav>
      <div className=" h-10 w-10  absolute bottom-4 right-4 border rounded-full p-1">
        {user?.imgUrl ? (
          <img
            src={user?.imgUrl}
            alt="User Avatar"
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <IconAvatar className="w-full h-full" />
        )}
      </div>
    </header>
  );
}
