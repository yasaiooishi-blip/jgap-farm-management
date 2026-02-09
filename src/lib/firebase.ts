import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from '../config/firebase';

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);

// サービスのエクスポート
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 認証の永続化設定（ブラウザを閉じてもログイン状態を保持）
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('認証の永続化設定エラー:', error);
});

export default app;
