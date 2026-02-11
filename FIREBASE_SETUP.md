# Firebase セットアップガイド

このガイドでは、JGAP農場管理システムに必要なFirebaseの設定を説明します。

## 📋 目次

1. [Firebase プロジェクトの作成](#1-firebase-プロジェクトの作成)
2. [Firebase Authentication の設定](#2-firebase-authentication-の設定)
3. [Cloud Firestore の設定](#3-cloud-firestore-の設定)
4. [Firebase Storage の設定](#4-firebase-storage-の設定)
5. [セキュリティルールのデプロイ](#5-セキュリティルールのデプロイ)
6. [トラブルシューティング](#6-トラブルシューティング)

---

## 1. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例：`jgap-farm-management`）
4. Google アナリティクスは任意（オフでも可）
5. 「プロジェクトを作成」をクリック

---

## 2. Firebase Authentication の設定

### 手順

1. Firebase Console で作成したプロジェクトを開く
2. 左メニューから「Authentication」を選択
3. 「始める」をクリック
4. 「Sign-in method」タブを選択
5. 「メール/パスワード」をクリック
6. 「有効にする」をオンにして保存

### 確認事項

- ✅ メール/パスワード認証が有効になっていること
- ✅ 「メールリンク（パスワードなしでログイン）」はオフのまま

---

## 3. Cloud Firestore の設定

### データベースの作成

1. 左メニューから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. ロケーションを選択（例：`asia-northeast1`（東京）または`asia-northeast2`（大阪））
4. セキュリティルールは「本番環境モード」を選択（後で設定）
5. 「次へ」→「有効にする」

### セキュリティルールの設定

1. Firestore Database で「ルール」タブを選択
2. 以下のルールをコピー＆ペースト：

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ユーザープロファイル
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 組織
    match /organizations/{orgId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // 圃場
    match /fields/{fieldId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // 作業記録
    match /workRecords/{recordId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // JGAP添付資料
    match /jgapAttachments/{attachmentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // 資材
    match /materials/{materialId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // 出荷
    match /shipments/{shipmentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // 権限
    match /permissions/{permissionId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null && resource.data.fromUserId == request.auth.uid;
    }
  }
}
```

3. 「公開」をクリック

---

## 4. Firebase Storage の設定

### ストレージの有効化

1. 左メニューから「Storage」を選択
2. 「始める」をクリック
3. セキュリティルールは「本番環境モード」を選択
4. ロケーションを選択（Firestoreと同じ推奨）
5. 「完了」をクリック

### セキュリティルールの設定

1. Storage で「ルール」タブを選択
2. 以下のルールをコピー＆ペースト：

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // JGAP添付資料: 認証ユーザーは自分のファイルにアクセス可能
    match /jgap-attachments/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 作業記録の画像: 認証ユーザーは自分のファイルにアクセス可能
    match /work-records/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // その他のファイル: 認証ユーザーのみアクセス可能
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. 「公開」をクリック

### ⚠️ 重要：CORSの設定

**この設定は非常に重要です！** CORSを設定しないと、ブラウザからStorageにアクセスできません。

#### 方法1：Firebase CLIを使用（推奨）

```bash
# Firebase CLIのインストール（まだの場合）
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# CORSの設定ファイルを作成
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
EOF

# CORSをStorageに適用
gsutil cors set cors.json gs://YOUR_PROJECT_ID.appspot.com
```

`YOUR_PROJECT_ID` は Firebase プロジェクトIDに置き換えてください。

#### 方法2：Google Cloud Console を使用

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. Firebaseプロジェクトを選択
3. 左メニューから「Cloud Storage」→「ブラウザ」を選択
4. バケット名をクリック
5. 上部の「設定」タブを選択
6. 「CORS構成を編集」をクリック
7. 以下のJSONを貼り付け：

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

8. 「保存」をクリック

---

## 5. セキュリティルールのデプロイ

### Firebase CLIを使用してルールをデプロイ（オプション）

プロジェクトルートに `firestore.rules` と `storage.rules` ファイルがあります。

```bash
# Firebase CLIのインストール（まだの場合）
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトの初期化
firebase init

# Firestore と Storage を選択
# 既存のルールファイル（firestore.rules, storage.rules）を使用

# ルールをデプロイ
firebase deploy --only firestore:rules,storage:rules
```

---

## 6. トラブルシューティング

### アップロードエラー：「ストレージへのアクセス権限がありません」

**原因**: Firebase Storage のセキュリティルールが正しく設定されていない

**解決策**:
1. Firebase Console → Storage → ルール を確認
2. 上記の「Firebase Storage の設定」セクションのルールが正しく設定されているか確認
3. 「公開」ボタンをクリックしてルールを反映

### アップロードエラー：「CORS policy」エラー

**原因**: CORSが正しく設定されていない

**解決策**:
1. 上記の「CORSの設定」セクションを実施
2. ブラウザのキャッシュをクリア（Ctrl+Shift+Delete）
3. ページをリロード

### ファイルが見つからない：「404 Not Found」

**原因**: ファイルのパスが間違っている、または削除されている

**解決策**:
1. Firebase Console → Storage → Files でファイルが実際に存在するか確認
2. ファイルパスが `jgap-attachments/{userId}/{timestamp}_{filename}` の形式になっているか確認

### 認証エラー：「ログインが必要です」

**原因**: ユーザーがログインしていない、または認証トークンが期限切れ

**解決策**:
1. ログアウトして再ログイン
2. ブラウザのキャッシュをクリア
3. Firebase Authentication の設定を確認

### Firestoreエラー：「permission-denied」

**原因**: Firestore のセキュリティルールが正しく設定されていない

**解決策**:
1. Firebase Console → Firestore Database → ルール を確認
2. 上記の「Cloud Firestore の設定」セクションのルールが正しく設定されているか確認
3. 「公開」ボタンをクリックしてルールを反映

---

## ✅ チェックリスト

セットアップが完了したら、以下を確認してください：

- [ ] Firebase プロジェクトが作成されている
- [ ] Authentication でメール/パスワード認証が有効
- [ ] Firestore Database が作成され、セキュリティルールが設定されている
- [ ] Firebase Storage が有効化され、セキュリティルールが設定されている
- [ ] Storage の CORS が設定されている
- [ ] `src/config/firebase.ts` または `.env.local` に Firebase 設定が記載されている
- [ ] アプリでログインしてファイルのアップロードができる

---

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. Firebase Console でプロジェクトが正しく選択されているか
2. ブラウザのコンソール（F12 → Console）でエラーメッセージを確認
3. Firebase Console の「使用状況」タブで上限に達していないか確認

さらに詳しい情報は [Firebase ドキュメント](https://firebase.google.com/docs?hl=ja) を参照してください。
