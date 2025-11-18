import { cn } from "@/lib/utils";

export default function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  const style = cn(
    "w-full h-full block peer outline-0 focus:shadow-[4px_4px_0px__0px_rgba(0,0,0,0.25)] p-2 resize-none  rounded-lg text-main-bg bg-main-white transition-all duration-300",
    props.className
  );
  return <textarea {...props} className={style}></textarea>;
}
