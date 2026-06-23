import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PostCard } from '@/components/post-card'

interface Props {
  params: Promise<{ id: string }>
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const isOwner = user?.id === id

  // 本人なら非公開も含めて全件、他人は公開のみ
  let query = supabase
    .from('posts')
    .select('*, profiles(*)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  if (!isOwner) {
    query = query.eq('visibility', 'public')
  }

  const { data: posts } = await query

  return (
    <div className="max-w-2xl mx-auto">
      {/* プロフィールヘッダー */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {profile.display_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{profile.display_name}</h1>
            {profile.title && (
              <p className="text-sm text-accent font-medium mt-0.5">{profile.title}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">@{profile.username}</p>
            {profile.bio && (
              <p className="text-sm text-foreground mt-3 leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* おすすめ一覧 */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">
          {profile.display_name} さんのおすすめ
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {posts?.length ?? 0}件
          </span>
        </h2>

        {!posts || posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>まだ投稿がありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post as any}
                showVisibility={isOwner}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
