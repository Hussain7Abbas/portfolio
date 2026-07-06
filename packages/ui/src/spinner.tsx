import type { CSSProperties } from "react";

export function Spinner({
  size = 16,
  style,
}: {
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <>
      <span
        aria-hidden="true"
        className="devport-spinner"
        style={{ width: size, height: size, ...style }}
      />
      <style>{`
        .devport-spinner {
          display: inline-block;
          flex-shrink: 0;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: devport-spin 0.6s linear infinite;
          vertical-align: -2px;
        }
        @keyframes devport-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
