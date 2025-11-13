const handleInputChange = <T>(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setStateToEdit: React.Dispatch<React.SetStateAction<T >>
) => {
  e.stopPropagation();
  const target = e.target as HTMLInputElement;
  const { name, value, type, checked } = target;

  let newVal: boolean | string | number | null;
  switch (type) {
    case "checkbox":
      newVal = checked;
      break;
    case "number":
      newVal = parseFloat(value);
      break;
    default:
      newVal = value;
      break;
  }

  setStateToEdit((prev) => {
    if (!prev) return prev;
    return {
      ...prev,
      [name]: newVal,
    };
  });
};

export default handleInputChange;
