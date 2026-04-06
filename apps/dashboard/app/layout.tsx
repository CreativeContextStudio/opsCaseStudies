import type { Metadata } from 'next'
import { Newsreader, Manrope } from 'next/font/google'
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
  title: 'THE CURATOR — Agentic Operations',
  description: 'Automated standup briefs for three audience levels. Case Study 01.',
}

const navItems = [
  { href: '/', icon: 'dashboard', label: 'Dashboard' },
  { href: '/standup', icon: 'groups', label: 'Team Brief' },
  { href: '/standup', icon: 'description', label: 'Exec Brief', active: true },
  { href: '/standup', icon: 'assignment_ind', label: 'Client Brief' },
  { href: '/standup/history', icon: 'extension', label: 'Integrations' },
  { href: '/standup/history', icon: 'archive', label: 'Archive' },
  { href: '/standup', icon: 'insights', label: 'Intel' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${manrope.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="h-screen w-72 left-0 top-0 fixed bg-surface-low flex flex-col py-12 px-8 z-50">
            <div className="mb-16">
              <span className="font-headline text-xl text-ink tracking-tight block">
                THE CURATOR
              </span>
              <span className="font-body uppercase tracking-[0.1rem] text-[10px] text-outline mt-1 block">
                Editorial V3
              </span>
            </div>

            <nav className="flex flex-col gap-y-5">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-4 pl-4 transition-colors duration-200 ${
                    item.active
                      ? 'text-ink font-bold border-l-2 border-ink ml-[-2px]'
                      : 'text-outline hover:text-ink'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="font-body uppercase tracking-[0.1rem] text-[10px]">
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <main className="ml-72 flex-1 min-h-screen">
            {/* Top header */}
            <header className="w-full sticky top-0 bg-surface z-40">
              <div className="flex justify-between items-center px-12 py-8 max-w-screen-2xl mx-auto">
                <div className="text-2xl font-bold font-headline tracking-[-0.02em] text-ink italic">
                  THE CURATOR
                </div>
                <div className="flex items-center gap-8">
                  <span className="material-symbols-outlined text-ink cursor-pointer hover:opacity-60 transition-opacity">search</span>
                  <span className="material-symbols-outlined text-ink cursor-pointer hover:opacity-60 transition-opacity">notifications</span>
                  <span className="material-symbols-outlined text-ink cursor-pointer hover:opacity-60 transition-opacity">account_circle</span>
                </div>
              </div>
            </header>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
