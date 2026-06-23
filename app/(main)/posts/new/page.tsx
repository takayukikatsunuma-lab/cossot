'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { Category, Visibility } from '@/lib/types'

const categories: Category[] = ['飲食', '宿泊', '体験', 'スポット', 'その他']

const visibilityOptions: { value: Visibility; label: string; desc: string }[] = [
  { value: 'public', label: '公開', desc: '誰でも閲覧できます' },
  { value: 'limited', label: '限定公開', desc: 'リンクを知っている人のみ閲覧できます' },
  { value: 'private', label: '非公開', desc: '自分だけが閲覧できます' },
]

export default function NewPostPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    body: '',
    place_name: '',
    address: '',
    category: '' as Category | '',
    for_whom: '',
    scene: '',
    reason: '',
    caution: '',
    visibility: 'public' as Visibility,
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.category) {
      toast.error('カテゴリを選択してください')
      return
    }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: form.title,
        body: form.body,
        place_name: form.place_name,
        address: form.address || null,
        category: form.category,
        for_whom: form.for_whom,
        scene: form.scene,
        reason: form.reason,
        caution: form.caution || null,
        visibility: form.visibility,
      })
      .select()
      .single()

    if (error) {
      toast.error('投稿に失敗しました: ' + error.message)
    } else {
      toast.success('おすすめを投稿しました')
      router.push(`/posts/${data.id}`)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">おすすめを投稿</h1>
        <p className="text-sm text-muted-foreground mt-1">
          あなたの実体験から、信頼できるおすすめを共有しましょう
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <section className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">基本情報</h2>

          <div className="space-y-1.5">
            <Label htmlFor="title">タイトル <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="接待で絶対に外さない、京都の老舗懐石"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>カテゴリ <span className="text-destructive">*</span></Label>
              <Select value={form.category || undefined} onValueChange={v => v && update('category', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="place_name">場所名 <span className="text-destructive">*</span></Label>
              <Input
                id="place_name"
                value={form.place_name}
                onChange={e => update('place_name', e.target.value)}
                placeholder="懐石 桐壺"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">住所（任意）</Label>
            <Input
              id="address"
              value={form.address}
              onChange={e => update('address', e.target.value)}
              placeholder="京都市東山区 ..."
            />
          </div>
        </section>

        {/* 誰向けか */}
        <section className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">誰向けか・どんなシーンか</h2>
          <p className="text-xs text-muted-foreground -mt-2">
            「誰が」「どんな場面で」使えるかを明確にすることで、必要な人に届きます
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="for_whom">こんな方に <span className="text-destructive">*</span></Label>
            <Input
              id="for_whom"
              value={form.for_whom}
              onChange={e => update('for_whom', e.target.value)}
              placeholder="大切な取引先との接待、目上の方を連れて行く方"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="scene">こんなシーンに <span className="text-destructive">*</span></Label>
            <Input
              id="scene"
              value={form.scene}
              onChange={e => update('scene', e.target.value)}
              placeholder="重要な商談前後、特別なお礼の席"
              required
            />
          </div>
        </section>

        {/* おすすめ内容 */}
        <section className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">おすすめの詳細</h2>

          <div className="space-y-1.5">
            <Label htmlFor="body">詳細説明 <span className="text-destructive">*</span></Label>
            <Textarea
              id="body"
              value={form.body}
              onChange={e => update('body', e.target.value)}
              placeholder="実体験を具体的に教えてください"
              rows={5}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">おすすめする理由 <span className="text-destructive">*</span></Label>
            <Textarea
              id="reason"
              value={form.reason}
              onChange={e => update('reason', e.target.value)}
              placeholder="なぜあなたがおすすめするのか、他と比べて何が違うのか"
              rows={3}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="caution">知っておくと良いこと・向かないケース（任意）</Label>
            <Textarea
              id="caution"
              value={form.caution}
              onChange={e => update('caution', e.target.value)}
              placeholder="注意点、予約方法、向かない人・シーン など"
              rows={2}
            />
          </div>
        </section>

        {/* 公開範囲 */}
        <section className="bg-card rounded-xl border border-border p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">公開範囲</h2>
          <p className="text-xs text-muted-foreground -mt-1">情報の公開範囲を選べます</p>

          <div className="space-y-2">
            {visibilityOptions.map(opt => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  form.visibility === opt.value
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={opt.value}
                  checked={form.visibility === opt.value}
                  onChange={() => update('visibility', opt.value)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? '投稿中...' : 'おすすめを投稿する'}
        </Button>
      </form>
    </div>
  )
}
