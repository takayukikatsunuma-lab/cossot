'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { toast } from 'sonner'

interface SaveButtonProps {
  postId: string
  initialSaved: boolean
  initialCount: number
}

export function SaveButton({ postId, initialSaved, initialCount }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggle() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }

    if (saved) {
      await supabase.from('saves').delete().eq('post_id', postId).eq('user_id', user.id)
      await supabase.from('posts').update({ save_count: count - 1 }).eq('id', postId)
      setSaved(false)
      setCount(c => c - 1)
      toast.info('保存を解除しました')
    } else {
      await supabase.from('saves').insert({ post_id: postId, user_id: user.id })
      await supabase.from('posts').update({ save_count: count + 1 }).eq('id', postId)
      setSaved(true)
      setCount(c => c + 1)
      toast.success('保存しました。メモを追加できます。', {
        action: {
          label: 'メモを追加',
          onClick: () => router.push('/my/saves'),
        },
      })
    }
    setLoading(false)
  }

  return (
    <Button
      variant={saved ? 'default' : 'outline'}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="gap-2"
    >
      {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
      {saved ? '保存済み' : '保存する'}
      <span className="text-xs opacity-70">{count}</span>
    </Button>
  )
}
