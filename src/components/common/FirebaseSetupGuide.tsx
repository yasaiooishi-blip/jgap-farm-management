export default function FirebaseSetupGuide() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <span className="material-icons text-yellow-600 mr-3 mt-1">info</span>
        <div>
          <h3 className="font-bold text-yellow-900 mb-2">
            🔧 Firebase設定が必要です
          </h3>
          <p className="text-sm text-yellow-800 mb-3">
            現在デモモードで動作しています。実際に認証機能を使用するには、Firebase設定が必要です。
          </p>
          
          <div className="bg-white rounded p-4 text-sm">
            <p className="font-semibold text-gray-900 mb-2">クイックセットアップ手順：</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>
                <a 
                  href="https://console.firebase.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Firebase Console
                </a>
                {' '}にアクセス
              </li>
              <li>新規プロジェクトを作成（例: jgap-farm-system）</li>
              <li>Authentication &gt; Sign-in method でメール/パスワードを有効化</li>
              <li>Firestore Database を作成（テストモードで開始）</li>
              <li>プロジェクト設定から設定値を取得</li>
              <li><code className="bg-gray-100 px-1 rounded">.env.local</code> ファイルを作成</li>
            </ol>
          </div>

          <div className="mt-3">
            <a
              href="https://github.com/yasaiooishi-blip/jgap-farm-management/blob/main/SETUP.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <span className="material-icons text-sm mr-1">description</span>
              詳細なセットアップガイドを見る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
