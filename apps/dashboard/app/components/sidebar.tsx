'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const moduleNav: Record<string, { label: string; href: string }[]> = {
  standup: [
    { label: 'Overview', href: '/standup' },
    { label: 'Task DB', href: '/standup/tasks' },
    { label: 'Briefs', href: '/standup/history' },
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
    <div className="flex shrink-0 h-screen sticky top-0">
      {/* Module rail — narrow, always visible */}
      <div className="w-16 bg-surface-low flex flex-col items-center py-8 border-r border-outline-variant/8">
        <Link href="/" className="group mb-10">
          <span className="font-headline text-lg text-ink tracking-tight block text-center">A</span>
        </Link>

        <div className="flex flex-col gap-1 w-full px-2">
          {modules.map((m) => {
            const isActive = activeModule === m.key
            const isDisabled = m.href === '#'
            return (
              <Link
                key={m.key}
                href={m.href}
                title={m.label}
                className={`flex items-center justify-center py-2.5 transition-colors ${
                  isActive
                    ? 'bg-ink text-on-ink'
                    : isDisabled
                      ? 'text-outline-variant/30 cursor-default'
                      : 'text-outline hover:text-ink hover:bg-surface-highest/40'
                }`}
              >
                <span className="font-body text-[10px] font-semibold uppercase tracking-wider">
                  {m.label.slice(0, 2)}
                </span>
              </Link>
            )
          })}
        </div>

        <div className="mt-auto">
          <span className="inline-block w-1.5 h-1.5 bg-ink" title="All systems nominal" />
        </div>
      </div>

      {/* Module content nav — wider, context-specific */}
      {subNav && (
        <div className="w-44 bg-surface py-8 px-4 flex flex-col border-r border-outline-variant/8">
          <div className="mb-8">
            <span className="font-headline text-base font-bold text-ink block">
              {modules.find(m => m.key === activeModule)?.label}
            </span>
            <span className="label text-[8px] text-outline mt-0.5 block">
              Case Study {activeModule === 'standup' ? '01' : '02'}
            </span>
          </div>

          <div className="space-y-0.5">
            {subNav.map((item) => {
              const isActive = pathname === item.href ||
                (item.href === '/standup/tasks' && pathname.startsWith('/standup/tasks')) ||
                (item.href === '/standup/history' && pathname.startsWith('/standup/briefs'))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 font-body text-sm transition-colors ${
                    isActive
                      ? 'bg-surface-low text-ink font-medium'
                      : 'text-outline hover:text-ink hover:bg-surface-low/50'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-outline-variant/8">
            <p className="label text-[8px] px-3">AstroLab Ops</p>
            <p className="font-body text-[10px] text-outline px-3 mt-1">7 modules &middot; 1 architecture</p>
          </div>
        </div>
      )}
    </div>
  )
}
