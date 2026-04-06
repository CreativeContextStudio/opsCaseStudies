import type { Metadata } from 'next'
import { DM_Serif_Display, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AstroLab Operations',
  description: 'Agentic operations platform — 7 case studies in automated intelligence',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <nav className="w-60 border-r border-sand-200 bg-sand-100/60 px-5 py-8 flex flex-col">
            <Link href="/" className="group">
              <span className="font-display text-xl text-sand-800 tracking-tight">
                AstroLab
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-sand-400 mt-0.5">
                Operations
              </span>
            </Link>

            <div className="mt-10 space-y-1">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400 mb-2">
                Modules
              </p>
              <NavLink href="/standup" label="Standup" icon="&#9679;" active />
              <NavLink href="#" label="Market Intel" icon="&#9675;" />
              <NavLink href="#" label="Campaign Ops" icon="&#9675;" />
              <NavLink href="#" label="Client Intel" icon="&#9675;" />
              <NavLink href="#" label="Regulatory" icon="&#9675;" />
              <NavLink href="#" label="Incident" icon="&#9675;" />
              <NavLink href="#" label="Localization" icon="&#9675;" />
            </div>

            <div className="mt-auto pt-6 border-t border-sand-200">
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-400">
                  System Health
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage" />
                  <span className="text-xs text-sand-500">All systems nominal</span>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

function NavLink({ href, label, icon, active }: { href: string; label: string; icon: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? 'bg-sand-200/80 text-sand-800 font-medium'
          : 'text-sand-500 hover:bg-sand-200/50 hover:text-sand-700'
      }`}
    >
      <span className={`text-[8px] ${active ? 'text-amber-accent' : ''}`}>{icon}</span>
      {label}
    </Link>
  )
}
