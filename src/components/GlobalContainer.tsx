import { cn } from '@/lib/utils';

interface GlobalContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function GlobalContainer({ children, className }: GlobalContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-6xl',
        'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
}
