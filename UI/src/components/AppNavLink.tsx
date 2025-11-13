import React from "react";
import { NavLink, type NavLinkProps } from "react-router";
import { twMerge } from "tailwind-merge";

interface IAppNavLinkProps
  extends NavLinkProps,
    React.RefAttributes<HTMLAnchorElement> {
  activeClass?: string;
  inactiveClass?: string;
  children: React.ReactNode;
}
export default function AppNavLink({
  activeClass,
  inactiveClass,
  children,
  ...props
}: IAppNavLinkProps) {
  return (
    <NavLink
      {...props}
      className={({ isActive }) =>
        twMerge(isActive ? activeClass : inactiveClass) +
        " grid items-center justify-items-center w-full h-full transition-all duration-300"
      }
    >
      {children}
    </NavLink>
  );
}
