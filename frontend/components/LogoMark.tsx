export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0, display: "block" }}
    >
      <rect x="1.5" y="1.5" width="29" height="29" rx="3" fill="#FBF9F3" stroke="#1C1B17" strokeWidth="2" />
      <path d="M16 8.5 L9 23.5 M16 8.5 L23 23.5" stroke="#1C1B17" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 19 H20.5" stroke="#1E5B3E" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
