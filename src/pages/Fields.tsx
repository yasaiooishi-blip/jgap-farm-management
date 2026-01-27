import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { Field } from '../types';

export default function Fields() {
  const { currentUser } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    crop: '',
    status: '栽培中' as Field['status']
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Field[];
      setFields(fieldsData);
    } catch (error) {
      console.error('圃場の読み込みエラー:', error);
      setError('圃場データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(field: Field) {
    setEditingField(field);
    setFormData({
      name: field.name,
      area: field.area.toString(),
      crop: field.crop,
      status: field.status
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  }

  function handleCancelEdit() {
    setEditingField(null);
    setFormData({ name: '', area: '', crop: '', status: '栽培中' });
    setShowForm(false);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.area || !formData.crop) {
      setError('すべての必須項目を入力してください');
      return;
    }

    try {
      if (editingField) {
        // 更新
        await updateDoc(doc(db, 'fields', editingField.id), {
          name: formData.name,
          area: parseFloat(formData.area),
          crop: formData.crop,
          status: formData.status
        });
        setSuccess('圃場情報を更新しました');
      } else {
        // 新規追加
        await addDoc(collection(db, 'fields'), {
          userId: currentUser?.uid,
          name: formData.name,
          area: parseFloat(formData.area),
          crop: formData.crop,
          status: formData.status,
          createdAt: serverTimestamp()
        });
        setSuccess('圃場を追加しました');
      }
      handleCancelEdit();
      loadFields();
    } catch (error) {
      console.error('圃場の保存エラー:', error);
      setError('圃場の保存に失敗しました');
    }
  }

  async function handleDelete(fieldId: string) {
    if (!confirm('この圃場を削除してもよろしいですか?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'fields', fieldId));
      setSuccess('圃場を削除しました');
      loadFields();
    } catch (error) {
      console.error('圃場の削除エラー:', error);
      setError('圃場の削除に失敗しました');
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="material-icons mr-2 text-green-600">landscape</span>
            圃場管理
          </h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <span className="material-icons mr-1 text-sm">add</span>
            新規圃場追加
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <span className="material-icons mr-2">error</span>
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <span className="material-icons mr-2">check_circle</span>
            {success}
          </div>
        )}

        {showForm && (
          <Card title={editingField ? '圃場情報編集' : '新規圃場追加'}>
            <form onSubmit={handleSubmit}>
              <Input
                label="圃場名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: 第1圃場"
                required
              />

              <Input
                label="面積（ha）"
                type="number"
                step="0.01"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="例: 1.5"
                required
              />

              <Input
                label="作物名"
                value={formData.crop}
                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                placeholder="例: トマト"
                required
              />

              <Select
                label="状態"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Field['status'] })}
                required
              >
                <option value="栽培中">栽培中</option>
                <option value="休耕">休耕</option>
                <option value="準備中">準備中</option>
              </Select>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingField ? '更新' : '追加'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                  キャンセル
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card title="圃場一覧">
          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="material-icons text-6xl text-gray-300 mb-4 block">landscape</span>
              <p>登録されている圃場がありません</p>
              <p className="text-sm mt-2">「新規圃場追加」ボタンから圃場を登録してください</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      圃場名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      面積（ha）
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作物
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状態
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fields.map((field) => (
                    <tr key={field.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {field.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {field.area} ha
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {field.crop}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          field.status === '栽培中' ? 'bg-green-100 text-green-800' :
                          field.status === '休耕' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {field.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(field)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          <span className="material-icons text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(field.id)}
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
