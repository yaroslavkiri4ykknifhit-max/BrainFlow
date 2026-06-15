interface SparkLoaderProps {
  size?: number;
  color?: string;
  className?: string;
}

export function SparkLoader({ size = 48, color = "#D97757", className = "" }: SparkLoaderProps) {
  const strokeWidth = size > 32 ? 2.5 : 2;
  const center = size / 2;
  const armLength = size * 0.38;

  const arms = [
    { angle: 0 },
    { angle: 45 },
    { angle: 90 },
    { angle: 135 },
    { angle: 180 },
    { angle: 225 },
    { angle: 270 },
    { angle: 315 },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {arms.map((arm, i) => {
        const rad = (arm.angle * Math.PI) / 180;
        const x1 = center + Math.cos(rad) * (size * 0.12);
        const y1 = center + Math.sin(rad) * (size * 0.12);
        const x2 = center + Math.cos(rad) * armLength;
        const y2 = center + Math.sin(rad) * armLength;
        return (
          <line
            key={i}
            className="ai-spark-path"
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
