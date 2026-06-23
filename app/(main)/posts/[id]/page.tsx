import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { VisibilityBadge } from '@/components/visibility-badge'
import { SaveButton } from '@/components/save-button'
import { MapPin, AlertCircle, ChevronRight } from 'lucide-react'
import type { Post, Visibility } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: post } = await supabase
    .from('posts')
    .select('*, profiles(*)')
    .eq('id', id)
    .single()

  if (!post) notFound()

  // 非公開投稿は本人のみ閲覧可
  if (post.visibility === 'private' && post.user_id !== user?.id) notFound()

  // 閲覧数インクリメント（非同期・失敗しても無視）
  supabase.from('posts').update({ view_count: post.view_count + 1 }).eq('id', id)

  // 保存済みか確認
  let isSaved = false
  if (user) {
    const { data } = await supabase
      .from('saves')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .single()
    isSaved = !!data
  }

  const profile = post.profiles as any

  return (
    <article className="max-w-2xl mx-auto">
      {/* パンくずリスト */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">ホーム</Link>
        <ChevronRight size={12} />
        <span className="text-foreground truncate">{post.title}</span>
      </nav>

      {/* サムネイル */}
      {post.thumbnail_url && (
        <div className="relative h-64 sm:h-80 w-full rounded-xl overflow-hidden mb-6">
          <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover" />
        </div>
      )}

      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium px-2 py-0.5 rounded border bg-secondary text-secondary-foreground">
            {post.category}
          </span>
          <VisibilityBadge visibility={post.visibility as Visibility} />
        </div>
        <h1 className="text-2xl font-bold text-foreground leading-snug mb-2">
          {post.title}
        </h1>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin size={13} />
          <span>{post.place_name}</span>
          {post.address && <span>・{post.address}</span>}
        </div>
      </div>

      {/* 投稿者 — 目立つ位置に */}
      <div className="bg-secondary/50 rounded-xl p-4 mb-6 flex items-center justify-between">
        <Link href={`/users/${profile?.id}`} className="flex items-center gap-3 group">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.display_name?.charAt(0) ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground group-hover:text-accent transition-colors">
              {profile?.display_name}
            </p>
            {profile?.title && (
              <p className="text-xs text-muted-foreground">{profile.title}</p>
            )}
          </div>
        </Link>
        <SaveButton postId={id} initialSaved={isSaved} initialCount={post.save_count} />
      </div>

      {/* 誰向け / シーン */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground mb-1">こんな方に</p>
          <p className="text-sm font-medium text-foreground">{post.for_whom}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground mb-1">こんなシーンに</p>
          <p className="text-sm font-medium text-foreground">{post.scene}</p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* 本文 */}
      <div className="prose prose-sm max-w-none mb-6">
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.body}</p>
      </div>

      {/* おすすめ理由 */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold text-accent mb-2">おすすめする理由</p>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.reason}</p>
      </div>

      {/* 注意点 */}
      {post.caution && (
        <div className="bg-muted rounded-xl p-4 mb-6">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertCircle size={13} className="text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground">知っておくと良いこと / 向かないケース</p>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.caution}</p>
        </div>
      )}

      <Separator className="my-6" />

      {/* この人の他のおすすめへ */}
      <div className="text-center">
        <Link
          href={`/users/${profile?.id}`}
          className="inline-flex items-center gap-2 text-sm text-accent hover:underline font-medium"
        >
          {profile?.display_name} さんの他のおすすめを見る
          <ChevronRight size={14} />
        </Link>
      </div>
    </article>
  )
}
