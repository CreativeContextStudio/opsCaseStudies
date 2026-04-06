import type { Metadata } from 'next'
import { Newsreader, Manrope, Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AstroLab Operations',
  description: 'Agentic operations platform — 7 case studies in automated intelligence',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${manrope.variable}`}>
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <nav className="w-60 bg-surface-low px-5 py-8 flex flex-col shrink-0">
            <Link href="/" className="group">
              <span className="font-headline text-xl text-ink tracking-tight">
                AstroLab
              </span>
              <span className="block label text-[9px] text-outline mt-0.5">
                Operations
              </span>
            </Link>

            <div className="mt-10 space-y-1">
              <p className="label text-[9px] px-3 mb-2">Modules</p>
              <NavLink href="/standup" label="Standup" active />
              <NavLink href="#" label="Market Intel" />
              <NavLink href="#" label="Campaign Ops" />
              <NavLink href="#" label="Client Intel" />
              <NavLink href="#" label="Regulatory" />
              <NavLink href="#" label="Incident" />
              <NavLink href="#" label="Localization" />
            </div>

            <div className="mt-auto pt-6 border-t border-outline-variant/10">
              <div className="px-3 py-2">
                <p className="label text-[9px]">System Health</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block w-1.5 h-1.5 bg-ink" />
                  <span className="font-body text-xs text-outline">All systems nominal</span>
                </div>
              </div>
            </div>
          </nav>

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 font-body text-sm transition-colors ${
        active
          ? 'bg-surface-highest/50 text-ink font-medium'
          : 'text-outline hover:text-ink hover:bg-surface-highest/30'
      }`}
    >
      {label}
    </Link>
  )
}
