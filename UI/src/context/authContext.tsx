import { createContext } from "react";
import type { IAuthProvider } from "../interfaces/IAuthProvider";

export const authContext = createContext<IAuthProvider | undefined>(undefined);
