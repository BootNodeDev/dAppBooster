import { HTMLAttributes } from "react";

export const Link: React.FC<HTMLAttributes<SVGElement>> = ({
  className,
  ...restProps
}) => (
  <svg
    className={`link ${className}`}
    fill="#000"
    height="12.5"
    viewBox="0 0 10 10"
    width="12.5"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <path
      className="fill"
      clipRule="evenodd"
      d="M1.11111 1.11111V8.88892H8.88892V5H10V8.88892C10 9.5 9.5 10 8.88892 10H1.11111C0.494442 10 0 9.5 0 8.88892V1.11111C0 0.5 0.494442 0 1.11111 0H5V1.11111H1.11111ZM6.11111 1.11111V0H10V3.88889H8.88892V1.89444L3.42777 7.35558L2.64444 6.57223L8.10558 1.11111H6.11111Z"
      fillRule="evenodd"
    />
  </svg>
);
