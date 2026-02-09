import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'ダッシュボード', icon: 'dashboard' },
    { path: '/work-records', label: '作業記録', icon: 'assignment' },
    { path: '/fields', label: '圃場管理', icon: 'landscape' },
    { path: '/material-usage', label: '農薬・肥料使用簿', icon: 'description' },
    { path: '/settings', label: '設定', icon: 'settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-green-800 text-white">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <span className="material-icons text-3xl mr-2">agriculture</span>
          <span className="text-xl font-bold">JGAP農場管理</span>
        </div>
        
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(item.path)
                  ? 'bg-green-900 text-white'
                  : 'text-green-100 hover:bg-green-700'
              }`}
            >
              <span className="material-icons mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-shrink-0 flex border-t border-green-700 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{currentUser?.email}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-green-200 hover:text-white flex items-center mt-1"
                >
                  <span className="material-icons text-sm mr-1">logout</span>
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
