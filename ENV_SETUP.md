# Firebase環境変数設定ガイド

## ✅ 完了状態

Firebase設定が完了しました！`.env.local` ファイルが正しく作成されています。

## 📋 設定済みの環境変数

以下の環境変数が `.env.local` ファイルに設定されています：

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 🔐 セキュリティ

`.env.local` ファイルは `.gitignore` に含まれており、GitHubにはプッシュされません。

## 🚀 使い方

### 開発環境

開発サーバーを起動すると、自動的に `.env.local` から環境変数が読み込まれます：

```bash
npm run dev
```

### 本番環境

本番環境（Vercel、Netlify、Firebase Hostingなど）では、各プラットフォームの環境変数設定画面で同じ値を設定してください。

#### Vercelの場合

1. プロジェクト設定 → Environment Variables
2. 各変数を追加：
   - `VITE_FIREBASE_API_KEY` = `あなたのAPIキー`
   - `VITE_FIREBASE_AUTH_DOMAIN` = `あなたのAuthDomain`
   - など

#### Netlifyの場合

1. Site settings → Environment variables
2. 各変数を追加

#### Firebase Hostingの場合

Firebase Hostingにデプロイする場合は、環境変数は不要です（同じFirebaseプロジェクトを使用するため）。

## 📝 `.env.local` ファイルの例

```env
# Firebase Configuration
# プロジェクト: jgap-farm-system

VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## ⚠️ 注意事項

- `.env.local` ファイルは **絶対にGitHubにプッシュしないでください**
- APIキーなどの機密情報が含まれています
- チームメンバーとファイルを共有する場合は、安全な方法（1Password、LastPassなど）を使用してください
- 本番環境では、各デプロイプラットフォームの環境変数設定を使用してください

## 🔄 設定の更新

Firebase Consoleで設定を変更した場合は、`.env.local` ファイルも更新してください。

## 🆘 トラブルシューティング

### 環境変数が読み込まれない場合

1. `.env.local` ファイルがプロジェクトルートにあることを確認
2. 変数名が `VITE_` で始まっていることを確認（Viteの要件）
3. 開発サーバーを再起動（`npm run dev`）

### Firebase接続エラー

1. Firebase Consoleで正しいプロジェクトを選択しているか確認
2. Authentication、Firestoreが有効になっているか確認
3. `.env.local` の値がFirebase Consoleの設定と一致しているか確認

## 📚 参考リンク

- [Vite環境変数ドキュメント](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase設定ガイド](https://firebase.google.com/docs/web/setup)
- [セキュリティベストプラクティス](https://firebase.google.com/docs/rules)
