import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Dùng font Inter phổ biến
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hệ sinh thái học tập thông minh",
  description: "Hỗ trợ học tập cá nhân hóa với AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
