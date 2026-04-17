import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  href?: string;
  viewAllLabel?: string;
  className?: string;
}

export default function SectionHeader({
  title,
  href,
  viewAllLabel = 'مزید دیکھیں',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-6 flex items-center justify-between', className)}>
      <h2 className="font-nastaliq text-2xl font-bold text-foreground">{title}</h2>
      {href && (
        <Link
          href={href}
          className="text-sm font-medium text-accent transition-colors hover:underline"
        >
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
