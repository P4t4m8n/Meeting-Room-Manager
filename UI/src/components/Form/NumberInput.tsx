import type { IInputProps } from "@/interfaces/IInputProps";
import { cn } from "@/lib/utils";

export default function NumberInput({
  inputProps,
  labelProps,
  containerProps,
}: IInputProps) {
  const containerStyle = cn(
    "flex gap-1 bg-main-white w-fit rounded items-center p-1",
    containerProps?.className
  );
  const inputStyle = cn(
    " p-1 w-12 text-center bg-main-white border-2 rounded border-main-bg outline-0  focus:shadow-[4px_4px_0px__0px_rgba(0,0,0,0.75)] transition-all duration-300",
    inputProps.className
  );
  const labelStyle = cn("font-semibold", labelProps.className);

  return (
    <div {...containerProps} className={containerStyle}>
      <label className={labelStyle} htmlFor={inputProps.id}>
        {labelProps.children}
      </label>
      <input className={inputStyle} type="number" {...inputProps} />
    </div>
  );
}
