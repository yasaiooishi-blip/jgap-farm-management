// Firebase設定
// 本番環境では環境変数を使用してください
// Firebase Console: https://console.firebase.google.com/

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// 実際のFirebaseプロジェクトを作成するには:
// 1. https://console.firebase.google.com/ にアクセス
// 2. 新しいプロジェクトを作成
// 3. Authentication > Sign-in method でメール/パスワードを有効化
// 4. Firestore Database を作成（テストモードで開始）
// 5. プロジェクト設定から上記の設定値を取得
// 6. .env.local ファイルに設定値を記入
