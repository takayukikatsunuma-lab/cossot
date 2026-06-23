import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, FileText } from 'lucide-react'

export default async function MySavesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: saves } = await supabase
    .from('saves')
    .select('*, posts(*, profiles(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">保存済み</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {saves?.length ?? 0}件のおすすめを保存しています
        </p>
      </div>

      {!saves || saves.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>まだ保存したおすすめがありません</p>
          <Link href="/" className="text-accent text-sm mt-2 inline-block hover:underline">
            おすすめを探す
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {saves.map(save => {
            const post = save.posts as any
            const profile = post?.profiles as any
            return (
              <div key={save.id} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="flex gap-0">
                  {/* サムネイル */}
                  {post?.thumbnail_url && (
                    <div className="relative w-24 shrink-0">
                      <Image
                        src={post.thumbnail_url}
                        alt={post?.title ?? ''}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <Link href={`/posts/${post?.id}`}>
                      <h3 className="font-semibold text-foreground text-sm hover:text-accent transition-colors line-clamp-2 mb-1">
                        {post?.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin size={10} />
                      <span>{post?.place_name}</span>
                    </div>

                    {/* 自分用メモ・状態 */}
                    {(save.status || save.memo) && (
                      <div className="bg-secondary/50 rounded-lg p-2 mb-2">
                        {save.status && (
                          <Badge variant="secondary" className="text-xs mb-1">
                            {save.status}
                          </Badge>
                        )}
                        {save.memo && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{save.memo}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={profile?.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {profile?.display_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{profile?.display_name}</span>
                      </div>
                      <Link
                        href={`/my/saves/${save.id}/memo`}
                        className="flex items-center gap-1 text-xs text-accent hover:underline"
                      >
                        <FileText size={11} />
                        {save.memo || save.status ? 'メモを編集' : 'メモを追加'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
