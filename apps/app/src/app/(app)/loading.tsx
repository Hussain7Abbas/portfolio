import { Skeleton } from "@devport/ui";

export default function AppLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "32rem" }}>
      <Skeleton width="40%" height="1.5rem" />
      <Skeleton height="2.25rem" />
      <Skeleton height="2.25rem" />
      <Skeleton height="6rem" />
    </div>
  );
}
