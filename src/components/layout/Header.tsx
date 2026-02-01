import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="material-icons text-green-600 text-3xl">agriculture</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">JGAP農場管理システム</h1>
            <p className="text-sm text-gray-600">作業記録と圃場管理を効率化</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{currentUser?.email}</p>
            <p className="text-xs text-gray-500">管理者</p>
          </div>
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <span className="material-icons text-sm">logout</span>
            <span>ログアウト</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
