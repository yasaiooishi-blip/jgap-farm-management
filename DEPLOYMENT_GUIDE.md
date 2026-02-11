# 🚀 JGAP農場管理システム デプロイメントガイド

本番環境へのデプロイ手順を説明します。

---

## 📋 目次

1. [デプロイ前のチェックリスト](#1-デプロイ前のチェックリスト)
2. [Firebase Hosting でのデプロイ（推奨）](#2-firebase-hosting-でのデプロイ推奨)
3. [Vercel でのデプロイ（代替案）](#3-vercel-でのデプロイ代替案)
4. [Netlify でのデプロイ（代替案）](#4-netlify-でのデプロイ代替案)
5. [独自ドメインの設定](#5-独自ドメインの設定)
6. [本番環境の設定](#6-本番環境の設定)
7. [セキュリティチェックリスト](#7-セキュリティチェックリスト)
8. [公開後の運用](#8-公開後の運用)

---

## 1. デプロイ前のチェックリスト

### ✅ 必須チェック項目

- [ ] Firebase プロジェクトが作成されている
- [ ] Firebase Authentication が有効化されている
- [ ] Firebase Firestore が作成され、セキュリティルールが設定されている
- [ ] Firebase Storage が有効化され、セキュリティルールが設定されている
- [ ] Storage の CORS が設定されている
- [ ] `.env.local` または `src/config/firebase.ts` に Firebase 設定が記載されている
- [ ] 本番ビルドが成功する（`npm run build`）
- [ ] TypeScript エラーがない
- [ ] すべての機能が開発環境で動作する

### 🔍 確認コマンド

```bash
# TypeScript チェック
npm run build

# 開発サーバーで動作確認
npm run dev
```

---

## 2. Firebase Hosting でのデプロイ（推奨）

Firebase Hosting は、Firebase プロジェクトと統合されているため、最も簡単で推奨されるデプロイ方法です。

### 2.1 Firebase CLI のインストール

```bash
# Firebase CLI をグローバルインストール
npm install -g firebase-tools

# バージョン確認
firebase --version
```

### 2.2 Firebase にログイン

```bash
firebase login
```

ブラウザが開き、Google アカウントでログインします。

### 2.3 Firebase プロジェクトの初期化

```bash
# プロジェクトルートで実行
firebase init
```

以下の質問に答えます：

```
? Which Firebase features do you want to set up for this directory?
  → Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub Action deploys
  → Firestore
  → Storage

? Please select an option:
  → Use an existing project
  
? Select a default Firebase project for this directory:
  → jgap-farm-system (jgap-farm-system)

=== Firestore Setup
? What file should be used for Firestore Rules?
  → firestore.rules (既存ファイルを使用)

? What file should be used for Firestore indexes?
  → firestore.indexes.json (デフォルト)

=== Storage Setup
? What file should be used for Storage Rules?
  → storage.rules (既存ファイルを使用)

=== Hosting Setup
? What do you want to use as your public directory?
  → dist

? Configure as a single-page app (rewrite all urls to /index.html)?
  → Yes

? Set up automatic builds and deploys with GitHub?
  → No (後で設定可能)

? File dist/index.html already exists. Overwrite?
  → No
```

### 2.4 `firebase.json` の確認・修正

プロジェクトルートに `firebase.json` が作成されます。以下のように設定されているか確認：

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|webp|svg|woff|woff2|ttf)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### 2.5 ビルド

```bash
npm run build
```

`dist` ディレクトリにビルドファイルが生成されます。

### 2.6 デプロイ

```bash
# 全てをデプロイ（Hosting + Firestore Rules + Storage Rules）
firebase deploy

# Hosting のみデプロイ
firebase deploy --only hosting

# ルールのみデプロイ
firebase deploy --only firestore:rules,storage:rules
```

### 2.7 デプロイ完了

デプロイが完了すると、以下のようなメッセージが表示されます：

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/jgap-farm-system/overview
Hosting URL: https://jgap-farm-system.web.app
```

**公開URL**: `https://jgap-farm-system.web.app`

---

## 3. Vercel でのデプロイ（代替案）

Vercel は、React アプリのデプロイに最適化されたプラットフォームです。

### 3.1 Vercel アカウントの作成

1. [Vercel](https://vercel.com/) にアクセス
2. GitHub アカウントでサインアップ

### 3.2 プロジェクトのインポート

1. Vercel ダッシュボードで **「New Project」** をクリック
2. GitHub リポジトリ `jgap-farm-management` を選択
3. **「Import」** をクリック

### 3.3 環境変数の設定

**Build & Development Settings** で以下を設定：

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Environment Variables** に以下を追加：

```
VITE_FIREBASE_API_KEY=AIzaSyACN-g79jLRXuV7w4eHS_PYjOrm8zhL6o4
VITE_FIREBASE_AUTH_DOMAIN=jgap-farm-system.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jgap-farm-system
VITE_FIREBASE_STORAGE_BUCKET=jgap-farm-system.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=310862986394
VITE_FIREBASE_APP_ID=1:310862986394:web:bc4621002d0c72eb37b323
VITE_FIREBASE_MEASUREMENT_ID=G-VBL6W34GE7
```

### 3.4 デプロイ

**「Deploy」** をクリックすると、自動的にビルドとデプロイが開始されます。

完了すると、以下のような URL が生成されます：

```
https://jgap-farm-management.vercel.app
```

### 3.5 自動デプロイの設定

- `main` ブランチへのプッシュで自動デプロイ
- プルリクエストごとにプレビューURL生成

---

## 4. Netlify でのデプロイ（代替案）

Netlify も、静的サイトのデプロイに優れたプラットフォームです。

### 4.1 Netlify アカウントの作成

1. [Netlify](https://netlify.com/) にアクセス
2. GitHub アカウントでサインアップ

### 4.2 プロジェクトのインポート

1. Netlify ダッシュボードで **「Add new site」** → **「Import an existing project」** をクリック
2. GitHub リポジトリ `jgap-farm-management` を選択

### 4.3 ビルド設定

- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 4.4 環境変数の設定

**Site settings** → **Environment variables** で以下を追加：

```
VITE_FIREBASE_API_KEY=AIzaSyACN-g79jLRXuV7w4eHS_PYjOrm8zhL6o4
VITE_FIREBASE_AUTH_DOMAIN=jgap-farm-system.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jgap-farm-system
VITE_FIREBASE_STORAGE_BUCKET=jgap-farm-system.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=310862986394
VITE_FIREBASE_APP_ID=1:310862986394:web:bc4621002d0c72eb37b323
VITE_FIREBASE_MEASUREMENT_ID=G-VBL6W34GE7
```

### 4.5 デプロイ

**「Deploy site」** をクリックすると、デプロイが開始されます。

完了すると、以下のような URL が生成されます：

```
https://jgap-farm-management.netlify.app
```

---

## 5. 独自ドメインの設定

### 5.1 ドメインの取得

以下のサービスでドメインを取得できます：

- [Google Domains](https://domains.google/)（推奨：Firebase と統合が簡単）
- [お名前.com](https://www.onamae.com/)
- [ムームードメイン](https://muumuu-domain.com/)
- [Namecheap](https://www.namecheap.com/)

### 5.2 Firebase Hosting でのドメイン設定

1. Firebase Console → **Hosting** → **カスタムドメイン**
2. **「カスタムドメインを追加」** をクリック
3. ドメイン名を入力（例：`jgap-farm.com`）
4. 表示される DNS レコードをドメインプロバイダーに設定

#### DNS レコードの例

| タイプ | 名前 | 値 |
|--------|------|-----|
| A | @ | 151.101.1.195 |
| A | @ | 151.101.65.195 |
| TXT | @ | (Firebase 提供の値) |

5. **「確認」** をクリック
6. SSL 証明書が自動的にプロビジョニングされます（数分〜数時間）

### 5.3 Vercel でのドメイン設定

1. Vercel ダッシュボード → **Settings** → **Domains**
2. ドメイン名を入力
3. 表示される DNS レコードをドメインプロバイダーに設定

### 5.4 Netlify でのドメイン設定

1. Netlify ダッシュボード → **Domain settings** → **Add custom domain**
2. ドメイン名を入力
3. 表示される DNS レコードをドメインプロバイダーに設定

---

## 6. 本番環境の設定

### 6.1 環境変数の分離

開発環境と本番環境で異なる Firebase プロジェクトを使用する場合：

#### `.env.local`（開発環境）
```env
VITE_FIREBASE_API_KEY=development_api_key
...
```

#### `.env.production`（本番環境）
```env
VITE_FIREBASE_API_KEY=production_api_key
...
```

### 6.2 Firebase プロジェクトの本番/開発分離

#### 推奨構成

- **開発環境**: `jgap-farm-system-dev`
- **本番環境**: `jgap-farm-system`

#### 切り替え方法

```bash
# 開発環境にデプロイ
firebase use dev
firebase deploy

# 本番環境にデプロイ
firebase use production
firebase deploy
```

---

## 7. セキュリティチェックリスト

### ✅ Firebase セキュリティ

- [ ] **Firestore Rules** が本番モードになっている
- [ ] **Storage Rules** が本番モードになっている
- [ ] テストモードのルールを削除している
- [ ] `allow read, write: if true;` のようなルールが **ない**
- [ ] API キーが公開されても問題ないことを確認（Firebase の API キーは公開OK）

### ✅ アプリケーションセキュリティ

- [ ] ユーザー認証が必須のページに認証チェックがある
- [ ] 他のユーザーのデータにアクセスできないことを確認
- [ ] XSS 対策（React は自動でエスケープ）
- [ ] CSRF 対策（Firebase は自動で対策）

### ✅ パフォーマンス

- [ ] 画像が最適化されている
- [ ] 不要な console.log を削除している
- [ ] コードが圧縮されている（Vite が自動で実施）
- [ ] Lazy loading を実装している（必要に応じて）

---

## 8. 公開後の運用

### 8.1 アクセス解析の設定

#### Google Analytics

Firebase Console → **Analytics** → **ダッシュボード** で自動的に統計が表示されます。

#### カスタムイベントの追加

```typescript
import { logEvent } from 'firebase/analytics';
import { analytics } from './lib/firebase';

// 作業記録追加のトラッキング
logEvent(analytics, 'add_work_record', {
  work_type: '施肥',
  field_name: '第1圃場'
});
```

### 8.2 エラー監視

#### Sentry の導入（推奨）

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### 8.3 バックアップ

#### Firestore の自動バックアップ

Firebase Console → **Firestore Database** → **バックアップ** で設定

#### 推奨スケジュール
- 毎日自動バックアップ
- 30日間保存

### 8.4 アップデート手順

```bash
# 1. 変更をコミット
git add .
git commit -m "feat: 新機能を追加"

# 2. GitHubにプッシュ
git push origin main

# 3. ビルドとデプロイ
npm run build
firebase deploy
```

### 8.5 ロールバック手順

```bash
# Firebase Hosting の以前のバージョンに戻す
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION DESTINATION_SITE_ID:live
```

または、Firebase Console → **Hosting** → **リリース履歴** から以前のバージョンを選択して **「ロールバック」**

---

## 🎯 クイックスタートコマンド

```bash
# Firebase Hosting へのデプロイ（推奨）
npm run build && firebase deploy

# Vercel へのデプロイ
vercel --prod

# Netlify へのデプロイ
netlify deploy --prod
```

---

## 📞 サポート

問題が発生した場合：

1. **Firebase Console** でエラーログを確認
2. **ブラウザの開発者ツール** (F12) でコンソールエラーを確認
3. [Firebase サポート](https://firebase.google.com/support)
4. [GitHub Issues](https://github.com/yasaiooishi-blip/jgap-farm-management/issues)

---

## 🎉 おめでとうございます！

アプリが本番環境で公開されました！

**次のステップ：**
1. 実際のユーザーでテスト
2. フィードバック収集
3. 継続的な改善

---

**JGAP農場管理システム** - 持続可能な農業経営のために 🌾
