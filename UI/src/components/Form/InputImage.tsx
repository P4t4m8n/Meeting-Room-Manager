import { useState } from "react";
const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dyzqa6uuu/image/upload/v1742384690/hof/yeq1yyvb1tdfyuwuxfga.avif";
interface ImageUploadInputProps {
  imageUrl?: string;
  itemId?: string;
}
export default function InputImage({
  imageUrl,
  itemId,
}: ImageUploadInputProps) {
  const [imgPreview, setImgPreview] = useState<string>(
    imageUrl || DEFAULT_IMAGE
  );

  const handleImagePreview = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (!ev.target.files || !ev.target.files[0]) return;
    const file = ev.target.files[0];

    const imgUrl = URL.createObjectURL(file);
    setImgPreview(imgUrl);
  };
  return (
    <div className="justify-self-center">
      <label className="w-full h-48 block" htmlFor={`rawImgFile-${itemId}`}>
        <img
          className="w-full h-full object-cover"
          src={imgPreview}
          alt="ברירת מחדל"
        />
      </label>
      <input
        type="file"
        name="rawImgFile"
        id={`rawImgFile-${itemId}`}
        hidden
        onChange={handleImagePreview}
      ></input>
    </div>
  );
}
