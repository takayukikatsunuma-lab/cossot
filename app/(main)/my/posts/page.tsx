import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/post-card'
import { buttonVariants } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function MyPostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">自分の投稿</h1>
          <p className="text-sm text-muted-foreground mt-1">{posts?.length ?? 0}件のおすすめ</p>
        </div>
        <Link href="/posts/new" className={cn(buttonVariants({ size: 'sm' }))}>
          <PlusCircle size={15} className="mr-1.5" />
          新規投稿
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">まだ投稿がありません</p>
          <Link href="/posts/new" className={cn(buttonVariants())}>
            最初のおすすめを投稿する
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post as any} showVisibility />
          ))}
        </div>
      )}
    </div>
  )
}
