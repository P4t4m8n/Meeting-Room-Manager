import { useContext } from "react";
import { authContext } from "../context/authContext";

export function useAuth() {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}
