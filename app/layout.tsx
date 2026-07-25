import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ConvexClientProvider } from "@/components/web/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "NextPro",
    template: "%s | NextPro",
  },
  description: "NextPro - A modern blog platform built with Next.js and Convex.",
  keywords: ["Next.js", "React", "Convex", "Blog", "Web Development"],
  authors: [{ name: "MD. Tahsin Ferdous" }],
  creator: "MD. Tahsin Ferdous",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "NextPro",
    description: "NextPro - A modern blog platform built with Next.js and Convex.",
    siteName: "NextPro",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextPro",
    description: "NextPro - A modern blog platform built with Next.js and Convex.",
    creator: "@Tahsin005",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-4">
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </main>
          <Toaster closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
