import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Makhzan",
  description: "Multilingual content platform for Urdu and Farsi",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ur" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
