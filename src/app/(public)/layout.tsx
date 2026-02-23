/**
 * Public Layout
 * Layout for all public-facing pages (includes header and footer)
 * Admin pages use their own layout at /admin/layout.tsx
 */

'use client';

import Nav from '@/components/navbar';
import Footer from '@/components/footer/page';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
