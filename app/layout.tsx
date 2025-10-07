import type { Metadata } from "next";
import "./globals.css";
import Header from "@/layout/header/Header";

export const metadata: Metadata = {
  title: "Luyện english mỗi ngày",
  description: "AI sẽ làm giao viên cho bạn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` antialiased`}>
        <Header />
        <main className="max-w-3xl p-6 mx-auto">{children}</main>
      </body>
    </html>
  );
}
