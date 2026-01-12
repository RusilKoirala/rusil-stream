// Premium streaming service logo
export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Stylized RS Icon */}
      <div className="relative flex items-center justify-center">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/40 transform rotate-3">
          <span className="font-black text-white text-lg -rotate-3">RS</span>
        </div>
      </div>
      
      {/* Brand Text - Single elegant line */}
      <span className="font-black text-xl tracking-tight text-white">
        Rusil<span className="text-blue-400">Stream</span>
      </span>
    </div>
  );
}
