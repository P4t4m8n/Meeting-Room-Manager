interface IRadioGroupProps {
  items: readonly string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isCheckedFn: (item: string) => boolean;
  itemsLabels?: { [key: string]: string };
}
export default function RadioGroup({
  items,
  itemsLabels,
  onChange,
  isCheckedFn,
}: IRadioGroupProps) {
  return (
    <ul className="flex gap-2 col-span-2 justify-self-center">
      {items.map((item) => (
        <li key={item} className="flex text-main-white items-center gap-2">
          <input
            type="radio"
            id={item}
            name="status"
            value={item}
            checked={isCheckedFn(item)}
            onChange={onChange}
            className=" appearance-none rounded-1/2 w-4 h-4 border-2 border-main-white transition-all duration-200 checked:border-6 "
          />
          <label htmlFor={item} className="">
            {itemsLabels ? itemsLabels[item] : item}
          </label>
        </li>
      ))}
    </ul>
  );
}
