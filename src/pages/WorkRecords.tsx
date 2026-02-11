import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import type { WorkRecord, Field } from '../types';

export default function WorkRecords() {
  const { currentUser, getAccessibleUserIds } = useAuth();
  const navigate = useNavigate();
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    fieldId: '',
    workType: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  async function loadData() {
    try {
      setError('');
      // 権限に応じたデータ取得
      const accessibleUserIds = await getAccessibleUserIds();
      
      if (accessibleUserIds.length === 0) {
        setFields([]);
        setWorkRecords([]);
        setLoading(false);
        return;
      }

      // 圃場を読み込み
      let fieldsQuery;
      if (accessibleUserIds.length === 1) {
        fieldsQuery = query(
          collection(db, 'fields'),
          where('userId', '==', accessibleUserIds[0])
        );
      } else {
        fieldsQuery = query(
          collection(db, 'fields'),
          where('userId', 'in', accessibleUserIds.slice(0, 10))
        );
      }
      const fieldsSnapshot = await getDocs(fieldsQuery);
      const fieldsData = fieldsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Field[];
      setFields(fieldsData);

      // 作業記録を読み込み（orderByを削除してインデックス不要に）
      let recordsQuery;
      if (accessibleUserIds.length === 1) {
        recordsQuery = query(
          collection(db, 'workRecords'),
          where('userId', '==', accessibleUserIds[0])
        );
      } else {
        recordsQuery = query(
          collection(db, 'workRecords'),
          where('userId', 'in', accessibleUserIds.slice(0, 10))
        );
      }
      const recordsSnapshot = await getDocs(recordsQuery);
      const recordsData = recordsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as WorkRecord[];
      // クライアント側で日付順にソート
      recordsData.sort((a, b) => (b.date > a.date ? 1 : -1));
      setWorkRecords(recordsData);
    } catch (error: any) {
      console.error('データの読み込みエラー:', error);
      // Firestoreインデックスエラーの場合
      if (error?.message?.includes('index')) {
        setError('データベースのインデックスを作成中です。Firebase Consoleでインデックスを作成してください。');
      } else {
        setError('データの読み込みに失敗しました: ' + (error?.message || '不明なエラー'));
      }
    } finally {
      setLoading(false);
    }
  }

  function handleClearFilters() {
    setFilters({
      startDate: '',
      endDate: '',
      fieldId: '',
      workType: ''
    });
  }

  const filteredRecords = workRecords.filter(record => {
    if (filters.startDate && record.date < filters.startDate) return false;
    if (filters.endDate && record.date > filters.endDate) return false;
    if (filters.fieldId && record.fieldId !== filters.fieldId) return false;
    if (filters.workType && record.workType !== filters.workType) return false;
    return true;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="material-icons mr-2 text-green-600">assignment</span>
            作業記録一覧
          </h1>
          <Button onClick={() => navigate('/add-work-record')}>
            <span className="material-icons mr-1 text-sm">add</span>
            新規作業記録
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <span className="material-icons mr-2">error</span>
            <div>
              <p className="font-semibold">エラー</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <Card title="検索・フィルター">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              type="date"
              label="開始日"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />

            <Input
              type="date"
              label="終了日"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />

            <Select
              label="圃場"
              value={filters.fieldId}
              onChange={(e) => setFilters({ ...filters, fieldId: e.target.value })}
            >
              <option value="">すべて</option>
              {fields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name}
                </option>
              ))}
            </Select>

            <Select
              label="作業種別"
              value={filters.workType}
              onChange={(e) => setFilters({ ...filters, workType: e.target.value })}
            >
              <option value="">すべて</option>
              <option value="施肥">施肥</option>
              <option value="除草">除草</option>
              <option value="収穫">収穫</option>
              <option value="農薬散布">農薬散布</option>
              <option value="播種">播種</option>
              <option value="定植">定植</option>
              <option value="整地">整地</option>
              <option value="その他">その他</option>
            </Select>
          </div>

          <div className="mt-4">
            <Button variant="secondary" onClick={handleClearFilters}>
              <span className="material-icons mr-1 text-sm">clear</span>
              フィルタークリア
            </Button>
          </div>
        </Card>

        <Card title={`作業記録 (${filteredRecords.length}件)`}>
          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="material-icons text-6xl text-gray-300 mb-4 block">assignment</span>
              <p>表示する作業記録がありません</p>
              {workRecords.length === 0 && (
                <p className="text-sm mt-2">「新規作業記録」ボタンから作業を記録してください</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作業日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作業時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      圃場
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作物
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作業種別
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      数量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作業者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作業内容
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.startTime && record.endTime ? (
                          <div>
                            <div>{record.startTime} - {record.endTime}</div>
                            {record.workHours && (
                              <div className="text-xs text-gray-400">
                                ({record.workHours.toFixed(1)}時間)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.fieldName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.crop}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {record.workType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.quantity && record.unit ? (
                          <span>{record.quantity} {record.unit}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.worker}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate" title={record.workDetail}>
                          {record.workDetail}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
