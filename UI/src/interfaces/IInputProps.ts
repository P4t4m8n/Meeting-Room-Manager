export interface IInputProps {
  inputProps: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  containerProps?: React.HtmlHTMLAttributes<HTMLDivElement>;
}
