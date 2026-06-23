export type Visibility = 'public' | 'limited' | 'private'

export type Category = '飲食' | '宿泊' | '体験' | 'スポット' | 'その他'

export type SaveStatus =
  | '行きたい'
  | '接待向き'
  | '家族向け'
  | 'デート向き'
  | '自分に合いそう'
  | '保留'
  | '再訪したい'

export interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  title: string | null
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  title: string
  body: string
  place_name: string
  address: string | null
  lat: number | null
  lng: number | null
  category: Category
  thumbnail_url: string | null
  for_whom: string
  scene: string
  reason: string
  caution: string | null
  visibility: Visibility
  save_count: number
  view_count: number
  created_at: string
  updated_at: string
  // joined
  profiles?: Profile
}

export interface Save {
  id: string
  user_id: string
  post_id: string
  memo: string | null
  status: SaveStatus | null
  tags: string[]
  created_at: string
  updated_at: string
  // joined
  posts?: Post
}

export interface List {
  id: string
  user_id: string
  title: string
  description: string | null
  visibility: Visibility
  created_at: string
  // joined
  profiles?: Profile
}

export interface ListPost {
  id: string
  list_id: string
  post_id: string
  sort_order: number
  created_at: string
  // joined
  posts?: Post
}
