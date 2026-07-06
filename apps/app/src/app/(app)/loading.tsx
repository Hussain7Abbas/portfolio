import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="flex max-w-lg flex-col gap-3">
      <Skeleton className="h-6 w-[40%]" />
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
      <Skeleton className="h-24" />
    </div>
  );
}
