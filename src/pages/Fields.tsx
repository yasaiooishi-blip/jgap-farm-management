import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import type { Field, UserProfile, Organization } from '../types';

interface FieldWithOwner extends Field {
  ownerName?: string;
  organizationName?: string;
}

export default function Fields() {
  const { currentUser, getAccessibleUserIds, isAdmin } = useAuth();
  const [fields, setFields] = useState<FieldWithOwner[]>([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('すべて');
  const [filterOrganization, setFilterOrganization] = useState<string>('すべて');
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadFields();
    }
  }, [currentUser]);

  async function loadFields() {
    try {
      // 権限に応じたデータ取得
      const accessibleUserIds = await getAccessibleUserIds();
      
      let q;
      if (accessibleUserIds.length === 0) {
        // アクセス可能なユーザーがいない場合は空の結果を返す
        setFields([]);
        setLoading(false);
        return;
      } else if (accessibleUserIds.length === 1) {
        // 自分だけの場合
        q = query(
          collection(db, 'fields'),
          where('userId', '==', accessibleUserIds[0])
        );
      } else {
        // 複数のユーザーのデータにアクセス可能な場合
        q = query(
          collection(db, 'fields'),
          where('userId', 'in', accessibleUserIds.slice(0, 10)) // Firestoreの制限: in は最大10個
        );
      }
      
      const querySnapshot = await getDocs(q);
      const fieldsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Field[];

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

      // 圃場データに所有者情報を追加
      const fieldsWithOwner: FieldWithOwner[] = fieldsData.map(field => {
        const user = usersMap.get(field.userId);
        const org = user?.organizationId ? orgsMap.get(user.organizationId) : null;
        return {
          ...field,
          ownerName: user?.displayName || user?.email?.split('@')[0] || '不明',
          organizationName: org?.name || '未所属'
        };
      });

      setFields(fieldsWithOwner);
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

  function handleClearFilters() {
    setSearchTerm('');
    setFilterStatus('すべて');
    setFilterOrganization('すべて');
  }

  const filteredFields = fields.filter(field => {
    if (searchTerm && !field.name.includes(searchTerm) && !field.crop.includes(searchTerm)) {
      return false;
    }
    if (filterStatus !== 'すべて' && field.status !== filterStatus) {
      return false;
    }
    if (filterOrganization !== 'すべて' && field.organizationName !== filterOrganization) {
      return false;
    }
    return true;
  });

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

        <Card title="検索・フィルター">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="圃場名・作物で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="例: 第1圃場、トマト"
            />

            <Select
              label="状態"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="すべて">すべて</option>
              <option value="栽培中">栽培中</option>
              <option value="休耕">休耕</option>
              <option value="準備中">準備中</option>
            </Select>

            {isAdmin() && (
              <Select
                label="組織"
                value={filterOrganization}
                onChange={(e) => setFilterOrganization(e.target.value)}
              >
                <option value="すべて">すべて</option>
                <option value="未所属">未所属</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.name}>
                    {org.name}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div className="mt-4">
            <Button variant="secondary" onClick={handleClearFilters}>
              <span className="material-icons mr-1 text-sm">clear</span>
              フィルタークリア
            </Button>
          </div>
        </Card>

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

        <Card title={`圃場一覧 (${filteredFields.length}件)`}>
          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : filteredFields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="material-icons text-6xl text-gray-300 mb-4 block">landscape</span>
              <p>表示する圃場がありません</p>
              {fields.length === 0 && (
                <p className="text-sm mt-2">「新規圃場追加」ボタンから圃場を登録してください</p>
              )}
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
                    {isAdmin() && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        所有者
                      </th>
                    )}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFields.map((field) => (
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
                      {isAdmin() && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div className="font-medium text-gray-900">{field.ownerName}</div>
                            <div className="text-xs text-gray-500">{field.organizationName}</div>
                          </div>
                        </td>
                      )}
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
