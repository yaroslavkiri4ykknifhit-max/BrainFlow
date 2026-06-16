interface SparkLoaderProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function SparkLoader({ size = 48, className = "", animated = true }: SparkLoaderProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${animated ? "ai-spark-loader" : ""} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size }}
    >
      <g stroke="currentColor" stroke-width="8" stroke-linecap="round">
        <line x1="50" y1="12" x2="50" y2="30" className="ray r1" />
        <line x1="76.8" y1="23.2" x2="64.1" y2="35.9" className="ray r2" />
        <line x1="88" y1="50" x2="70" y2="50" className="ray r3" />
        <line x1="76.8" y1="76.8" x2="64.1" y2="64.1" className="ray r4" />
        <line x1="50" y1="88" x2="50" y2="70" className="ray r5" />
        <line x1="23.2" y1="76.8" x2="35.9" y2="64.1" className="ray r6" />
        <line x1="12" y1="50" x2="30" y2="50" className="ray r7" />
        <line x1="23.2" y1="23.2" x2="35.9" y2="35.9" className="ray r8" />
      </g>
    </svg>
  );
}
