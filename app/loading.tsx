import { Skeleton } from "@/components/arc/skeleton/skeleton";

export default function Loading() {
  return (
    <div className="page-shell min-h-svh">
      <div className="max-w-xl space-y-6">
        <div className="skeleton h-16 w-3/4" aria-hidden="true" />
        <Skeleton lines={2} label="Loading page" />
      </div>
      <div className="skeleton mt-16 h-64 w-full" aria-hidden="true" />
    </div>
  );
}
