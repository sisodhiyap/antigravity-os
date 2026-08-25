import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CommandPalette } from "@/components/layout/CommandPalette";

export const metadata: Metadata = {
  title: "Antigravity OS — Production Dark Futuristic AI Engineering Dashboard",
  description: "Next.js 15 Real-Time Dashboard for Autonomous Swarm, Ryzen 9 + RTX 3060 Hardware, Ollama, Docker, and MCP Servers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cyber-dark text-slate-100 min-h-screen bg-cyber-grid antialiased">
        <QueryProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto space-y-6">
                {children}
              </main>
            </div>
          </div>
          <CommandPalette />
        </QueryProvider>
      </body>
    </html>
  );
}
