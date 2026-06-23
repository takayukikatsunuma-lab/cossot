'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Home, PlusCircle, Bookmark, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/lib/types'

interface NavProps {
  profile: Profile | null
}

export function Nav({ profile }: NavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  // メニュー外クリックで閉じる
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navItems = [
    { href: '/', label: 'ホーム', icon: Home },
    { href: '/posts/new', label: 'おすすめを投稿', icon: PlusCircle },
    { href: '/my/saves', label: '保存済み', icon: Bookmark },
  ]

  const menuItems = [
    { label: 'マイプロフィール', icon: User, href: profile ? `/users/${profile.id}` : '/onboarding' },
    { label: '自分の投稿', icon: Home, href: '/my/posts' },
    { label: '保存済み', icon: Bookmark, href: '/my/saves' },
    { label: '設定', icon: Settings, href: '/settings' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* ロゴ */}
        <Link href="/" className="font-bold text-xl text-primary tracking-tight">
          こそっと
        </Link>

        {/* ナビ（デスクトップ） */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                pathname === href
                  ? 'text-primary bg-secondary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        {/* ユーザーメニュー */}
        <div className="relative" ref={menuRef}>
          <div
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-2 cursor-pointer rounded-full p-1 hover:bg-muted transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {profile?.display_name?.charAt(0) ?? '?'}
              </AvatarFallback>
            </Avatar>
          </div>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
              {profile && (
                <>
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium">{profile.display_name}</p>
                    <p className="text-xs text-muted-foreground">@{profile.username}</p>
                  </div>
                </>
              )}
              {menuItems.map(({ label, icon: Icon, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Icon size={14} className="text-muted-foreground" />
                  {label}
                </Link>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                >
                  <LogOut size={14} />
                  ログアウト
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* モバイルボトムナビ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around h-14">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-2 text-xs',
                pathname === href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
