import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ConnectButton } from "@/components/ConnectButton";
import { NavLinks } from "@/components/NavLinks";
import { ChainGuard } from "@/components/ChainGuard";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Crowdfund DApp",
  description: "去中心化众筹平台 — 支持 ETH 捐赠 + Staking 挖矿",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased font-sans">
       {/* Providers：全局状态提供者（钱包、主题等） ChainGuard：包裹所有内容，确保在正确网络上 */}
        <Providers>
          <ChainGuard>
            <Header />
            <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
          </ChainGuard>
        </Providers>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="bg-[var(--card)] border-b border-[var(--card-border)] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <a href="/" className="text-xl font-bold text-indigo-600 shrink-0">
            Crowdfund
          </a>
          <nav className="hidden md:flex items-center gap-1 text-sm overflow-x-auto">
            <NavLinks />
          </nav>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
