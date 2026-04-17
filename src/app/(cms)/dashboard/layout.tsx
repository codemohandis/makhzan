import CmsHeader from '@/components/cms/CmsHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <CmsHeader />
      <div>{children}</div>
    </div>
  );
}
