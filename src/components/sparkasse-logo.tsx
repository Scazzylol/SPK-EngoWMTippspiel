export function SparkasseLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 60"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Sparkasse Engen-Gottmadingen"
    >
      <defs>
        <linearGradient id="s-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D71920" />
          <stop offset="100%" stopColor="#B0141A" />
        </linearGradient>
      </defs>

      <rect x="0" y="8" width="42" height="42" rx="8" fill="url(#s-gradient)" />

      <text x="21" y="38" textAnchor="middle" fill="white" fontSize="26" fontWeight="700" fontFamily="Helvetica, Arial, sans-serif">
        S
      </text>

      <text x="52" y="32" fill="currentColor" fontSize="18" fontWeight="700" fontFamily="Helvetica, Arial, sans-serif" letterSpacing="0.5">
        Sparkasse
      </text>
      <text x="52" y="48" fill="currentColor" fontSize="10" fontWeight="500" fontFamily="Helvetica, Arial, sans-serif" opacity="0.7">
        Engen-Gottmadingen
      </text>
    </svg>
  );
}
