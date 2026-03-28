type BrandMarkProps = {
  className?: string;
  title?: string;
  withContainer?: boolean;
  dark?: boolean;
};

export function BrandMark({
  className,
  title = "Kompetenzkompass",
  withContainer = false,
  dark = false,
}: BrandMarkProps) {
  const ring = dark ? "#f5f0e7" : "#122620";
  const center = "#294f3f";
  const needleNorth = "#9a3412";
  const needleSouth = dark ? "#e9dfcf" : "#122620";
  const centerDot = dark ? "#122620" : "#e9dfcf";

  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      {withContainer && <rect width="120" height="120" rx="22" fill={dark ? "#122620" : "#f5f0e7"} />}

      <circle cx="60" cy="60" r="46" fill="none" stroke={ring} strokeWidth="1.5" opacity={withContainer ? 0.22 : 0.32} />
      <circle cx="60" cy="60" r="27" fill="none" stroke={ring} strokeWidth="1" opacity={withContainer ? 0.18 : 0.28} />

      <line x1="60" y1="14" x2="60" y2="106" stroke={ring} strokeWidth="1" opacity={withContainer ? 0.18 : 0.28} />
      <line x1="14" y1="60" x2="106" y2="60" stroke={ring} strokeWidth="1" opacity={withContainer ? 0.18 : 0.28} />
      <line x1="27.5" y1="27.5" x2="92.5" y2="92.5" stroke={ring} strokeWidth="0.8" opacity={withContainer ? 0.13 : 0.22} />
      <line x1="92.5" y1="27.5" x2="27.5" y2="92.5" stroke={ring} strokeWidth="0.8" opacity={withContainer ? 0.13 : 0.22} />

      <polygon points="60,12 52,60 68,60" fill={needleNorth} />
      <polygon points="60,95 52,60 68,60" fill={needleSouth} />

      <circle cx="60" cy="60" r="5.5" fill={center} />
      <circle cx="60" cy="60" r="2.5" fill={centerDot} />
    </svg>
  );
}
