// Netflix-style premium logo component
export default function Logo({ className = "" }) {
  return (
    <div className={`font-bold tracking-tight ${className}`}>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
        RUSIL
      </span>
      <span className="text-white ml-1">STREAM</span>
    </div>
  );
}
