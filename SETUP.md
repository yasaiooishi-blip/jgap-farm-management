# JGAP農場管理システム - セットアップガイド

このガイドでは、JGAP農場管理システムを初めてセットアップする手順を説明します。

## 📋 前提条件

- Node.js 18以上
- npm または yarn
- Firebaseアカウント（無料プランで十分）
- Git（推奨）

## 🚀 クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/yasaiooishi-blip/jgap-farm-management.git
cd jgap-farm-management
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Firebase プロジェクトのセットアップ

#### 3.1 Firebase Console でプロジェクトを作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `jgap-farm-system`）
4. Google Analytics は任意（推奨: 有効）
5. プロジェクトを作成

#### 3.2 Authenticationの設定

1. Firebase Console > 「Authentication」をクリック
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 「メール/パスワード」を有効化
5. 保存

#### 3.3 Firestoreの設定

1. Firebase Console > 「Firestore Database」をクリック
2. 「データベースの作成」をクリック
3. 「テストモードで開始」を選択（後で変更可能）
4. ロケーションを選択（推奨: `asia-northeast1` - 東京）
5. 有効にする

#### 3.4 セキュリティルールの設定

Firestore Database > 「ルール」タブで以下を設定:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // 圃場データ
    match /fields/{fieldId} {
      allow read, write: if isOwner(resource.data.userId);
      allow create: if isSignedIn() && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // 作業記録データ
    match /workRecords/{recordId} {
      allow read, write: if isOwner(resource.data.userId);
      allow create: if isSignedIn() && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

「公開」をクリックして保存

#### 3.5 Firebase設定の取得

1. Firebase Console > プロジェクト設定（歯車アイコン）
2. 「全般」タブ > 「マイアプリ」セクション
3. 「ウェブアプリを追加」（`</>`アイコン）をクリック
4. アプリのニックネームを入力
5. Firebase Hosting は設定不要（後で設定可能）
6. 「アプリを登録」をクリック
7. 表示された設定値をコピー

### 4. 環境変数の設定

#### 方法1: .env.local ファイルを作成（推奨）

プロジェクトルートに `.env.local` ファイルを作成:

```bash
touch .env.local
```

以下の内容を記入（Firebase Console からコピーした値を使用）:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### 方法2: src/config/firebase.ts を直接編集

`src/config/firebase.ts` を開いて、以下の部分を編集:

```typescript
const firebaseConfig = {
  apiKey: "your_api_key_here",
  authDomain: "your_project_id.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project_id.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};
```

⚠️ **注意**: `.env.local` 方式が推奨されます（Gitにコミットされないため）

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開く

## 📱 初回利用

### ユーザー登録

1. 「新規登録」をクリック
2. メールアドレスとパスワードを入力
3. 「新規登録」ボタンをクリック
4. 自動的にダッシュボードにリダイレクトされます

### 圃場の登録

1. サイドバーから「圃場管理」をクリック
2. 「新規圃場追加」ボタンをクリック
3. 圃場情報を入力:
   - 圃場名（例: 第1圃場）
   - 面積（ha単位、例: 1.5）
   - 作物（例: 水稲）
   - 状態（栽培中/休耕/準備中）
4. 「追加」ボタンをクリック

### 作業記録の追加

1. ダッシュボードの「作業記録を追加」をクリック
   または サイドバーから「作業記録」> 「作業記録追加」
2. 作業情報を入力:
   - 作業日
   - 圃場選択
   - 作業種別（施肥、除草、収穫など）
   - 作業内容詳細
   - 作業者名
3. 「記録する」ボタンをクリック

## 🛠️ トラブルシューティング

### Firebase接続エラー

**症状**: ログイン/登録時にエラーが発生

**解決策**:
1. `.env.local` または `firebase.ts` の設定値を確認
2. Firebase Console で Authentication が有効になっているか確認
3. ブラウザのコンソールでエラー詳細を確認

### Firestore権限エラー

**症状**: データの読み書きができない

**解決策**:
1. Firestore のセキュリティルールが正しく設定されているか確認
2. ユーザーがログインしているか確認
3. テストモードで開始した場合、期限が切れていないか確認

### ビルドエラー

**症状**: `npm install` または `npm run dev` でエラー

**解決策**:
1. Node.js のバージョンを確認（18以上必要）
2. `node_modules` を削除して再インストール:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. キャッシュをクリア:
   ```bash
   npm cache clean --force
   ```

## 🚀 デプロイ

### Firebase Hosting

```bash
# Firebase CLI のインストール
npm install -g firebase-tools

# Firebase にログイン
firebase login

# Firebase プロジェクトの初期化
firebase init hosting

# 以下を選択:
# - Use an existing project: 作成したプロジェクトを選択
# - What do you want to use as your public directory? dist
# - Configure as a single-page app? Yes
# - Set up automatic builds and deploys with GitHub? お好みで

# ビルドとデプロイ
npm run build
firebase deploy
```

### Vercel

1. [Vercel](https://vercel.com/) にサインアップ
2. 「New Project」をクリック
3. GitHub リポジトリを選択
4. 環境変数を設定（`.env.local` の内容）
5. 「Deploy」をクリック

### Netlify

1. [Netlify](https://www.netlify.com/) にサインアップ
2. 「Add new site」> 「Import an existing project」
3. GitHub リポジトリを選択
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 環境変数を設定
6. 「Deploy site」をクリック

## 📞 サポート

問題が解決しない場合:

1. [GitHub Issues](https://github.com/yasaiooishi-blip/jgap-farm-management/issues) で報告
2. README.md の詳細ドキュメントを参照
3. Firebase のドキュメントを確認

## 🎉 セットアップ完了！

これで JGAP農場管理システム が使用可能になりました。
効率的な農場管理をお楽しみください！ 🌾
