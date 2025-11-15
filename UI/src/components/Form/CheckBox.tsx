import { cn } from "@/lib/utils";
import IconCheck from "../Icons/IconCheck";

interface CheckBoxProps {
  inputProps: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  containerProps?: React.HtmlHTMLAttributes<HTMLDivElement>;
}

export default function CheckBox({
  inputProps,
  labelProps,
  containerProps,
}: CheckBoxProps) {
  const containerStyle = cn("relative group", containerProps?.className);
  const inputStyle = cn("peer", inputProps.className);
  const labelStyle = cn(
    "peer-checked:border-bg-[oklch(1_0_0)] peer-checked:text-[oklch(1_0_0)] border bg-[oklch(1_0_0)] peer-checked:bg-inherit peer-checked:[&>svg]:w-5 peer-checked:[&>svg]:h-5 peer-checked:gap-2 peer-checked:[&>svg]:p-1  transition-all px-2 py-1 rounded flex items-center duration-500 w-fit cursor-pointer",
    labelProps.className
  );
  return (
    <div {...containerProps} className={containerStyle}>
      <input type="checkbox" {...inputProps} hidden className={inputStyle}  />
      <label htmlFor={inputProps.id} className={labelStyle}>
        {labelProps.children}
        <IconCheck className="w-0 h-0  stroke-black-900 bg-[oklch(1_0_0)] rounded-full transition-all " />
      </label>
    </div>
  );
}
