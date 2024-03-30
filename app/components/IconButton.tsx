import { FC } from "react";

type IconButtonProps = {
  onClick: () => void;
  className?: string;
  children?: string;
}
export const IconButton: FC<IconButtonProps> = ({ onClick: handleClick, className, children }) => {
  return (
    <button
      className={`sm:hidden outline-none flex items-center focus:shadow-outline ${className}`}
      onClick={handleClick}
    >
      <i className="symbol">
        {children}
      </i>
    </button>
  )
}
