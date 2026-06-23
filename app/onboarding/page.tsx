'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    username: '',
    display_name: '',
    title: '',
    bio: '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        username: form.username,
        display_name: form.display_name,
        title: form.title || null,
        bio: form.bio || null,
      })
      .eq('id', user.id)

    if (error) {
      if (error.code === '23505') {
        toast.error('そのユーザー名はすでに使われています。')
      } else {
        toast.error('保存に失敗しました: ' + error.message)
      }
    } else {
      toast.success('プロフィールを設定しました')
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">プロフィールを設定</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            あなたのことを教えてください。投稿に表示されます。
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">表示名 <span className="text-destructive">*</span></Label>
              <Input
                id="display_name"
                value={form.display_name}
                onChange={e => update('display_name', e.target.value)}
                placeholder="田中 誠一"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">ユーザー名 <span className="text-destructive">*</span></Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">@</span>
                <Input
                  id="username"
                  value={form.username}
                  onChange={e => update('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="tanaka_ceo"
                  required
                  pattern="[a-z0-9_]+"
                />
              </div>
              <p className="text-xs text-muted-foreground">英小文字・数字・アンダースコアのみ</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">肩書き（任意）</Label>
              <Input
                id="title"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                placeholder="経営者 / ソムリエ / 旅人 など"
              />
              <p className="text-xs text-muted-foreground">投稿カードに表示されます</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">自己紹介（任意）</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={e => update('bio', e.target.value)}
                placeholder="どんな観点でおすすめを集めているか、簡単に教えてください"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '保存中...' : 'はじめる'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
