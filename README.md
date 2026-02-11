# JGAP農場管理システム

JGAP（日本農業規範）認証取得のための作業記録・圃場管理を効率的に行えるWebアプリケーション

## 📋 現在の完成機能

### ✅ 1. ユーザー認証
- メール/パスワードでの新規登録
- ログイン/ログアウト機能
- 認証状態の保持

### ✅ 2. ダッシュボード（新デザイン）
- ウェルカムメッセージ（ユーザー名表示）
- 統計情報カード
  - 登録圃場数
  - 作業記録数
  - 今日の予定タスク数
  - 7日間の活動数
- クイックアクションボタン（4種類）
  - 作業記録を追加
  - 圃場管理
  - 資材管理
  - レポート
- 天気ウィジェット
  - 気温、湿度、降水確率表示
  - 天候に応じたアドバイス
  - マテリアルアイコン使用
- 今日の作業予定
  - 本日予定されているタスクを一覧表示
  - 優先度表示（重要/通常/低）
  - 圃場名、開始時刻表示
  - 作業追加ボタン
- JGAP認証サポート情報
  - 対応機能のチェックリスト
  - 認証レポート作成ボタン
- お知らせセクション
  - システム更新情報
  - 天候アラート

### ✅ 3. 作業記録入力
- 作業日選択（日付ピッカー）
- 圃場選択（ドロップダウン）
- 作業種別選択（8種類）
  - 施肥、除草、収穫、農薬散布、播種、定植、整地、その他
- 作業内容詳細入力
- 作業者名入力
- バリデーション機能

### ✅ 4. 圃場管理
- 圃場一覧表示（テーブル形式）
- 圃場情報：名称、面積、作物、状態
- 新規圃場追加機能
- 圃場情報編集機能
- 圃場削除機能
- 状態管理（栽培中、休耕、準備中）

### ✅ 5. 作業記録一覧
- テーブル表示（日付、圃場、作物、作業種別、作業者、作業内容）
- 日付降順ソート
- 高度なフィルタリング機能
  - 日付範囲指定（開始日〜終了日）
  - 圃場別フィルター
  - 作業種別フィルター
- フィルタークリア機能

### ✅ 6. レイアウト＆ナビゲーション
- PCサイドバーナビゲーション
- モバイルハンバーガーメニュー
- 新しいヘッダーコンポーネント
  - ロゴとタイトル表示
  - ユーザー情報（メールアドレス、権限）表示
  - ログアウトボタン
- レスポンシブデザイン対応

### ✅ 7. 設定画面
- アカウント情報表示
- Firebase設定ガイド
- Firestoreセキュリティルール例

## 🎯 機能別URIパス

### 認証関連
- `/login` - ログインページ（新UIデザイン）
- `/signup` - 新規登録ページ（新UIデザイン）

### メイン機能（認証必須）
- `/dashboard` - ダッシュボード（新デザイン：天気ウィジェット、今日のタスク、統計カード）
- `/fields` - 圃場管理（一覧、追加、編集、削除）
- `/work-records` - 作業記録一覧（検索、フィルタリング）
- `/work-records/add` - 作業記録追加
- `/materials` - 資材管理（予定）
- `/reports` - レポート機能（予定）
- `/settings` - 設定（アカウント情報、Firebase設定ガイド）

### リダイレクト
- `/` - `/dashboard`にリダイレクト

## 📊 データモデル

### Firestore Collections

#### fields（圃場）
```typescript
{
  id: string;
  userId: string;
  name: string;        // 圃場名
  area: number;        // 面積（ha）
  crop: string;        // 栽培作物
  status: '栽培中' | '休耕' | '準備中';
  createdAt: Timestamp;
}
```

#### workRecords（作業記録）
```typescript
{
  id: string;
  userId: string;
  date: string;        // YYYY-MM-DD形式
  fieldId: string;
  fieldName: string;
  crop: string;
  workType: '施肥' | '除草' | '収穫' | '農薬散布' | '播種' | '定植' | '整地' | 'その他';
  workDetail: string;
  worker: string;
  createdAt: Timestamp;
}
```

## 🚧 未実装機能

- 天気情報API連携（OpenWeatherMap等）
- 資材管理機能（農薬、肥料の在庫管理）
- レポート機能（JGAP認証用レポート生成）
- 作業記録の編集・削除機能
- データエクスポート機能（CSV、PDF）
- 画像アップロード機能
- プッシュ通知機能
- データ分析・グラフ表示
- 多言語対応

