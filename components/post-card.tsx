'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { VisibilityBadge } from '@/components/visibility-badge'
import { Bookmark, MapPin } from 'lucide-react'
import type { Post } from '@/lib/types'

interface PostCardProps {
  post: Post
  showVisibility?: boolean
}

const categoryColors: Record<string, string> = {
  '飲食': 'bg-amber-50 text-amber-700 border-amber-200',
  '宿泊': 'bg-blue-50 text-blue-700 border-blue-200',
  '体験': 'bg-purple-50 text-purple-700 border-purple-200',
  'スポット': 'bg-green-50 text-green-700 border-green-200',
  'その他': 'bg-gray-50 text-gray-600 border-gray-200',
}

export function PostCard({ post, showVisibility = false }: PostCardProps) {
  const profile = post.profiles

  return (
    <Link href={`/posts/${post.id}`} className="block group h-full">
      <article className="bg-card rounded-xl border border-border overflow-hidden hover:border-accent/40 hover:shadow-md transition-all duration-200 h-full flex flex-col">
        {/* サムネイル */}
        {post.thumbnail_url && (
          <div className="relative h-44 w-full overflow-hidden">
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-4 flex flex-col flex-1">
          {/* カテゴリ + 公開範囲 */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${categoryColors[post.category] ?? categoryColors['その他']}`}>
              {post.category}
            </span>
            {showVisibility && <VisibilityBadge visibility={post.visibility} />}
          </div>

          {/* タイトル */}
          <h3 className="font-semibold text-foreground text-base leading-snug mb-1 group-hover:text-accent transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* 場所 */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin size={11} />
            <span>{post.place_name}</span>
          </div>

          {/* 誰向け / シーン */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.for_whom && (
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                {post.for_whom}
              </span>
            )}
            {post.scene && (
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                {post.scene}
              </span>
            )}
          </div>

          {/* 投稿者 — カードの主役 */}
          <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
            <Link
              href={`/users/${profile?.id}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-2 group/author"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {profile?.display_name?.charAt(0) ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground group-hover/author:text-accent transition-colors leading-none">
                  {profile?.display_name ?? '不明'}
                </p>
                {profile?.title && (
                  <p className="text-xs text-muted-foreground mt-0.5">{profile.title}</p>
                )}
              </div>
            </Link>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Bookmark size={12} />
              <span>{post.save_count}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
