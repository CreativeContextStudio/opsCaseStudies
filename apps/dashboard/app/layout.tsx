import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AstroLab Operations',
  description: 'Agentic operations platform — 7 case studies in automated intelligence',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <div className="flex min-h-screen">
          <nav className="w-56 border-r border-zinc-800 p-6">
            <h1 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              AstroLab
            </h1>
            <ul className="mt-8 space-y-2">
              <li>
                <a href="/standup" className="block rounded px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
                  Standup
                </a>
              </li>
            </ul>
          </nav>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  )
}
