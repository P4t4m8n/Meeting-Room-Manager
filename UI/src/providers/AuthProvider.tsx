import { useEffect, useState, type ReactNode } from "react";
import type { IUserDTO } from "../models/UserDTO";
import { authService } from "../services/auth.service";
import { authContext } from "../context/authContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUserDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const res = await authService.getSessionUser();
        console.log("🚀 ~ fetchUser ~ res:", res)
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <authContext.Provider value={{ user, logout, isLoading   }}>
      {children}
    </authContext.Provider>
  );
};
