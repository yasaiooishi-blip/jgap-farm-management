import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, updateDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import type { Organization, UserProfile, UserRole } from '../../types';

export default function UserManagement() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    organizationId: '',
    role: 'user' as UserRole
  });
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    organizationId: '',
    role: 'user' as UserRole
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  const loadData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData: UserProfile[] = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as UserProfile));

      const orgsSnapshot = await getDocs(collection(db, 'organizations'));
      const orgsData: Organization[] = orgsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Organization));

      setUsers(usersData);
      setOrganizations(orgsData);
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      organizationId: user.organizationId || '',
      role: user.role
    });
    setShowEditModal(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    setSaving(true);
    setError('');

    try {
      const userRef = doc(db, 'users', selectedUser.uid);
      await updateDoc(userRef, {
        organizationId: formData.organizationId || '',
        role: formData.role
      });

      // 組織リーダーの場合、組織のleaderIdも更新
      if (formData.role === 'org_leader' && formData.organizationId) {
        const orgRef = doc(db, 'organizations', formData.organizationId);
        await updateDoc(orgRef, {
          leaderId: selectedUser.uid
        });
      }

      setShowEditModal(false);
      setSelectedUser(null);
      loadData();
    } catch (error) {
      console.error('ユーザー更新エラー:', error);
      setError('ユーザー情報の更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createFormData.email || !createFormData.password || !createFormData.displayName) {
      setError('すべての必須項目を入力してください');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Firebase Authenticationにユーザー作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        createFormData.email,
        createFormData.password
      );

      // Firestoreのusersコレクションにドキュメント作成（ドキュメントIDをuidに設定）
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: createFormData.email,
        displayName: createFormData.displayName,
        role: createFormData.role,
        organizationId: createFormData.organizationId || null,
        createdAt: serverTimestamp()
      });

      // 組織リーダーの場合、organizationsのleaderIdを更新
      if (createFormData.role === 'org_leader' && createFormData.organizationId) {
        await updateDoc(doc(db, 'organizations', createFormData.organizationId), {
          leaderId: userCredential.user.uid
        });
      }

      setShowCreateModal(false);
      setCreateFormData({
        email: '',
        password: '',
        displayName: '',
        organizationId: '',
        role: 'user'
      });
      loadData();
    } catch (error: any) {
      console.error('ユーザー作成エラー:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に使用されています');
      } else if (error.code === 'auth/weak-password') {
        setError('パスワードは6文字以上で設定してください');
      } else {
        setError('ユーザーの作成に失敗しました');
      }
    } finally {
      setSaving(false);
    }
  };

  const getOrgName = (orgId: string | undefined) => {
    if (!orgId) return '未所属';
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : '未所属';
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return '管理者';
      case 'org_leader': return '組織リーダー';
      case 'user': return '一般ユーザー';
      default: return '一般ユーザー';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'org_leader': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesOrg = filterOrg === 'all' || 
                       (filterOrg === 'none' && !user.organizationId) ||
                       user.organizationId === filterOrg;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesOrg && matchesRole;
  });

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
              <span className="material-icons mr-2 text-blue-600">people</span>
              ユーザー管理
            </h1>
            <p className="text-sm text-gray-600 mt-1">ユーザーの組織への振り分けとロール変更</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateModal(true)}>
              <span className="material-icons mr-1 text-sm">person_add</span>
              新規ユーザー作成
            </Button>
            <Button onClick={() => navigate('/admin/organizations')} variant="secondary">
              <span className="material-icons mr-1 text-sm">corporate_fare</span>
              組織管理
            </Button>
          </div>
        </div>

        {/* フィルター */}
        <Card>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">フィルター</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  組織
                </label>
                <select
                  value={filterOrg}
                  onChange={(e) => setFilterOrg(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">すべて</option>
                  <option value="none">未所属</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ロール
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">すべて</option>
                  <option value="admin">管理者</option>
                  <option value="org_leader">組織リーダー</option>
                  <option value="user">一般ユーザー</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* ユーザー一覧 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">ユーザー一覧 ({filteredUsers.length}人)</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ロール
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    所属組織
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.displayName || user.email.split('@')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getOrgName(user.organizationId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <span className="material-icons text-lg">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 新規ユーザー作成モーダル */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">新規ユーザー作成</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                  }}
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

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="example@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="6文字以上"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    表示名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createFormData.displayName}
                    onChange={(e) => setCreateFormData({ ...createFormData, displayName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 田中太郎"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ロール <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={createFormData.role}
                    onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">一般ユーザー</option>
                    <option value="org_leader">組織リーダー</option>
                    <option value="admin">管理者</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    所属組織
                  </label>
                  <select
                    value={createFormData.organizationId}
                    onChange={(e) => setCreateFormData({ ...createFormData, organizationId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">未所属</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? '作成中...' : '作成'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setError('');
                    }}
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 編集モーダル */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">ユーザー編集</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
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

                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-gray-700">
                    <strong>{selectedUser.displayName || selectedUser.email}</strong>
                  </p>
                  <p className="text-xs text-gray-600">{selectedUser.email}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ロール <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">一般ユーザー</option>
                      <option value="org_leader">組織リーダー</option>
                      <option value="admin">管理者</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      所属組織
                    </label>
                    <select
                      value={formData.organizationId}
                      onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">未所属</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                    {formData.role === 'org_leader' && !formData.organizationId && (
                      <p className="text-xs text-yellow-600 mt-1">
                        ⚠️ 組織リーダーは組織を選択してください
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" disabled={saving} className="flex-1">
                      {saving ? '更新中...' : '更新'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowEditModal(false)}
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
