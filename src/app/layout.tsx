import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_TAGLINE, COMPANY_NAME } from "@/lib/constants";
import Image from "next/image";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} - ${APP_TAGLINE}`,
  description: `${APP_NAME} - AI-powered clinical discussion analysis for oncology professionals. Powered by ${COMPANY_NAME}.`,
  keywords: ["oncology", "AI", "voice analysis", "clinical discussions", "medical AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {/* Header with Cortex branding */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src="/images/cortex-logo.png"
                  alt={`${COMPANY_NAME} Logo`}
                  width={180}
                  height={60}
                  className="h-14 w-auto"
                  priority
                />
                <div className="h-8 w-px bg-slate-700" />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                    {APP_NAME}
                  </h1>
                  <p className="text-xs text-slate-400">{APP_TAGLINE}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content with padding for fixed header */}
        <main className="pt-20 min-h-[calc(100vh-8rem)] pb-4">
          {children}
        </main>

        {/* Compact Footer */}
        <footer className="bg-slate-900/30 border-t border-slate-800/50 py-2">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
              <span>Powered by <span className="font-semibold text-slate-400">{COMPANY_NAME}</span></span>
              <span className="text-slate-700">•</span>
              <span>AI-powered clinical intelligence for oncology professionals</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
