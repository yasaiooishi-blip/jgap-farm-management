import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, serverTimestamp, query, where, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import type { Field, WorkRecord } from '../types';

interface Material {
  id: string;
  name: string;
  type: '肥料' | '農薬' | '種子' | 'その他';
  quantity: number;
  unit: string;
}

export default function AddWorkRecord() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    fieldId: '',
    workType: '施肥' as WorkRecord['workType'],
    workDetail: '',
    worker: '',
    // 農薬・肥料使用の追加項目
    useMaterial: false,
    materialId: '',
    materialQuantity: '',
    materialPurpose: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadFields();
      loadMaterials();
    }
  }, [currentUser]);

  // 作業種別が変更されたら、自動的に資材使用フラグを更新
  useEffect(() => {
    if (formData.workType === '施肥' || formData.workType === '農薬散布') {
      setFormData(prev => ({ ...prev, useMaterial: true }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        useMaterial: false,
        materialId: '',
        materialQuantity: '',
        materialPurpose: ''
      }));
    }
  }, [formData.workType]);

  async function loadFields() {
    try {
      const querySnapshot = await getDocs(collection(db, 'fields'));
      const fieldsData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(field => field.userId === currentUser?.uid) as Field[];
      setFields(fieldsData);
    } catch (error: any) {
      console.error('圃場の読み込みエラー:', error);
      setError('圃場データの読み込みに失敗しました: ' + (error?.message || '不明なエラー'));
    }
  }

  async function loadMaterials() {
    try {
      const q = query(
        collection(db, 'materials'),
        where('userId', '==', currentUser?.uid)
      );
      const snapshot = await getDocs(q);
      const materialsData: Material[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Material));
      setMaterials(materialsData);
    } catch (error: any) {
      console.error('資材の読み込みエラー:', error);
    }
  }

  // 作業種別に応じて表示する資材をフィルター
  const getFilteredMaterials = () => {
    if (formData.workType === '施肥') {
      return materials.filter(m => m.type === '肥料');
    } else if (formData.workType === '農薬散布') {
      return materials.filter(m => m.type === '農薬');
    }
    return [];
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!formData.date || !formData.fieldId || !formData.workType || !formData.workDetail || !formData.worker) {
      setError('すべての必須項目を入力してください');
      return;
    }

    const selectedField = fields.find(f => f.id === formData.fieldId);
    if (!selectedField) {
      setError('圃場を選択してください');
      return;
    }

    // 資材使用がある場合のバリデーション
    if (formData.useMaterial && (formData.workType === '施肥' || formData.workType === '農薬散布')) {
      if (!formData.materialId || !formData.materialQuantity || !formData.materialPurpose) {
        setError('資材情報をすべて入力してください');
        return;
      }

      const selectedMaterial = materials.find(m => m.id === formData.materialId);
      if (!selectedMaterial) {
        setError('資材を選択してください');
        return;
      }

      const usageQuantity = Number(formData.materialQuantity);
      if (usageQuantity > selectedMaterial.quantity) {
        setError(`在庫が不足しています（現在の在庫: ${selectedMaterial.quantity} ${selectedMaterial.unit}）`);
        return;
      }
    }

    try {
      setLoading(true);

      // 作業記録を追加
      await addDoc(collection(db, 'workRecords'), {
        userId: currentUser?.uid,
        date: formData.date,
        fieldId: formData.fieldId,
        fieldName: selectedField.name,
        crop: selectedField.crop,
        workType: formData.workType,
        workDetail: formData.workDetail,
        worker: formData.worker,
        createdAt: serverTimestamp()
      });

      // 資材使用がある場合は、農薬・肥料使用簿にも記録
      if (formData.useMaterial && formData.materialId && formData.materialQuantity) {
        const selectedMaterial = materials.find(m => m.id === formData.materialId);
        if (selectedMaterial) {
          // 使用記録を追加
          await addDoc(collection(db, 'materialUsage'), {
            userId: currentUser?.uid,
            date: formData.date,
            materialId: formData.materialId,
            materialName: selectedMaterial.name,
            materialType: selectedMaterial.type,
            fieldId: formData.fieldId,
            fieldName: selectedField.name,
            quantity: Number(formData.materialQuantity),
            unit: selectedMaterial.unit,
            worker: formData.worker,
            weather: '記録なし', // 作業記録からの登録の場合
            purpose: formData.materialPurpose,
            notes: formData.workDetail,
            createdAt: serverTimestamp()
          });

          // 在庫を減らす
          const materialRef = doc(db, 'materials', formData.materialId);
          await updateDoc(materialRef, {
            quantity: increment(-Number(formData.materialQuantity))
          });
        }
      }

      navigate('/work-records');
    } catch (error: any) {
      console.error('保存エラー:', error);
      setError('保存に失敗しました: ' + (error?.message || '不明なエラー'));
    } finally {
      setLoading(false);
    }
  }

  if (fields.length === 0) {
    return (
      <Layout>
        <Card>
          <div className="text-center py-12">
            <span className="material-icons text-6xl text-gray-300 mb-2">landscape</span>
            <p className="text-gray-500 mb-4">圃場を登録してください</p>
            <Button onClick={() => navigate('/fields')}>
              圃場管理へ
            </Button>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="material-icons text-green-600 mr-2">add_circle</span>
          作業記録追加
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="作業日"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />

          <Select
            label="圃場"
            required
            value={formData.fieldId}
            onChange={(e) => setFormData({ ...formData, fieldId: e.target.value })}
          >
            <option value="">選択してください</option>
            {fields.map(field => (
              <option key={field.id} value={field.id}>
                {field.name} ({field.crop})
              </option>
            ))}
          </Select>

          <Select
            label="作業種別"
            required
            value={formData.workType}
            onChange={(e) => setFormData({ ...formData, workType: e.target.value as WorkRecord['workType'] })}
          >
            <option value="施肥">施肥</option>
            <option value="除草">除草</option>
            <option value="収穫">収穫</option>
            <option value="農薬散布">農薬散布</option>
            <option value="播種">播種</option>
            <option value="定植">定植</option>
            <option value="整地">整地</option>
            <option value="その他">その他</option>
          </Select>

          {/* 施肥または農薬散布の場合、資材使用入力欄を表示 */}
          {formData.useMaterial && (formData.workType === '施肥' || formData.workType === '農薬散布') && (
            <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded space-y-4">
              <div className="flex items-center mb-2">
                <span className="material-icons text-purple-600 mr-2">inventory_2</span>
                <h3 className="font-semibold text-gray-900">
                  {formData.workType === '施肥' ? '肥料使用情報' : '農薬使用情報'}
                </h3>
              </div>
              
              <Select
                label={formData.workType === '施肥' ? '使用する肥料' : '使用する農薬'}
                required
                value={formData.materialId}
                onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
              >
                <option value="">選択してください</option>
                {getFilteredMaterials().map(material => (
                  <option key={material.id} value={material.id}>
                    {material.name} (在庫: {material.quantity} {material.unit})
                  </option>
                ))}
              </Select>

              {getFilteredMaterials().length === 0 && (
                <p className="text-sm text-gray-600">
                  {formData.workType === '施肥' ? '肥料' : '農薬'}が登録されていません。
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/materials')}
                    className="ml-2"
                  >
                    資材管理へ
                  </Button>
                </p>
              )}

              <Input
                label="使用量"
                type="number"
                step="0.1"
                required
                value={formData.materialQuantity}
                onChange={(e) => setFormData({ ...formData, materialQuantity: e.target.value })}
                placeholder="10"
              />

              <Input
                label="使用目的"
                required
                value={formData.materialPurpose}
                onChange={(e) => setFormData({ ...formData, materialPurpose: e.target.value })}
                placeholder="例: 追肥、害虫駆除など"
              />

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="flex items-start">
                  <span className="material-icons text-blue-600 mr-2 text-sm">info</span>
                  <p className="text-xs text-gray-700">
                    この作業記録を保存すると、自動的に農薬・肥料使用簿にも記録され、在庫から引き落とされます。
                  </p>
                </div>
              </div>
            </div>
          )}

          <Textarea
            label="作業内容"
            required
            value={formData.workDetail}
            onChange={(e) => setFormData({ ...formData, workDetail: e.target.value })}
            placeholder="実施した作業の詳細を記入してください"
            rows={4}
          />

          <Input
            label="作業者"
            required
            value={formData.worker}
            onChange={(e) => setFormData({ ...formData, worker: e.target.value })}
            placeholder="例: 田中太郎"
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
              onClick={() => navigate('/work-records')}
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
