'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState({
    display_name: '',
    username: '',
    title: '',
    bio: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth'); return }
      setUserId(user.id)
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) setForm({
          display_name: data.display_name ?? '',
          username: data.username ?? '',
          title: data.title ?? '',
          bio: data.bio ?? '',
        })
      })
    })
  }, [])

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: form.display_name,
        username: form.username,
        title: form.title || null,
        bio: form.bio || null,
      })
      .eq('id', userId)

    if (error) {
      toast.error(error.code === '23505' ? 'そのユーザー名はすでに使われています' : error.message)
    } else {
      toast.success('プロフィールを更新しました')
    }
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">設定</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-semibold">プロフィール</h2>

          <div className="space-y-1.5">
            <Label htmlFor="display_name">表示名</Label>
            <Input
              id="display_name"
              value={form.display_name}
              onChange={e => update('display_name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">ユーザー名</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">@</span>
              <Input
                id="username"
                value={form.username}
                onChange={e => update('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">肩書き</Label>
            <Input
              id="title"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="経営者 / ソムリエ など"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">自己紹介</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={e => update('bio', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? '保存中...' : '保存する'}
        </Button>
      </form>

      <Separator className="my-6" />

      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold mb-3">アカウント</h2>
        <Button variant="outline" onClick={handleSignOut} className="text-destructive border-destructive/30 hover:bg-destructive/5">
          ログアウト
        </Button>
      </div>
    </div>
  )
}
