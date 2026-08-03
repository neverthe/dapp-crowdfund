'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: '项目列表' },
  { href: '/create', label: '发起众筹' },
  { href: '/stake', label: 'Staking' },
  { href: '/activity', label: '活动历史' },
  { href: '/my-campaigns', label: '我的众筹' },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <>
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
            pathname === link.href
              ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </>
  )
}
