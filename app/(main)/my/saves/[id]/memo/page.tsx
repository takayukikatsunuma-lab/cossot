'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { SaveStatus } from '@/lib/types'

const statusOptions: SaveStatus[] = [
  '行きたい', '接待向き', '家族向け', 'デート向き', '自分に合いそう', '保留', '再訪したい'
]

interface Props {
  params: Promise<{ id: string }>
}

export default function SaveMemoPage({ params: paramsPromise }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saveId, setSaveId] = useState('')
  const [postTitle, setPostTitle] = useState('')
  const [memo, setMemo] = useState('')
  const [status, setStatus] = useState<SaveStatus | ''>('')

  useEffect(() => {
    paramsPromise.then(p => setSaveId(p.id))
  }, [paramsPromise])

  useEffect(() => {
    if (!saveId) return
    supabase
      .from('saves')
      .select('*, posts(title)')
      .eq('id', saveId)
      .single()
      .then(({ data }) => {
        if (data) {
          setMemo(data.memo ?? '')
          setStatus((data.status as SaveStatus) ?? '')
          setPostTitle((data.posts as any)?.title ?? '')
        }
      })
  }, [saveId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('saves')
      .update({ memo: memo || null, status: status || null })
      .eq('id', saveId)

    if (error) {
      toast.error('保存に失敗しました')
    } else {
      toast.success('メモを保存しました')
      router.push('/my/saves')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground mb-3 block">
          ← 戻る
        </button>
        <h1 className="text-xl font-bold text-foreground">自分用メモ</h1>
        {postTitle && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{postTitle}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 状態 */}
        <div className="bg-card rounded-xl border border-border p-4">
          <Label className="mb-3 block text-sm font-semibold">このおすすめのステータス</Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(prev => prev === s ? '' : s)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  status === s
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'border-border text-muted-foreground hover:border-accent'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* メモ */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
          <Label htmlFor="memo" className="text-sm font-semibold">自分用メモ</Label>
          <p className="text-xs text-muted-foreground">このメモはあなただけに見えます</p>
          <Textarea
            id="memo"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="誰かと一緒に行きたい、予約は1ヶ月前が必要、など..."
            rows={5}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? '保存中...' : 'メモを保存する'}
        </Button>
      </form>
    </div>
  )
}
