import { Skeleton } from "@/components/arc/skeleton/skeleton";

// Placeholder for a post or project body while its slug resolves. Sits inside
// the page shell, under the back link, so the App Shell keeps both.
export default function DetailSkeleton({ label }: { label: string }) {
  return (
    <div className="min-h-svh">
      <div className="max-w-xl space-y-6">
        <div className="skeleton h-16 w-3/4" aria-hidden="true" />
        <Skeleton lines={2} label={label} />
      </div>
      <div className="skeleton mt-16 h-64 w-full" aria-hidden="true" />
    </div>
  );
}
