import { cn } from "@/lib/utils";

interface GlobalContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function GlobalContainer({ children, className }: GlobalContainerProps) {
  return (
    <div
      dir="rtl"
      className={cn(
        "min-h-screen bg-paper text-ink",
        "mx-auto max-w-6xl",
        "ps-4 pe-4 sm:ps-6 sm:pe-6 lg:ps-8 lg:pe-8",
        className
      )}
    >
      {children}
    </div>
  );
}
