import React from "react";
import { NavLink, type NavLinkProps } from "react-router";

interface IAppNavLinkProps
  extends NavLinkProps,
    React.RefAttributes<HTMLAnchorElement> {
  activeClass?: string;
  inactiveClass?: string;
  children: React.ReactNode;
}
export default function AppNavLink({ children, ...props }: IAppNavLinkProps) {
  return <NavLink {...props}>{children}</NavLink>;
}
