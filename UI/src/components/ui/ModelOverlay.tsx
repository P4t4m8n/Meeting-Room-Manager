interface Props {
  children: React.ReactNode;
  isOpen?: boolean;
}
export default function ModelOverlay({ children, isOpen }: Props) {
  const style = `fixed top-0 left-0  bg-black/75 flex justify-center items-center transition-opacity duration-300 ${
    isOpen ? "z-40 h-screen w-screen" : "-z-40 opacity-0 h-0 w-0"
  } `;
  return <div className={style}>{children}</div>;
}
