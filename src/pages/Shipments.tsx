import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import type { Shipment } from '../types';

export default function Shipments() {
  const { currentUser, getAccessibleUserIds, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    destination: '',
    crop: '',
    grade: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadShipments();
    }
  }, [currentUser]);

  async function loadShipments() {
    try {
      setError('');
      // 権限に応じたデータ取得
      const accessibleUserIds = await getAccessibleUserIds();
      
      if (accessibleUserIds.length === 0) {
        setShipments([]);
        setLoading(false);
        return;
      }

      let q;
      if (accessibleUserIds.length === 1) {
        q = query(
          collection(db, 'shipments'),
          where('userId', '==', accessibleUserIds[0])
        );
      } else {
        q = query(
          collection(db, 'shipments'),
          where('userId', 'in', accessibleUserIds.slice(0, 10))
        );
      }

      const snapshot = await getDocs(q);
      const shipmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Shipment[];

      // 出荷日でソート（新しい順）
      shipmentsData.sort((a, b) => (b.shipmentDate > a.shipmentDate ? 1 : -1));
      setShipments(shipmentsData);
    } catch (error: any) {
      console.error('データの読み込みエラー:', error);
      setError('データの読み込みに失敗しました: ' + (error?.message || '不明なエラー'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('この出荷記録を削除してもよろしいですか？')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'shipments', id));
      loadShipments();
    } catch (error: any) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました: ' + (error?.message || '不明なエラー'));
    }
  }

  function handleClearFilters() {
    setFilters({
      startDate: '',
      endDate: '',
      destination: '',
      crop: '',
      grade: ''
    });
  }

  const filteredShipments = shipments.filter(shipment => {
    if (filters.startDate && shipment.shipmentDate < filters.startDate) return false;
    if (filters.endDate && shipment.shipmentDate > filters.endDate) return false;
    if (filters.destination && !shipment.destination.includes(filters.destination)) return false;
    if (filters.crop && !shipment.crop.includes(filters.crop)) return false;
    if (filters.grade && shipment.grade !== filters.grade) return false;
    return true;
  });

  // 合計出荷量と合計金額を計算
  const totalQuantity = filteredShipments.reduce((sum, s) => sum + s.quantity, 0);
  const totalAmount = filteredShipments.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case '秀': return 'bg-red-100 text-red-800';
      case '優': return 'bg-blue-100 text-blue-800';
      case '良': return 'bg-green-100 text-green-800';
      case '規格外': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="material-icons mr-2 text-blue-600">local_shipping</span>
            出荷管理
          </h1>
          <Button onClick={() => navigate('/add-shipment')}>
            <span className="material-icons mr-1 text-sm">add</span>
            新規出荷記録
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

        {/* 統計情報 */}
        {filteredShipments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">出荷件数</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredShipments.length}</p>
                </div>
                <span className="material-icons text-4xl text-blue-600">inventory</span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">総出荷量</p>
                  <p className="text-2xl font-bold text-gray-900">{totalQuantity.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">
                    {filteredShipments[0]?.unit || 'kg'}
                  </p>
                </div>
                <span className="material-icons text-4xl text-green-600">scale</span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">総売上</p>
                  <p className="text-2xl font-bold text-gray-900">¥{totalAmount.toLocaleString()}</p>
                </div>
                <span className="material-icons text-4xl text-purple-600">monetization_on</span>
              </div>
            </Card>
          </div>
        )}

        {/* 検索・フィルター */}
        <Card title="検索・フィルター">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

            <Input
              label="出荷先"
              value={filters.destination}
              onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
              placeholder="例: ○○市場"
            />

            <Input
              label="作物"
              value={filters.crop}
              onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
              placeholder="例: トマト"
            />

            <Select
              label="等級"
              value={filters.grade}
              onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
            >
              <option value="">すべて</option>
              <option value="秀">秀</option>
              <option value="優">優</option>
              <option value="良">良</option>
              <option value="規格外">規格外</option>
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

        {/* 出荷一覧 */}
        <Card title={`出荷記録 (${filteredShipments.length}件)`}>
          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : filteredShipments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="material-icons text-6xl text-gray-300 mb-4 block">local_shipping</span>
              <p>表示する出荷記録がありません</p>
              {shipments.length === 0 && (
                <p className="text-sm mt-2">「新規出荷記録」ボタンから出荷を記録してください</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      出荷日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      出荷先
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作物
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      等級・サイズ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      出荷量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      単価
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      担当者
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.shipmentDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.destination}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium text-gray-900">{shipment.crop}</div>
                          {shipment.variety && (
                            <div className="text-xs text-gray-500">{shipment.variety}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="space-y-1">
                          <span className={`px-2 py-1 text-xs rounded ${getGradeColor(shipment.grade)}`}>
                            {shipment.grade}
                          </span>
                          {shipment.size && (
                            <div className="text-xs text-gray-600">{shipment.size}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.quantity} {shipment.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.unitPrice ? `¥${shipment.unitPrice.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {shipment.totalAmount ? `¥${shipment.totalAmount.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shipment.worker}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(shipment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <span className="material-icons text-sm">delete</span>
                        </button>
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
