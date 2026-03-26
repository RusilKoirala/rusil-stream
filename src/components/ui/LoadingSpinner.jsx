"use client";

// Clean, minimal loading spinner
export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = {
    xs: "w-4 h-4 border",
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-2",
    lg: "w-16 h-16 border-2",
    xl: "w-24 h-24 border-[3px]"
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      <div className="absolute inset-0 rounded-full border-white/10"></div>
      <div className="absolute inset-0 rounded-full border-transparent border-t-white animate-spin"></div>
    </div>
  );
}
