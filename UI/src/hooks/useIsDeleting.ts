import { IsDeletingContext } from "@/context/isDeletingContext";
import { useContext } from "react";

export const useIsDeleting = () => {
  return useContext(IsDeletingContext);
};
