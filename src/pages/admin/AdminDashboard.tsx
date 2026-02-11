import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import type { Organization, UserProfile } from '../../types';

export default function AdminDashboard() {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalAdmins: 0,
    totalLeaders: 0,
    unassignedUsers: 0
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  const loadData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users: UserProfile[] = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as UserProfile));

      const orgsSnapshot = await getDocs(collection(db, 'organizations'));
      const orgsData: Organization[] = orgsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Organization));

      setOrganizations(orgsData);

      setStats({
        totalUsers: users.length,
        totalOrganizations: orgsData.length,
        totalAdmins: users.filter(u => u.role === 'admin').length,
        totalLeaders: users.filter(u => u.role === 'org_leader').length,
        unassignedUsers: users.filter(u => !u.organizationId || u.organizationId === '').length
      });
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            管理者ダッシュボード
          </h1>
          <p className="text-gray-600">
            こんにちは、{userProfile?.displayName || currentUser?.email?.split('@')[0]}さん（管理者）
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <span className="material-icons text-blue-600 text-3xl">people</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">組織数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrganizations}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <span className="material-icons text-green-600 text-3xl">corporate_fare</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">管理者</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAdmins}</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <span className="material-icons text-red-600 text-3xl">admin_panel_settings</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">リーダー</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLeaders}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <span className="material-icons text-purple-600 text-3xl">star</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">未所属</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.unassignedUsers}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <span className="material-icons text-yellow-600 text-3xl">person_outline</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">管理メニュー</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/organizations')}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-6 text-left transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              <span className="material-icons text-4xl mb-3">corporate_fare</span>
              <h3 className="font-semibold text-lg mb-1">組織管理</h3>
              <p className="text-sm opacity-90">組織の作成・編集・削除</p>
            </button>

            <button
              onClick={() => navigate('/admin/users')}
              className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-6 text-left transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              <span className="material-icons text-4xl mb-3">people</span>
              <h3 className="font-semibold text-lg mb-1">ユーザー管理</h3>
              <p className="text-sm opacity-90">組織への振り分け・ロール変更</p>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-6 text-left transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              <span className="material-icons text-4xl mb-3">dashboard</span>
              <h3 className="font-semibold text-lg mb-1">通常ダッシュボード</h3>
              <p className="text-sm opacity-90">通常の管理画面へ</p>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-6 text-left transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              <span className="material-icons text-4xl mb-3">assessment</span>
              <h3 className="font-semibold text-lg mb-1">レポート</h3>
              <p className="text-sm opacity-90">全体のレポート確認</p>
            </button>
          </div>
        </div>

        {/* Organizations List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">組織一覧</h3>
            <Button onClick={() => navigate('/admin/organizations')} size="sm">
              すべて見る
            </Button>
          </div>

          {organizations.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons text-6xl text-gray-300 mb-2">corporate_fare</span>
              <p className="text-gray-500">組織が登録されていません</p>
              <Button onClick={() => navigate('/admin/organizations')} className="mt-4">
                組織を作成
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {organizations.slice(0, 5).map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/admin/organizations/${org.id}`)}
                >
                  <div className="flex items-center">
                    <span className="material-icons text-blue-600 mr-3">corporate_fare</span>
                    <div>
                      <p className="font-medium text-gray-900">{org.name}</p>
                      <p className="text-sm text-gray-500">
                        メンバー: {org.memberIds?.length || 0}人
                      </p>
                    </div>
                  </div>
                  <span className="material-icons text-gray-400">chevron_right</span>
                </div>
              ))}
              {organizations.length > 5 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  ...他 {organizations.length - 5}組織
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
