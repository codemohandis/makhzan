import LogoutButton from '@/components/auth/LogoutButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-6">
          <span className="text-base font-semibold text-foreground">
            Makhzan CMS
          </span>
          <LogoutButton />
        </div>
      </header>
      <div>{children}</div>
    </div>
  );
}
