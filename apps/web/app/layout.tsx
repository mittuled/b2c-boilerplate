import type { Metadata } from "next";
import { ThemeProvider, themeInitScript } from "@/lib/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "B2C App",
  description: "B2C application boilerplate",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent flash of wrong theme before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
