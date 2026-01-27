import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'ダッシュボード', icon: 'dashboard' },
    { path: '/work-records', label: '作業記録', icon: 'assignment' },
    { path: '/fields', label: '圃場管理', icon: 'landscape' },
    { path: '/settings', label: '設定', icon: 'settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <>
      <div className="md:hidden bg-green-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="material-icons text-2xl mr-2">agriculture</span>
          <span className="text-lg font-bold">JGAP農場管理</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-green-700"
        >
          <span className="material-icons">{isOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 w-64 bg-green-800 text-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center px-4 py-6 border-b border-green-700">
                <span className="material-icons text-3xl mr-2">agriculture</span>
                <span className="text-xl font-bold">JGAP農場管理</span>
              </div>

              <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
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

              <div className="border-t border-green-700 p-4">
                <p className="text-sm font-medium mb-2">{currentUser?.email}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm text-green-200 hover:text-white"
                >
                  <span className="material-icons text-sm mr-1">logout</span>
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
