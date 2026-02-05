// Firebase設定
// 本番環境では環境変数を使用してください
// Firebase Console: https://console.firebase.google.com/

// デバッグ用: 直接値を設定（一時的）
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyACN-g79jLRXuV7w4eHS_PYjOrm8zhl6e4",
  authDomain: "jgap-farm-system.firebaseapp.com",
  projectId: "jgap-farm-system",
  storageBucket: "jgap-farm-system.firebasestorage.app",
  messagingSenderId: "310862986394",
  appId: "1:310862986394:web:bc4621002d0c72eb37b323",
  measurementId: "G-VBL6W34GE7"
};

export const firebaseConfig = FIREBASE_CONFIG;

// 環境変数版（後で戻す）
/*
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};
*/

// 実際のFirebaseプロジェクトを作成するには:
// 1. https://console.firebase.google.com/ にアクセス
// 2. 新しいプロジェクトを作成
// 3. Authentication > Sign-in method でメール/パスワードを有効化
// 4. Firestore Database を作成（テストモードで開始）
// 5. プロジェクト設定から上記の設定値を取得
// 6. .env.local ファイルに設定値を記入
