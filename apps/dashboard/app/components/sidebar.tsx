'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const moduleNav: Record<string, { label: string; href: string }[]> = {
  standup: [
    { label: 'Overview', href: '/standup' },
    { label: 'Task DB', href: '/standup/tasks' },
    { label: 'Archive', href: '/standup/history' },
  ],
  market: [
    { label: 'Overview', href: '/market' },
    { label: 'Archive', href: '/market/history' },
  ],
}

const modules = [
  { key: 'standup', label: 'Standup', href: '/standup' },
  { key: 'market', label: 'Market Intel', href: '/market' },
  { key: 'campaign', label: 'Campaign Ops', href: '#' },
  { key: 'client_intel', label: 'Client Intel', href: '#' },
  { key: 'regulatory', label: 'Regulatory', href: '#' },
  { key: 'incident', label: 'Incident', href: '#' },
  { key: 'localization', label: 'Localization', href: '#' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const activeModule = pathname.startsWith('/market')
    ? 'market'
    : pathname.startsWith('/standup')
      ? 'standup'
      : null

  const subNav = activeModule ? moduleNav[activeModule] : null

  return (
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
        {modules.map((m) => (
          <Link
            key={m.key}
            href={m.href}
            className={`block px-3 py-2 font-body text-sm transition-colors ${
              activeModule === m.key
                ? 'bg-surface-highest/50 text-ink font-medium'
                : m.href === '#'
                  ? 'text-outline-variant/50 cursor-default'
                  : 'text-outline hover:text-ink hover:bg-surface-highest/30'
            }`}
          >
            {m.label}
          </Link>
        ))}
      </div>

      {subNav && (
        <div className="mt-6 space-y-1">
          <p className="label text-[9px] px-3 mb-2">Pages</p>
          {subNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-1.5 font-body text-xs transition-colors ${
                pathname === item.href
                  ? 'text-ink font-medium'
                  : 'text-outline hover:text-ink'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

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
  )
}
