import { cn } from "@/lib/utils";

interface IInputTextProps {
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  divProps?: React.HTMLAttributes<HTMLDivElement>;
}
export default function InputText({
  inputProps,
  labelProps,
  divProps,
}: IInputTextProps) {
  const {
    className: divClassName,
    children: divChildren,
    ...restDivProps
  } = divProps || {};
  const { className: inputClassName, ...restInputProps } = inputProps || {};
  const {
    className: labelClassName,
    children: labelChildren,
    ...restLabelProps
  } = labelProps || {};

  const divStyle = cn("flex flex-col gap-1", divClassName);
  const inputStyle = cn(
    "w-full rounded-lg px-4 h-10 bg-main-white border-2 border-main-bg outline-0 focus:shadow-[4px_4px_0px__0px_rgba(0,0,0,0.25)] transition-all duration-300",
    inputClassName
  );
  const labelStyle = cn("font-semibold text-main-white", labelClassName);
  return (
    <div className={divStyle} {...restDivProps}>
      <label {...restLabelProps} className={labelStyle}>
        {labelChildren}
      </label>
      <input {...restInputProps} className={inputStyle} type="text" />
      {divChildren}
    </div>
  );
}
