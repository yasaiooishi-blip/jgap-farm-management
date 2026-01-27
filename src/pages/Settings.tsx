import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { currentUser } = useAuth();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="material-icons mr-2 text-green-600">settings</span>
          設定
        </h1>

        <Card title="アカウント情報">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
              <p className="mt-1 text-gray-900">{currentUser?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ユーザーID</label>
              <p className="mt-1 text-gray-600 text-sm font-mono">{currentUser?.uid}</p>
            </div>
          </div>
        </Card>

        <Card title="Firebase設定">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <span className="material-icons text-blue-600 mr-2">info</span>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Firebase設定について</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    このアプリケーションはFirebaseを使用しています。本番環境で使用する場合は、
                    以下の手順でFirebaseプロジェクトを設定してください。
                  </p>
                  <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                    <li>Firebase Console でプロジェクトを作成</li>
                    <li>Authentication でメール/パスワード認証を有効化</li>
                    <li>Firestore Database を作成</li>
                    <li>プロジェクト設定から設定値を取得</li>
                    <li>.env.local ファイルに設定値を記入</li>
                  </ol>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Firestoreセキュリティルール</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザー認証チェック
    function isSignedIn() {
      return request.auth != null;
    }
    
    // 自分のデータのみアクセス可能
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
}`}
              </pre>
            </div>
          </div>
        </Card>

        <Card title="アプリケーション情報">
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">バージョン:</span> 1.0.0</p>
            <p><span className="font-medium">名称:</span> JGAP農場管理システム</p>
            <p><span className="font-medium">説明:</span> JGAP認証取得のための作業記録・圃場管理アプリケーション</p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
