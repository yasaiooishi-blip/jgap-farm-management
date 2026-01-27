import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import type { Field, WorkRecord } from '../types';

export default function AddWorkRecord() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    fieldId: '',
    workType: '施肥' as WorkRecord['workType'],
    workDetail: '',
    worker: ''
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
    } catch (error) {
      console.error('圃場の読み込みエラー:', error);
      setError('圃場データの読み込みに失敗しました');
    }
  }

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

    try {
      setLoading(true);
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
      navigate('/work-records');
    } catch (error) {
      console.error('作業記録の保存エラー:', error);
      setError('作業記録の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="material-icons mr-2 text-green-600">assignment</span>
            作業記録追加
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <span className="material-icons mr-2">error</span>
            {error}
          </div>
        )}

        {fields.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <span className="material-icons text-6xl text-gray-300 mb-4 block">landscape</span>
              <p className="text-gray-600 mb-4">作業記録を追加するには、まず圃場を登録してください</p>
              <Button onClick={() => navigate('/fields')}>
                圃場管理へ
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit}>
              <Input
                type="date"
                label="作業日"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />

              <Select
                label="圃場"
                value={formData.fieldId}
                onChange={(e) => setFormData({ ...formData, fieldId: e.target.value })}
                required
              >
                <option value="">圃場を選択してください</option>
                {fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name} ({field.crop})
                  </option>
                ))}
              </Select>

              <Select
                label="作業種別"
                value={formData.workType}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value as WorkRecord['workType'] })}
                required
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

              <Textarea
                label="作業内容詳細"
                value={formData.workDetail}
                onChange={(e) => setFormData({ ...formData, workDetail: e.target.value })}
                placeholder="実施した作業の詳細を記入してください"
                required
              />

              <Input
                label="作業者名"
                value={formData.worker}
                onChange={(e) => setFormData({ ...formData, worker: e.target.value })}
                placeholder="例: 田中太郎"
                required
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? '保存中...' : '保存'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/work-records')}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </Layout>
  );
}
