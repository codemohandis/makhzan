import Link from 'next/link';

export default function PublicLogo() {
  return (
    <Link
      href="/"
      className="font-nastaliq text-2xl font-bold text-primary transition-opacity hover:opacity-80"
    >
      مخزن
    </Link>
  );
}
