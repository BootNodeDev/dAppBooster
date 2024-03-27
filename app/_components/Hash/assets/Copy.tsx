import { HTMLAttributes } from 'react'

export const Copy: React.FC<HTMLAttributes<SVGElement>> = ({ className, ...restProps }) => (
  <svg
    className={`copy ${className}`}
    fill="#000"
    height="15"
    viewBox="0 0 24 24"
    width="15"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <path
      className="fill"
      clipRule="evenodd"
      d="M10 9C9.44771 9 9 9.44771 9 10V21C9 21.5523 9.44771 22 10 22H21C21.5523 22 22 21.5523 22 21V10C22 9.44771 21.5523 9 21 9H10ZM15 7V3C15 2.44772 14.5523 2 14 2H3C2.44772 2 2 2.44772 2 3V14C2 14.5523 2.44772 15 3 15H7V10C7 8.34315 8.34315 7 10 7H15ZM17 7H21C22.6569 7 24 8.34315 24 10V21C24 22.6569 22.6569 24 21 24H10C8.34315 24 7 22.6569 7 21V17H3C1.34315 17 0 15.6569 0 14V3C0 1.34315 1.34315 0 3 0H14C15.6569 0 17 1.34315 17 3V7Z"
      fillRule="evenodd"
    />
  </svg>
)
