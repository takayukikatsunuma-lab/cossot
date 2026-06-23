'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('アカウントを作成しました。プロフィールを設定してください。')
        router.push('/onboarding')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error('メールアドレスまたはパスワードが正しくありません。')
      } else {
        router.push('/')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-primary">こそっと</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            信頼できる人のおすすめが、流通する場所
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            {mode === 'signin' ? 'ログイン' : 'アカウント作成'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="8文字以上"
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '処理中...' : mode === 'signin' ? 'ログイン' : 'アカウントを作成'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'signin' ? (
              <>
                アカウントをお持ちでない方は{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-accent font-medium hover:underline"
                >
                  新規登録
                </button>
              </>
            ) : (
              <>
                すでにアカウントをお持ちの方は{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-accent font-medium hover:underline"
                >
                  ログイン
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
