# ⚠️ Vercel環境変数の更新が必要

## 問題
Firebase APIキーにタイポがありました：
- ❌ 誤: `AIzaSyACN-g79jLRXuV7w4eHS_PYjOrm8zhL6o4` (末尾 `L6o4`)
- ✅ 正: `AIzaSyACN-g79jLRXuV7w4eHS_PYjOrm8zhl6e4` (末尾 `l6e4`)

## Vercelでの修正手順

1. **Vercelダッシュボード**にアクセス
   https://vercel.com/

2. プロジェクト **"jgap-farm-management"** を選択

3. **Settings** → **Environment Variables** をクリック

4. `VITE_FIREBASE_API_KEY` を探して **Edit** をクリック

5. 値を以下に変更：
   ```
   AIzaSyACN-g79jLRXuV7w4eHS_PYjOrm8zhl6e4
   ```

6. **Save** をクリック

7. **Deployments** タブに移動

8. 最新のデプロイメントの右側の「...」メニューから **Redeploy** を選択

9. ✅ デプロイ完了後、本番環境でログインをテスト

## 確認
- 開発環境: ✅ 修正済み
- 本番環境(Vercel): ⚠️ 要更新
