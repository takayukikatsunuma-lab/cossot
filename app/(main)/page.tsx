import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/post-card'
import type { Category } from '@/lib/types'

const categories: Category[] = ['飲食', '宿泊', '体験', 'スポット', 'その他']

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { category } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select('*, profiles(*)')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  if (category && categories.includes(category as Category)) {
    query = query.eq('category', category)
  }

  const { data: posts } = await query

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">おすすめ一覧</h1>
        <p className="text-sm text-muted-foreground mt-1">
          信頼できる人の、実体験からのおすすめ
        </p>
      </div>

      {/* カテゴリフィルタ */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <a
          href="/"
          className={`shrink-0 text-sm px-3 py-1.5 rounded-full border transition-colors ${
            !category
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:border-accent hover:text-accent'
          }`}
        >
          すべて
        </a>
        {categories.map(cat => (
          <a
            key={cat}
            href={`/?category=${cat}`}
            className={`shrink-0 text-sm px-3 py-1.5 rounded-full border transition-colors ${
              category === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-accent hover:text-accent'
            }`}
          >
            {cat}
          </a>
        ))}
      </div>

      {/* 投稿一覧 */}
      {!posts || posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">まだ投稿がありません</p>
          <p className="text-sm mt-1">最初のおすすめを投稿してみましょう</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post as any} />
          ))}
        </div>
      )}
    </div>
  )
}
