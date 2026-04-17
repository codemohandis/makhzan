import Link from 'next/link';

const footerLinks = [
  { href: '/articles', label: 'مضامین' },
  { href: '/books', label: 'کتب' },
  { href: '/videos', label: 'ویڈیوز' },
  { href: '/about', label: 'بارے میں' },
];

export default function PublicFooter() {
  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="mb-6">
          <span className="font-nastaliq text-2xl font-bold">مخزن</span>
          <p className="mt-1 text-sm text-white/70">ادبی و علمی مواد کا مجموعہ</p>
        </div>

        {/* Navigation */}
        <nav aria-label="فٹر روابط">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Copyright */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-xs text-white/50">© 2026 مخزن — جملہ حقوق محفوظ ہیں</p>
        </div>
      </div>
    </footer>
  );
}
