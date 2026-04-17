import { ReactNode } from 'react';

interface CmsPageHeaderProps {
  title: string;
  action?: ReactNode;
}

export default function CmsPageHeader({ title, action }: CmsPageHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      {action && <div>{action}</div>}
    </div>
  );
}
