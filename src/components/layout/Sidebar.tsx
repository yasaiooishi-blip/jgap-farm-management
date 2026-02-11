import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { UserProfile, Permission } from '../../types';

interface OrganizationMember {
  id: string;
  displayName: string;
  email: string;
  hasPermission: boolean;
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile, logout, isAdmin, isOrgLeader } = useAuth();
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { path: '/dashboard', label: 'ダッシュボード', icon: 'dashboard' },
    { path: '/work-records', label: '作業記録', icon: 'assignment' },
    { path: '/fields', label: '圃場管理', icon: 'landscape' },
    { path: '/materials', label: '資材管理', icon: 'inventory_2' },
    { path: '/material-usage', label: '農薬・肥料使用簿', icon: 'description' },
    { path: '/reports', label: 'レポート', icon: 'assessment' },
    { path: '/settings', label: '設定', icon: 'settings' },
  ];

  useEffect(() => {
    loadOrgMembers();
  }, [currentUser, userProfile]);

  const loadOrgMembers = async () => {
    if (!currentUser || !userProfile) {
      setLoading(false);
      return;
    }

    try {
      // 管理者または組織リーダーの場合は組織メンバーを表示
      if (isAdmin() || isOrgLeader()) {
        setLoading(false);
        return; // 管理者とリーダーはすべてのデータにアクセスできるのでメンバー一覧は不要
      }

      // 一般ユーザーの場合、組織のメンバーを取得
      if (userProfile.organizationId) {
        const membersQuery = query(
          collection(db, 'users'),
          where('organizationId', '==', userProfile.organizationId)
        );
        const membersSnapshot = await getDocs(membersQuery);
        const members = membersSnapshot.docs
          .filter(doc => doc.id !== currentUser.uid) // 自分以外
          .map(doc => {
            const data = doc.data() as UserProfile;
            return {
              id: doc.id,
              displayName: data.displayName || data.email.split('@')[0],
              email: data.email,
              hasPermission: false // 初期値
            };
          });

        // 各メンバーに対する権限をチェック
        const permissionsQuery = query(
          collection(db, 'permissions'),
          where('toUserId', '==', currentUser.uid),
          where('status', '==', 'approved')
        );
        const permissionsSnapshot = await getDocs(permissionsQuery);
        const approvedUserIds = permissionsSnapshot.docs.map(doc => 
          (doc.data() as Permission).fromUserId
        );

        // 権限情報を更新
        const updatedMembers = members.map(member => ({
          ...member,
          hasPermission: approvedUserIds.includes(member.id)
        }));

        setOrgMembers(updatedMembers);
      }
    } catch (error) {
      console.error('組織メンバー読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const handleMemberClick = (member: OrganizationMember) => {
    if (member.hasPermission) {
      // 許可済みの場合、そのユーザーのダッシュボードへ遷移
      navigate(`/user/${member.id}/dashboard`);
    } else {
      // 未許可の場合、リクエストモーダルを表示（後で実装）
      alert(`${member.displayName}さんへのアクセスリクエスト機能は開発中です`);
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

          {/* 組織メンバー一覧（一般ユーザーのみ表示） */}
          {!loading && !isAdmin() && !isOrgLeader() && orgMembers.length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <div className="px-2 text-xs font-semibold text-green-300 uppercase tracking-wider">
                  組織メンバー
                </div>
                <div className="mt-2 space-y-1">
                  {orgMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleMemberClick(member)}
                      disabled={!member.hasPermission}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-colors ${
                        member.hasPermission
                          ? 'text-green-100 hover:bg-green-700 cursor-pointer'
                          : 'text-green-400 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span className="material-icons mr-3 text-sm">
                        {member.hasPermission ? 'person' : 'lock'}
                      </span>
                      <span className="truncate">{member.displayName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </nav>

        <div className="flex-shrink-0 flex border-t border-green-700 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">
                  {userProfile?.displayName || currentUser?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-green-300">
                  {userProfile?.role === 'admin' && '管理者'}
                  {userProfile?.role === 'org_leader' && '組織リーダー'}
                  {userProfile?.role === 'user' && '一般ユーザー'}
                </p>
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
