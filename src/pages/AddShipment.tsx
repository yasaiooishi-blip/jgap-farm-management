import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import type { Field, Shipment } from '../types';

export default function AddShipment() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [formData, setFormData] = useState({
    shipmentDate: new Date().toISOString().split('T')[0],
    destination: '',
    fieldId: '',
    crop: '',
    variety: '',
    grade: '優' as Shipment['grade'],
    size: 'M' as Shipment['size'],
    quantity: '',
    unit: 'kg',
    unitPrice: '',
    worker: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadFields();
    }
  }, [currentUser]);

  async function loadFields() {
    try {
      const q = query(
        collection(db, 'fields'),
        where('userId', '==', currentUser?.uid)
      );
      const querySnapshot = await getDocs(q);
      const fieldsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Field[];
      setFields(fieldsData);
    } catch (error: any) {
      console.error('圃場の読み込みエラー:', error);
      setError('圃場データの読み込みに失敗しました: ' + (error?.message || '不明なエラー'));
    }
  }

  // 圃場選択時に作物名を自動入力
  function handleFieldChange(fieldId: string) {
    const selectedField = fields.find(f => f.id === fieldId);
    setFormData({
      ...formData,
      fieldId,
      crop: selectedField?.crop || ''
    });
  }

  // 金額を自動計算
  function calculateTotalAmount(): number {
    const quantity = Number(formData.quantity);
    const unitPrice = Number(formData.unitPrice);
    if (quantity && unitPrice) {
      return quantity * unitPrice;
    }
    return 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!formData.shipmentDate || !formData.destination || !formData.crop || !formData.quantity || !formData.worker) {
      setError('すべての必須項目を入力してください');
      return;
    }

    try {
      setLoading(true);

      const selectedField = fields.find(f => f.id === formData.fieldId);
      const totalAmount = calculateTotalAmount();

      // 出荷記録を追加
      await addDoc(collection(db, 'shipments'), {
        userId: currentUser?.uid,
        shipmentDate: formData.shipmentDate,
        destination: formData.destination,
        fieldId: formData.fieldId || null,
        fieldName: selectedField?.name || null,
        crop: formData.crop,
        variety: formData.variety || null,
        grade: formData.grade,
        size: formData.size || null,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        unitPrice: formData.unitPrice ? Number(formData.unitPrice) : null,
        totalAmount: totalAmount || null,
        worker: formData.worker,
        notes: formData.notes || null,
        createdAt: serverTimestamp()
      });

      navigate('/shipments');
    } catch (error: any) {
      console.error('保存エラー:', error);
      setError('保存に失敗しました: ' + (error?.message || '不明なエラー'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="material-icons text-blue-600 mr-2">local_shipping</span>
          出荷記録追加
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 基本情報 */}
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <span className="material-icons text-blue-600 mr-2 text-sm">info</span>
              基本情報
            </h3>

            <Input
              label="出荷日"
              type="date"
              required
              value={formData.shipmentDate}
              onChange={(e) => setFormData({ ...formData, shipmentDate: e.target.value })}
            />

            <Input
              label="出荷先"
              required
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="例: ○○市場、○○スーパー"
            />

            <Select
              label="圃場（任意）"
              value={formData.fieldId}
              onChange={(e) => handleFieldChange(e.target.value)}
            >
              <option value="">選択してください</option>
              {fields.map(field => (
                <option key={field.id} value={field.id}>
                  {field.name} ({field.crop})
                </option>
              ))}
            </Select>

            <Input
              label="担当者"
              required
              value={formData.worker}
              onChange={(e) => setFormData({ ...formData, worker: e.target.value })}
              placeholder="例: 田中太郎"
            />
          </div>

          {/* 商品情報 */}
          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <span className="material-icons text-green-600 mr-2 text-sm">inventory</span>
              商品情報
            </h3>

            <Input
              label="作物名"
              required
              value={formData.crop}
              onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
              placeholder="例: トマト"
            />

            <Input
              label="品種"
              value={formData.variety}
              onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
              placeholder="例: 桃太郎"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="等級"
                required
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value as Shipment['grade'] })}
              >
                <option value="秀">秀</option>
                <option value="優">優</option>
                <option value="良">良</option>
                <option value="規格外">規格外</option>
                <option value="その他">その他</option>
              </Select>

              <Select
                label="サイズ"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value as Shipment['size'] })}
              >
                <option value="3L">3L</option>
                <option value="2L">2L</option>
                <option value="L">L</option>
                <option value="M">M</option>
                <option value="S">S</option>
                <option value="その他">その他</option>
              </Select>
            </div>
          </div>

          {/* 数量・金額情報 */}
          <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <span className="material-icons text-purple-600 mr-2 text-sm">monetization_on</span>
              数量・金額
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="出荷量"
                type="number"
                step="0.1"
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
                placeholder="kg, 箱, ケースなど"
              />
            </div>

            <Input
              label="単価（円）"
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              placeholder="500"
            />

            {formData.quantity && formData.unitPrice && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">合計金額</span>
                  <span className="text-lg font-bold text-blue-600">
                    ¥{calculateTotalAmount().toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 備考 */}
          <Textarea
            label="備考"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="出荷に関する特記事項など"
            rows={3}
          />

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? '保存中...' : '保存'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/shipments')}
              className="flex-1"
            >
              キャンセル
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}
