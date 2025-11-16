import { usePageBack } from "@/hooks/usePageBack";
import { ArrowRight } from "lucide-react";

export default function BackButton() {
  const { onBack } = usePageBack();

  return (
    <button
      onClick={onBack}
      className="text-main-white flex justify-between items-center min-w-12 hover:cursor-pointer"
    >
      <ArrowRight className=" w-4 h-4  stroke-main-white/75 fill-main-bg" />
      <p>חזור</p>
    </button>
  );
}
