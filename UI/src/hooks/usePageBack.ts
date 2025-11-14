import { useNavigate } from "react-router";

export const usePageBack = () => {
  const navigate = useNavigate();

  const onBack = (e?: React.MouseEvent) => {
    e?.preventDefault();
    navigate(-1);
  };

  const navBack = () => {
    navigate(-1);
  }

  return { onBack,navBack };
};
