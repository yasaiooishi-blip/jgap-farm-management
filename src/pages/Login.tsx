import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import FirebaseSetupGuide from '../components/common/FirebaseSetupGuide';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Firebase設定チェック
  const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_API_KEY && 
    import.meta.env.VITE_FIREBASE_API_KEY !== 'demo-api-key';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      return setError('メールアドレスとパスワードを入力してください');
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('ログインエラー:', error);
      if (error.code === 'auth/invalid-credential') {
        setError('メールアドレスまたはパスワードが正しくありません');
      } else if (error.code === 'auth/user-not-found') {
        setError('このメールアドレスは登録されていません');
      } else if (error.code === 'auth/wrong-password') {
        setError('パスワードが正しくありません');
      } else if (error.code === 'auth/invalid-api-key') {
        setError('⚠️ Firebase設定が必要です。SETUP.mdを参照してください。');
      } else if (error.message?.includes('demo-api-key')) {
        setError('⚠️ デモモードです。実際の認証にはFirebase設定が必要です。');
      } else {
        setError(`ログインに失敗しました: ${error.message || 'もう一度お試しください'}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <span className="material-icons text-6xl text-green-600">agriculture</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JGAP農場管理システム</h1>
          <p className="text-gray-600">作業記録と圃場管理を効率化</p>
        </div>

        <Card>
          <h2 className="text-2xl font-bold text-center mb-6">ログイン</h2>
          
          {!isFirebaseConfigured && <FirebaseSetupGuide />}
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <span className="material-icons mr-2">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              type="email"
              label="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />

            <Input
              type="password"
              label="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              required
            />

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない方は{' '}
              <Link to="/signup" className="text-green-600 hover:text-green-700 font-medium">
                新規登録
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
