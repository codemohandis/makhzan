import LogoutButton from '@/components/auth/LogoutButton';

export default function DashboardPage() {
  return (
    <main>
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Makhzan</h1>
        <LogoutButton />
      </header>
      <section className="px-6 py-8">
        <p className="text-gray-500">Dashboard — Coming Soon</p>
      </section>
    </main>
  );
}
