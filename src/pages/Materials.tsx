import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import type { UserProfile, Organization } from '../types';

interface Material {
  id: string;
  name: string;
  type: '肥料' | '農薬' | '種子' | 'その他';
  quantity: number;
  unit: string;
  minimumStock: number;
  supplier: string;
  storageLocation: string; // 保管場所
  lastPurchaseDate: string;
  costPerUnit: number;
  notes: string;
  userId?: string;
}

interface MaterialWithOwner extends Material {
  ownerName?: string;
  organizationName?: string;
}

export default function Materials() {
  const { currentUser, getAccessibleUserIds, isAdmin } = useAuth();
  const [materials, setMaterials] = useState<MaterialWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('すべて');
  const [filterOrganization, setFilterOrganization] = useState<string>('すべて');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '肥料' as '肥料' | '農薬' | '種子' | 'その他',
    quantity: '',
    unit: 'kg',
    minimumStock: '',
    supplier: '',
    storageLocation: '', // 保管場所
    lastPurchaseDate: new Date().toISOString().split('T')[0],
    costPerUnit: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, [currentUser]);

  const loadMaterials = async () => {
    if (!currentUser) return;

    try {
      // 権限に応じたデータ取得
      const accessibleUserIds = await getAccessibleUserIds();
      
      if (accessibleUserIds.length === 0) {
        setMaterials([]);
        setLoading(false);
        return;
      }

      let q;
      if (accessibleUserIds.length === 1) {
        q = query(
          collection(db, 'materials'),
          where('userId', '==', accessibleUserIds[0])
        );
      } else {
        q = query(
          collection(db, 'materials'),
          where('userId', 'in', accessibleUserIds.slice(0, 10))
        );
      }

      const snapshot = await getDocs(q);
      const materialsData: Material[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Material));

      // ユーザー情報と組織情報を取得
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersMap = new Map<string, UserProfile>();
      usersSnapshot.docs.forEach(doc => {
        usersMap.set(doc.id, doc.data() as UserProfile);
      });

      const orgsSnapshot = await getDocs(collection(db, 'organizations'));
      const orgsMap = new Map<string, Organization>();
      orgsSnapshot.docs.forEach(doc => {
        orgsMap.set(doc.id, { id: doc.id, ...doc.data() } as Organization);
      });
      setOrganizations(Array.from(orgsMap.values()));

      // 資材データに所有者情報を追加
      const materialsWithOwner: MaterialWithOwner[] = materialsData.map(material => {
        const user = material.userId ? usersMap.get(material.userId) : null;
        const org = user?.organizationId ? orgsMap.get(user.organizationId) : null;
        return {
          ...material,
          ownerName: user?.displayName || user?.email?.split('@')[0] || '不明',
          organizationName: org?.name || '未所属'
        };
      });

      setMaterials(materialsWithOwner);
    } catch (error) {
      console.error('資材読み込みエラー:', error);
      setError('資材の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.quantity || !formData.minimumStock || !formData.supplier || !formData.storageLocation || !formData.costPerUnit) {
      setError('すべての必須項目を入力してください');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await addDoc(collection(db, 'materials'), {
        userId: currentUser?.uid,
        name: formData.name,
        type: formData.type,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        minimumStock: Number(formData.minimumStock),
        supplier: formData.supplier,
        storageLocation: formData.storageLocation,
        lastPurchaseDate: formData.lastPurchaseDate,
        costPerUnit: Number(formData.costPerUnit),
        notes: formData.notes,
        createdAt: serverTimestamp()
      });

      setShowAddModal(false);
      setFormData({
        name: '',
        type: '肥料',
        quantity: '',
        unit: 'kg',
        minimumStock: '',
        supplier: '',
        storageLocation: '',
        lastPurchaseDate: new Date().toISOString().split('T')[0],
        costPerUnit: '',
        notes: ''
      });
      loadMaterials();
    } catch (error) {
      console.error('資材登録エラー:', error);
      setError('資材の登録に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この資材を削除してもよろしいですか？')) return;

    try {
      await deleteDoc(doc(db, 'materials', id));
      loadMaterials();
    } catch (error) {
      console.error('資材削除エラー:', error);
      alert('資材の削除に失敗しました');
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.storageLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'すべて' || material.type === filterType;
    const matchesOrganization = filterOrganization === 'すべて' || material.organizationName === filterOrganization;
    return matchesSearch && matchesType && matchesOrganization;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('すべて');
    setFilterOrganization('すべて');
  };

  const getStockStatus = (quantity: number, minimumStock: number) => {
    if (quantity === 0) return { label: '在庫切れ', color: 'bg-red-100 text-red-800 border-red-300' };
    if (quantity <= minimumStock) return { label: '要発注', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    return { label: '適正', color: 'bg-green-100 text-green-800 border-green-300' };
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '肥料': return 'bg-green-100 text-green-800';
      case '農薬': return 'bg-red-100 text-red-800';
      case '種子': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="material-icons mr-2 text-purple-600">inventory_2</span>
            資材管理
          </h1>
          <Button onClick={() => setShowAddModal(true)}>
            <span className="material-icons mr-1 text-sm">add</span>
            新規資材登録
          </Button>
        </div>

        {/* 検索・フィルター */}
        <Card title="検索・フィルター">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="資材名・仕入先・保管場所で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="例: 化成肥料、農協、倉庫A"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                種別
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="すべて">すべて</option>
                <option value="肥料">肥料</option>
                <option value="農薬">農薬</option>
                <option value="種子">種子</option>
                <option value="その他">その他</option>
              </select>
            </div>

            {isAdmin() && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  組織
                </label>
                <select
                  value={filterOrganization}
                  onChange={(e) => setFilterOrganization(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="すべて">すべて</option>
                  <option value="未所属">未所属</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.name}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-4">
            <Button variant="secondary" onClick={handleClearFilters}>
              <span className="material-icons mr-1 text-sm">clear</span>
              フィルタークリア
            </Button>
          </div>
        </Card>

        {/* 資材一覧 */}
        <Card title={`資材一覧 (${filteredMaterials.length}件)`}>
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons text-6xl text-gray-300 mb-2">inventory_2</span>
              <p className="text-gray-500">表示する資材がありません</p>
              {materials.length === 0 && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4"
                >
                  資材を登録
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      資材名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      種別
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      在庫数量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      保管場所
                    </th>
                    {isAdmin() && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        所有者
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      仕入先
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      単価
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMaterials.map((material) => {
                    const status = getStockStatus(material.quantity, material.minimumStock);
                    return (
                      <tr key={material.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{material.name}</div>
                          {material.notes && (
                            <div className="text-sm text-gray-500">{material.notes}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${getTypeColor(material.type)}`}>
                            {material.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {material.quantity} {material.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            最低在庫: {material.minimumStock} {material.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded border ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {material.storageLocation || '未設定'}
                        </td>
                        {isAdmin() && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <div className="font-medium text-gray-900">{material.ownerName}</div>
                              <div className="text-xs text-gray-500">{material.organizationName}</div>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {material.supplier}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{material.costPerUnit.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDelete(material.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <span className="material-icons text-lg">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* 追加モーダル */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">新規資材登録</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="資材名"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例: 有機肥料A"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      種別 <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="肥料">肥料</option>
                      <option value="農薬">農薬</option>
                      <option value="種子">種子</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="在庫数量"
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="100"
                    />
                    <Input
                      label="単位"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="kg, L, 袋など"
                    />
                  </div>

                  <Input
                    label="最低在庫量"
                    type="number"
                    required
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                    placeholder="20"
                  />

                  <Input
                    label="仕入先"
                    required
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="例: ○○農業資材店"
                  />

                  <Input
                    label="保管場所"
                    required
                    value={formData.storageLocation}
                    onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                    placeholder="例: 倉庫A、冷蔵庫、資材室など"
                  />

                  <Input
                    label="単価（円）"
                    type="number"
                    required
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                    placeholder="1500"
                  />

                  <Input
                    label="最終購入日"
                    type="date"
                    required
                    value={formData.lastPurchaseDate}
                    onChange={(e) => setFormData({ ...formData, lastPurchaseDate: e.target.value })}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      備考
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="その他メモ"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1"
                    >
                      {saving ? '保存中...' : '保存'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1"
                    >
                      キャンセル
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
