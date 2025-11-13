import { NavLink, Outlet } from "react-router";

export default function AdminPage() {
  return (
    <div>
      <nav className="w-full flex gap-4 justify-center text-main-blue font-semibold">
     
        <NavLink
          className={({ isActive }) =>
            isActive ? "bg-main-white underline underline-offset-4" : ""
          }
          to="bookings"
        >
          הזמנות
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive ? "text-main-white underline underline-offset-4" : ""
          }
          to="rooms"
        >
          חדרים
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive ? "text-main-white underline underline-offset-4" : ""
          }
          to="users"
        >
          משתמשים
        </NavLink>
      </nav>
      <Outlet/>
    </div>
  );
}
