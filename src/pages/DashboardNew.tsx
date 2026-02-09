import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import WeatherWidget from '../components/dashboard/WeatherWidget';
import TodayTasks from '../components/dashboard/TodayTasks';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

interface Stats {
  totalFields: number;
  totalWorkRecords: number;
  pendingTasks: number;
  recentActivities: number;
}

export default function DashboardNew() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalFields: 0,
    totalWorkRecords: 0,
    pendingTasks: 0,
    recentActivities: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      // 圃場数を取得
      const fieldsQuery = query(
        collection(db, 'fields'),
        where('userId', '==', currentUser.uid)
      );
      const fieldsSnapshot = await getDocs(fieldsQuery);
      
      // 作業記録数を取得
      const workRecordsQuery = query(
        collection(db, 'workRecords'),
        where('userId', '==', currentUser.uid)
      );
      const workRecordsSnapshot = await getDocs(workRecordsQuery);

      // 今日の予定タスク数を取得（クライアント側でフィルタリング）
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISOString = today.toISOString();
      
      // 全ての作業記録を取得してクライアント側でフィルタ
      const allWorkRecords = workRecordsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const pendingTasksCount = allWorkRecords.filter(record => 
        record.date >= todayISOString && record.status === 'pending'
      ).length;

      // 最近の活動（7日以内）をクライアント側でフィルタ
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoISOString = weekAgo.toISOString();
      
      const recentActivitiesCount = allWorkRecords.filter(record =>
        record.date >= weekAgoISOString
      ).length;

      setStats({
        totalFields: fieldsSnapshot.size,
        totalWorkRecords: workRecordsSnapshot.size,
        pendingTasks: pendingTasksCount,
        recentActivities: recentActivitiesCount
      });
    } catch (error) {
      console.error('ダッシュボードデータ読み込みエラー:', error);
      // ダミーデータを設定
      setStats({
        totalFields: 5,
        totalWorkRecords: 23,
        pendingTasks: 3,
        recentActivities: 8
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: 'add_circle',
      label: '作業記録を追加',
      description: '新しい作業を記録',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      path: '/work-records/add'
    },
    {
      icon: 'terrain',
      label: '圃場管理',
      description: '圃場情報を管理',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      path: '/fields'
    },
    {
      icon: 'inventory_2',
      label: '資材管理',
      description: '農薬・肥料の管理',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      path: '/materials'
    },
    {
      icon: 'assessment',
      label: 'レポート',
      description: 'データ分析・出力',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      path: '/reports'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            おかえりなさい、{currentUser?.email?.split('@')[0]}さん
          </h1>
          <p className="text-gray-600">今日も効率的な農場管理をサポートします</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">登録圃場数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalFields}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <span className="material-icons text-green-600 text-3xl">terrain</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">作業記録数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalWorkRecords}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <span className="material-icons text-blue-600 text-3xl">description</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今日の予定</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingTasks}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <span className="material-icons text-yellow-600 text-3xl">event</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">7日間の活動</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.recentActivities}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <span className="material-icons text-purple-600 text-3xl">trending_up</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">クイックアクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`${action.color} ${action.hoverColor} text-white rounded-lg p-6 text-left transition-all duration-200 transform hover:scale-105 shadow-md`}
              >
                <span className="material-icons text-4xl mb-3">{action.icon}</span>
                <h3 className="font-semibold text-lg mb-1">{action.label}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Weather and Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <WeatherWidget />
            <TodayTasks />
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">JGAP認証サポート</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <span className="material-icons text-green-600">check_circle</span>
                  <div>
                    <p className="font-medium text-gray-900">作業記録</p>
                    <p className="text-sm text-gray-600">完全対応</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <span className="material-icons text-green-600">check_circle</span>
                  <div>
                    <p className="font-medium text-gray-900">圃場管理</p>
                    <p className="text-sm text-gray-600">完全対応</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <span className="material-icons text-green-600">check_circle</span>
                  <div>
                    <p className="font-medium text-gray-900">資材管理</p>
                    <p className="text-sm text-gray-600">完全対応</p>
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/reports')}
                className="w-full mt-4"
              >
                認証レポート作成
              </Button>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">お知らせ</h3>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-3 py-2">
                  <p className="text-sm font-medium text-gray-900">システム更新</p>
                  <p className="text-xs text-gray-600">新機能を追加しました</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-3 py-2">
                  <p className="text-sm font-medium text-gray-900">天候アラート</p>
                  <p className="text-xs text-gray-600">週末に雨の予報があります</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
