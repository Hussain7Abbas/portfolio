import type { CSSProperties } from "react";

export function Skeleton({
  width = "100%",
  height = "1rem",
  radius = "6px",
  style,
}: {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  style?: CSSProperties;
}) {
  return (
    <>
      <span
        aria-hidden="true"
        className="devport-skeleton"
        style={{ width, height, borderRadius: radius, ...style }}
      />
      <style>{`
        .devport-skeleton {
          display: block;
          background: linear-gradient(90deg, var(--border) 25%, var(--input-bg) 37%, var(--border) 63%);
          background-size: 400% 100%;
          animation: devport-skeleton 1.4s ease infinite;
        }
        @keyframes devport-skeleton {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>
    </>
  );
}
