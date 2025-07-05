// A simple, modern default profile SVG avatar for fallback
export default function DefaultProfileSVG({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="20" fill="#222" />
      <circle cx="20" cy="15" r="7" fill="#888" />
      <ellipse cx="20" cy="29" rx="11" ry="7" fill="#888" />
    </svg>
  );
}
