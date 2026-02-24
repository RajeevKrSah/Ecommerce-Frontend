import type { Metadata } from "next";
import { Poppins, Baskervville} from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import ConditionalLayout from "@/components/layouts/ConditionalLayout";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "400",
});

const baskervville = Baskervville({
  variable: "--font-baskervville",
  subsets: ["latin"],
  weight: "400",
});


export const metadata: Metadata = {
  title: "Poces - Modern E-commerce",
  description: "Modern e-commerce platform with Next.js and Laravel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${baskervville.variable} antialiased`}
        suppressHydrationWarning
      >
        <ToastProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ToastProvider>
      </body>
    </html>
  );
}
