# こそっと

> 信頼できる人のおすすめが流通する場

「こそっと」は、玉石混交のレビューを集める場ではなく、信頼できる人の"おすすめ"が流通するプラットフォームです。
誰が言ったかがわかる、実体験ベースの情報だけが集まります。

---

## セットアップ

### 必要なもの

- Node.js 18+
- Supabase アカウント（無料プランで動作します）

### 手順

```bash
# 1. 依存パッケージをインストール
npm install

# 2. 環境変数を設定
cp .env.local.example .env.local
# .env.local を編集して Supabase の URL と ANON_KEY を設定

# 3. Supabase のセットアップ
# Supabase Dashboard > SQL Editor で以下を実行:
# supabase/migrations/001_initial.sql

# 4. (オプション) seed データを投入
# Supabase Dashboard > SQL Editor で以下を実行:
# supabase/seed.sql

# 5. 開発サーバーを起動
npm run dev
```

→ http://localhost:3000 でアクセスできます

---

## 環境変数

`.env.local` に以下を設定してください。

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Supabase Dashboard > Settings > API で確認できます。

---

## Vercel デプロイ

```bash
npm install -g vercel
vercel
```

Vercel Dashboard から GitHub リポジトリを連携し、環境変数（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY）を設定してください。

---

## 技術スタック

| 技術 | 用途 |
|---|---|
| Next.js 14 (App Router) | フレームワーク |
| TypeScript | 型安全 |
| Supabase Auth | 認証 |
| Supabase Database | データ管理 |
| shadcn/ui + Tailwind CSS | UI |

---

## 画面一覧

| パス | 画面 |
|---|---|
| `/auth` | サインイン / サインアップ |
| `/onboarding` | 初回プロフィール設定 |
| `/` | ホーム（おすすめ一覧） |
| `/posts/[id]` | 投稿詳細 |
| `/posts/new` | おすすめ投稿作成 |
| `/users/[id]` | 投稿者プロフィール |
| `/my/posts` | 自分の投稿一覧 |
| `/my/saves` | 保存済み一覧 |
| `/my/saves/[id]/memo` | 自分用メモ編集 |
| `/settings` | 設定 |