## ✨ 最近の更新（2026-02-01）

### 新規追加コンポーネント
- **Header.tsx** - 新しいヘッダーコンポーネント
- **WeatherWidget.tsx** - 天気情報ウィジェット
- **TodayTasks.tsx** - 今日のタスク管理コンポーネント
- **DashboardNew.tsx** - 改善された新しいダッシュボード

### UI/UX改善
- ログイン/新規登録ページのデザイン統一
- グラデーション背景の追加
- エラーメッセージの改善
- マテリアルアイコンの活用
- レスポンシブデザインの最適化

## 💡 推奨される次のステップ

1. **Firebase設定の完了**
   - Firebase Consoleでプロジェクトを作成
   - Authentication、Firestoreを有効化
   - 環境変数の設定

2. **作業記録の編集・削除機能の追加**
   - 既存の作業記録を編集できる機能
   - 不要な記録を削除できる機能

3. **データエクスポート機能**
   - 作業記録をCSV形式でダウンロード
   - JGAP監査用のPDFレポート生成

4. **写真アップロード機能**
   - 作業記録に写真を添付
   - Firebase Storageを使用

5. **データ分析機能**
   - 作業頻度の可視化
   - 圃場ごとの作業統計
   - グラフ・チャート表示

## 🛠️ 技術スタック

- **フロントエンド**
  - React 19.2.0
  - TypeScript 5.9.3
  - TailwindCSS 4.1.18
  - Vite 7.2.4
  - React Router 7.13.0

- **バックエンド**
  - Firebase Authentication
  - Firestore Database

- **UI/UX**
  - Material Icons
  - Google Fonts (Noto Sans JP)
  - レスポンシブデザイン

## 📦 セットアップ

### 依存関係のインストール
```bash
npm install
```

### Firebase設定

**詳細なセットアップ手順は [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) を参照してください。**

#### 簡易セットアップ手順

1. Firebase Consoleでプロジェクトを作成: https://console.firebase.google.com/
2. Authentication > Sign-in method でメール/パスワードを有効化
3. Firestore Database を作成（本番環境モードで開始）
4. Firebase Storage を有効化
5. プロジェクト設定から設定値を取得
6. `src/config/firebase.ts` の設定値を更新、または `.env.local` に以下を記入:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

7. Firestore と Storage のセキュリティルールを設定（詳細は FIREBASE_SETUP.md 参照）

### Firestoreセキュリティルールの設定
Firebase Console > Firestore Database > ルール で以下を設定:

プロジェクトルートに`firestore.rules`ファイルがあります。このファイルをFirebase Consoleにコピーしてください。

または、Firebase CLIでデプロイ:
```bash
firebase deploy --only firestore:rules
```

### Firebase Storageセキュリティルールの設定
Firebase Console > Storage > ルール で以下を設定:

プロジェクトルートに`storage.rules`ファイルがあります。このファイルをFirebase Consoleにコピーしてください。

または、Firebase CLIでデプロイ:
```bash
firebase deploy --only storage:rules
```

**重要**: JGAP添付資料のアップロード機能を使用するには、Firebase Storageのルールが正しく設定されている必要があります。

### 開発サーバーの起動
```bash
npm run dev:sandbox
```

ブラウザで `http://localhost:3000` を開く

### ビルド
```bash
npm run build
```

### プレビュー
```bash
npm run preview
```

## 🚀 デプロイ

### Firebase Hosting
```bash
# Firebase CLIのインストール
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# Firebaseプロジェクトの初期化
firebase init hosting

# デプロイ
npm run build
firebase deploy
```

### Vercel、Netlifyなど
各プラットフォームの指示に従ってください。

## 📱 レスポンシブデザイン

- **モバイル** (〜768px): ハンバーガーメニュー、縦並びレイアウト
- **タブレット・PC** (768px〜): サイドバーナビゲーション、グリッドレイアウト

## 🎨 デザイン

- **プライマリカラー**: #4CAF50（グリーン）
- **背景色**: #FFFFFF（ホワイト）
- **フォント**: Noto Sans JP

## 📄 ライセンス

MIT License

## 🤝 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📞 サポート

質問や問題がある場合は、GitHubのIssuesで報告してください。

---

**JGAP農場管理システム** - 持続可能な農業経営のために 🌾
