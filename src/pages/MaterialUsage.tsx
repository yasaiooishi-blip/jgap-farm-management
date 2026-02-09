import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

interface Material {
  id: string;
  name: string;
  type: '肥料' | '農薬' | '種子' | 'その他';
  quantity: number;
  unit: string;
}

interface Field {
  id: string;
  name: string;
  crop: string;
}

interface UsageRecord {
  id: string;
  date: string;
  materialId: string;
  materialName: string;
  materialType: string;
  fieldId: string;
  fieldName: string;
  quantity: number;
  unit: string;
  worker: string;
  weather: string;
  purpose: string;
  notes: string;
  createdAt: any;
}

export default function MaterialUsage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('すべて');
  const [filterMaterial, setFilterMaterial] = useState<string>('すべて');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    materialId: '',
    fieldId: '',
    quantity: '',
    worker: '',
    weather: '晴れ',
    purpose: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    try {
      // 資材を取得（肥料と農薬のみ）
      const materialsQuery = query(
        collection(db, 'materials'),
        where('userId', '==', currentUser.uid)
      );
      const materialsSnapshot = await getDocs(materialsQuery);
      const materialsData: Material[] = materialsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Material))
        .filter(m => m.type === '肥料' || m.type === '農薬');

      // 圃場を取得
      const fieldsQuery = query(
        collection(db, 'fields'),
        where('userId', '==', currentUser.uid)
      );
      const fieldsSnapshot = await getDocs(fieldsQuery);
      const fieldsData: Field[] = fieldsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Field));

      // 使用記録を取得
      const usageQuery = query(
        collection(db, 'materialUsage'),
        where('userId', '==', currentUser.uid)
      );
      const usageSnapshot = await getDocs(usageQuery);
      const usageData: UsageRecord[] = usageSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as UsageRecord))
        .sort((a, b) => b.date.localeCompare(a.date));

      setMaterials(materialsData);
      setFields(fieldsData);
      setUsageRecords(usageData);
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.materialId || !formData.fieldId || !formData.quantity || !formData.worker || !formData.purpose) {
      setError('すべての必須項目を入力してください');
      return;
    }

    const selectedMaterial = materials.find(m => m.id === formData.materialId);
    const selectedField = fields.find(f => f.id === formData.fieldId);

    if (!selectedMaterial || !selectedField) {
      setError('資材または圃場が見つかりません');
      return;
    }

    const usageQuantity = Number(formData.quantity);
    
    if (usageQuantity > selectedMaterial.quantity) {
      setError(`在庫が不足しています（現在の在庫: ${selectedMaterial.quantity} ${selectedMaterial.unit}）`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      // 使用記録を追加
      await addDoc(collection(db, 'materialUsage'), {
        userId: currentUser?.uid,
        date: formData.date,
        materialId: formData.materialId,
        materialName: selectedMaterial.name,
        materialType: selectedMaterial.type,
        fieldId: formData.fieldId,
        fieldName: selectedField.name,
        quantity: usageQuantity,
        unit: selectedMaterial.unit,
        worker: formData.worker,
        weather: formData.weather,
        purpose: formData.purpose,
        notes: formData.notes,
        createdAt: serverTimestamp()
      });

      // 在庫を減らす
      const materialRef = doc(db, 'materials', formData.materialId);
      await updateDoc(materialRef, {
        quantity: increment(-usageQuantity)
      });

      setShowAddModal(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        materialId: '',
        fieldId: '',
        quantity: '',
        worker: '',
        weather: '晴れ',
        purpose: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('使用記録追加エラー:', error);
      setError('使用記録の追加に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const filteredRecords = usageRecords.filter(record => {
    const matchesType = filterType === 'すべて' || record.materialType === filterType;
    const matchesMaterial = filterMaterial === 'すべて' || record.materialId === filterMaterial;
    return matchesType && matchesMaterial;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case '肥料': return 'bg-green-100 text-green-800';
      case '農薬': return 'bg-red-100 text-red-800';
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
            <span className="material-icons mr-2 text-purple-600">description</span>
            農薬・肥料使用簿
          </h1>
          <Button onClick={() => setShowAddModal(true)} disabled={materials.length === 0 || fields.length === 0}>
            <span className="material-icons mr-1 text-sm">add</span>
            使用記録を追加
          </Button>
        </div>

        {/* JGAP情報カード */}
        <Card>
          <div className="flex items-start space-x-3">
            <span className="material-icons text-green-600 text-2xl">verified</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">JGAP認証対応</h3>
              <p className="text-sm text-gray-600">
                この使用簿は、JGAP認証に必要な農薬・肥料の使用記録要件に対応しています。
                使用日、資材名、使用量、使用場所、作業者、天候を記録し、適切な管理を行います。
              </p>
            </div>
          </div>
        </Card>

        {/* フィルター */}
        <Card>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">フィルター</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  資材
                </label>
                <select
                  value={filterMaterial}
                  onChange={(e) => setFilterMaterial(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="すべて">すべて</option>
                  {materials.map(material => (
                    <option key={material.id} value={material.id}>
                      {material.name} ({material.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* 使用記録一覧 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">使用記録 ({filteredRecords.length}件)</h3>
          </div>

          {materials.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons text-6xl text-gray-300 mb-2">inventory_2</span>
              <p className="text-gray-500 mb-4">まず資材を登録してください</p>
              <Button onClick={() => navigate('/materials')}>
                資材管理へ
              </Button>
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons text-6xl text-gray-300 mb-2">landscape</span>
              <p className="text-gray-500 mb-4">まず圃場を登録してください</p>
              <Button onClick={() => navigate('/fields')}>
                圃場管理へ
              </Button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons text-6xl text-gray-300 mb-2">description</span>
              <p className="text-gray-500 mb-4">使用記録が登録されていません</p>
              <Button onClick={() => setShowAddModal(true)}>
                使用記録を追加
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      使用日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      資材名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      種別
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      圃場
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      使用量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作業者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      天候
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      目的
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.materialName}</div>
                        {record.notes && (
                          <div className="text-xs text-gray-500">{record.notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${getTypeColor(record.materialType)}`}>
                          {record.materialType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.fieldName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.quantity} {record.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.worker}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.weather}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.purpose}
                      </td>
                    </tr>
                  ))}
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
                  <h2 className="text-xl font-bold text-gray-900">使用記録を追加</h2>
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
                    label="使用日"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      資材 <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.materialId}
                      onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">選択してください</option>
                      {materials.map(material => (
                        <option key={material.id} value={material.id}>
                          {material.name} ({material.type}) - 在庫: {material.quantity} {material.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      圃場 <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.fieldId}
                      onChange={(e) => setFormData({ ...formData, fieldId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">選択してください</option>
                      {fields.map(field => (
                        <option key={field.id} value={field.id}>
                          {field.name} ({field.crop})
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="使用量"
                    type="number"
                    step="0.1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="10"
                  />

                  <Input
                    label="作業者"
                    required
                    value={formData.worker}
                    onChange={(e) => setFormData({ ...formData, worker: e.target.value })}
                    placeholder="田中太郎"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      天候 <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.weather}
                      onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="晴れ">晴れ</option>
                      <option value="曇り">曇り</option>
                      <option value="雨">雨</option>
                      <option value="雪">雪</option>
                    </select>
                  </div>

                  <Input
                    label="使用目的"
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="例: 害虫駆除、追肥など"
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
