'use client';

import Nav from '@/components/navbar';
import Footer from '@/components/footer/page';

export default function MainLayout({ children }: { children: React.ReactNode }) {
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
