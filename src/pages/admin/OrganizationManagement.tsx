import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import type { Organization, UserProfile } from '../../types';

export default function OrganizationManagement() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    leaderId: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  const loadData = async () => {
    try {
      // 組織を読み込む
      const orgsSnapshot = await getDocs(collection(db, 'organizations'));
      const orgsData: Organization[] = orgsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Organization));

      // ユーザーを読み込む
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData: UserProfile[] = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as UserProfile));

      setOrganizations(orgsData);
      setUsers(usersData);
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setError('組織名を入力してください');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const newOrg = await addDoc(collection(db, 'organizations'), {
        name: formData.name,
        leaderId: formData.leaderId || '',
        memberIds: [],
        createdAt: serverTimestamp()
      });

      // リーダーが選択されている場合、ユーザーの組織IDとロールを更新
      if (formData.leaderId) {
        const userRef = doc(db, 'users', formData.leaderId);
        await updateDoc(userRef, {
          organizationId: newOrg.id,
          role: 'org_leader'
        });
      }

      setShowAddModal(false);
      setFormData({ name: '', leaderId: '' });
      loadData();
    } catch (error) {
      console.error('組織作成エラー:', error);
      setError('組織の作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (orgId: string) => {
    if (!confirm('この組織を削除してもよろしいですか？\n組織内のユーザーは未所属になります。')) return;

    try {
      // 組織のメンバーの組織IDをクリア
      const orgMembers = users.filter(u => u.organizationId === orgId);
      for (const member of orgMembers) {
        const userRef = doc(db, 'users', member.uid);
        await updateDoc(userRef, {
          organizationId: '',
          role: 'user'
        });
      }

      // 組織を削除
      await deleteDoc(doc(db, 'organizations', orgId));
      loadData();
    } catch (error) {
      console.error('組織削除エラー:', error);
      alert('組織の削除に失敗しました');
    }
  };

  const getOrgMembers = (orgId: string) => {
    return users.filter(u => u.organizationId === orgId);
  };

  const getOrgLeader = (leaderId: string) => {
    return users.find(u => u.uid === leaderId);
  };

  const availableUsers = users.filter(u => !u.organizationId || u.organizationId === '');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="material-icons mr-2 text-blue-600">corporate_fare</span>
              組織管理
            </h1>
            <p className="text-sm text-gray-600 mt-1">組織の作成・編集・削除</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => navigate('/admin/users')} variant="secondary">
              <span className="material-icons mr-1 text-sm">people</span>
              ユーザー管理
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <span className="material-icons mr-1 text-sm">add</span>
              新規組織作成
            </Button>
          </div>
        </div>

        {/* 組織一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => {
            const members = getOrgMembers(org.id);
            const leader = getOrgLeader(org.leaderId);
            
            return (
              <Card key={org.id}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                    <button
                      onClick={() => handleDelete(org.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="material-icons text-blue-600 mr-2 text-sm">person</span>
                      <span className="text-gray-600">リーダー:</span>
                      <span className="ml-2 font-medium">
                        {leader ? (leader.displayName || leader.email) : '未設定'}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <span className="material-icons text-green-600 mr-2 text-sm">group</span>
                      <span className="text-gray-600">メンバー:</span>
                      <span className="ml-2 font-medium">{members.length}人</span>
                    </div>
                  </div>

                  {members.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-500 mb-2">メンバー一覧</p>
                      <div className="space-y-1">
                        {members.slice(0, 5).map((member) => (
                          <div key={member.uid} className="flex items-center text-xs">
                            <span className="material-icons text-gray-400 mr-1" style={{ fontSize: '14px' }}>
                              {member.role === 'org_leader' ? 'star' : 'person'}
                            </span>
                            <span className="text-gray-700 truncate">
                              {member.displayName || member.email}
                            </span>
                          </div>
                        ))}
                        {members.length > 5 && (
                          <p className="text-xs text-gray-500">...他 {members.length - 5}人</p>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/admin/organizations/${org.id}`)}
                    className="w-full"
                  >
                    詳細を見る
                  </Button>
                </div>
              </Card>
            );
          })}

          {/* 未所属ユーザーカード */}
          {availableUsers.length > 0 && (
            <Card>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="material-icons text-gray-400 mr-2">person_outline</span>
                  <h3 className="text-lg font-semibold text-gray-700">未所属</h3>
                </div>

                <div className="flex items-center text-sm">
                  <span className="material-icons text-gray-600 mr-2 text-sm">group</span>
                  <span className="text-gray-600">ユーザー:</span>
                  <span className="ml-2 font-medium">{availableUsers.length}人</span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/admin/users')}
                  className="w-full"
                >
                  ユーザーを管理
                </Button>
              </div>
            </Card>
          )}
        </div>

        {organizations.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <span className="material-icons text-6xl text-gray-300 mb-2">corporate_fare</span>
              <p className="text-gray-500">組織が登録されていません</p>
              <Button onClick={() => setShowAddModal(true)} className="mt-4">
                組織を作成
              </Button>
            </div>
          </Card>
        )}

        {/* 新規組織作成モーダル */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">新規組織作成</h2>
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
                    label="組織名"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例: 東京農場、大阪農場"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      組織リーダー（任意）
                    </label>
                    <select
                      value={formData.leaderId}
                      onChange={(e) => setFormData({ ...formData, leaderId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">後で設定</option>
                      {availableUsers.map((user) => (
                        <option key={user.uid} value={user.uid}>
                          {user.displayName || user.email}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      未所属のユーザーのみ選択できます
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" disabled={saving} className="flex-1">
                      {saving ? '作成中...' : '作成'}
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
