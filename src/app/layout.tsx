import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { NextUiProvider } from "./_providers/ui/NextUiProvider";

export const metadata = {
  title: "rental-engine demo tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <NextUiProvider>
          <main className="flex min-h-screen flex-wrap items-center justify-center gap-3 bg-slate-100 py-5">
            {children}
          </main>
        </NextUiProvider>
      </body>
    </html>
  );
}
