import type { Metadata } from "next";
import { IconSprite } from "@/components/icons";
import "./globals.css";

export const metadata: Metadata = {
  title: "روّج",
  description: "سوّق تخفيضك خلال دقائق",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <IconSprite />
        {children}
      </body>
    </html>
  );
}
