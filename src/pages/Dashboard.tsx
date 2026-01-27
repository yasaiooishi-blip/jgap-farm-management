import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import type { WorkRecord, Field } from '../types';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFields: 0,
    activeFields: 0,
    totalArea: 0,
    monthRecords: 0
  });
  const [recentRecords, setRecentRecords] = useState<WorkRecord[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  async function loadDashboardData() {
    try {
      // 圃場データを読み込み
      const fieldsQuery = query(
        collection(db, 'fields'),
        where('userId', '==', currentUser?.uid)
      );
      const fieldsSnapshot = await getDocs(fieldsQuery);
      const fieldsData = fieldsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Field[];
      setFields(fieldsData);

      // 統計を計算
      const totalFields = fieldsData.length;
      const activeFields = fieldsData.filter(f => f.status === '栽培中').length;
      const totalArea = fieldsData.reduce((sum, f) => sum + f.area, 0);

      // 今月の作業記録を読み込み
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthStart = firstDayOfMonth.toISOString().split('T')[0];
      
      const recordsQuery = query(
        collection(db, 'workRecords'),
        where('userId', '==', currentUser?.uid),
        where('date', '>=', monthStart),
        orderBy('date', 'desc')
      );
      const recordsSnapshot = await getDocs(recordsQuery);
      const monthRecords = recordsSnapshot.size;

      // 最近の作業記録を読み込み（最大5件）
      const recentQuery = query(
        collection(db, 'workRecords'),
        where('userId', '==', currentUser?.uid),
        orderBy('date', 'desc'),
        limit(5)
      );
      const recentSnapshot = await getDocs(recentQuery);
      const recentData = recentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkRecord[];

      setStats({ totalFields, activeFields, totalArea, monthRecords });
      setRecentRecords(recentData);
    } catch (error) {
      console.error('ダッシュボードデータの読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ダッシュボード</h1>
          <p className="text-gray-600">{today}</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="material-icons text-4xl text-green-600">landscape</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">圃場数</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.totalFields}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="material-icons text-4xl text-green-600">eco</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">栽培中</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.activeFields}</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="material-icons text-4xl text-green-600">terrain</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">総面積</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.totalArea.toFixed(2)} ha</dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="material-icons text-4xl text-green-600">assignment</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">今月の記録</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.monthRecords}</dd>
                </dl>
              </div>
            </div>
          </Card>
        </div>

        {/* クイックアクション */}
        <Card title="クイックアクション">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button onClick={() => navigate('/add-work-record')} fullWidth>
              <span className="material-icons mr-2">add_circle</span>
              作業記録を追加
            </Button>
            <Button onClick={() => navigate('/fields')} variant="secondary" fullWidth>
              <span className="material-icons mr-2">landscape</span>
              圃場管理
            </Button>
          </div>
        </Card>

        {/* 最近の作業記録 */}
        <Card title="最近の作業記録">
          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : recentRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="material-icons text-6xl text-gray-300 mb-4 block">assignment</span>
              <p className="mb-4">まだ作業記録がありません</p>
              <Button onClick={() => navigate('/add-work-record')}>
                作業記録を追加
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRecords.map((record) => (
                <div
                  key={record.id}
                  className="border-l-4 border-green-500 bg-gray-50 p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-900">{record.date}</span>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {record.workType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">{record.fieldName}</span> - {record.crop}
                      </p>
                      <p className="text-sm text-gray-600">{record.workDetail}</p>
                      <p className="text-xs text-gray-500 mt-2">作業者: {record.worker}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center pt-4">
                <Button variant="secondary" onClick={() => navigate('/work-records')}>
                  すべての記録を見る
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* 圃場概要 */}
        <Card title="圃場概要">
          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="material-icons text-6xl text-gray-300 mb-4 block">landscape</span>
              <p className="mb-4">まだ圃場が登録されていません</p>
              <Button onClick={() => navigate('/fields')}>
                圃場を追加
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{field.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>作物: {field.crop}</p>
                    <p>面積: {field.area} ha</p>
                    <p>
                      状態:{' '}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        field.status === '栽培中' ? 'bg-green-100 text-green-800' :
                        field.status === '休耕' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {field.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
