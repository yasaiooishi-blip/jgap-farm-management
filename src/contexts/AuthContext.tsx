import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { UserProfile, UserRole, Permission } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
  // 権限チェック関数
  isAdmin: () => boolean;
  isOrgLeader: () => boolean;
  canEditUser: (targetUserId: string) => Promise<boolean>;
  getAccessibleUserIds: () => Promise<string[]>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  function signup(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  // 管理者かどうか
  function isAdmin(): boolean {
    return userProfile?.role === 'admin';
  }

  // 組織リーダーかどうか
  function isOrgLeader(): boolean {
    return userProfile?.role === 'org_leader';
  }

  // 特定のユーザーを編集できるかどうか
  async function canEditUser(targetUserId: string): Promise<boolean> {
    if (!currentUser || !userProfile) return false;

    // 自分自身は編集可能
    if (currentUser.uid === targetUserId) return true;

    // 管理者はすべて編集可能
    if (isAdmin()) return true;

    // 組織リーダーは自組織のメンバーを編集可能
    if (isOrgLeader() && userProfile.organizationId) {
      try {
        const targetUserDoc = await getDoc(doc(db, 'users', targetUserId));
        if (targetUserDoc.exists()) {
          const targetUser = targetUserDoc.data() as UserProfile;
          return targetUser.organizationId === userProfile.organizationId;
        }
      } catch (error) {
        console.error('ユーザー情報取得エラー:', error);
        return false;
      }
    }

    // 一般ユーザーは許可されたユーザーのみ編集可能
    try {
      const permissionsQuery = query(
        collection(db, 'permissions'),
        where('fromUserId', '==', targetUserId),
        where('toUserId', '==', currentUser.uid),
        where('status', '==', 'approved'),
        where('canEdit', '==', true)
      );
      const snapshot = await getDocs(permissionsQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('権限チェックエラー:', error);
      return false;
    }
  }

  // アクセス可能なユーザーIDのリストを取得
  async function getAccessibleUserIds(): Promise<string[]> {
    if (!currentUser || !userProfile) return [];

    const accessibleIds: string[] = [currentUser.uid]; // 自分自身

    // 管理者はすべてのユーザー
    if (isAdmin()) {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        return usersSnapshot.docs.map(doc => doc.id);
      } catch (error) {
        console.error('ユーザー一覧取得エラー:', error);
        return accessibleIds;
      }
    }

    // 組織リーダーは自組織のメンバー
    if (isOrgLeader() && userProfile.organizationId) {
      try {
        const orgMembersQuery = query(
          collection(db, 'users'),
          where('organizationId', '==', userProfile.organizationId)
        );
        const snapshot = await getDocs(orgMembersQuery);
        return snapshot.docs.map(doc => doc.id);
      } catch (error) {
        console.error('組織メンバー取得エラー:', error);
        return accessibleIds;
      }
    }

    // 一般ユーザーは許可されたユーザー
    try {
      const permissionsQuery = query(
        collection(db, 'permissions'),
        where('toUserId', '==', currentUser.uid),
        where('status', '==', 'approved'),
        where('canView', '==', true)
      );
      const snapshot = await getDocs(permissionsQuery);
      const permittedIds = snapshot.docs.map(doc => (doc.data() as Permission).fromUserId);
      return [...accessibleIds, ...permittedIds];
    } catch (error) {
      console.error('許可ユーザー取得エラー:', error);
      return accessibleIds;
    }
  }

  // ユーザープロファイルを読み込む
  async function loadUserProfile(user: User) {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      } else {
        // デフォルトのユーザープロファイル（一般ユーザー）
        setUserProfile({
          uid: user.uid,
          email: user.email || '',
          role: 'user',
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error('ユーザープロファイル読み込みエラー:', error);
      // デフォルトのユーザープロファイル
      setUserProfile({
        uid: user.uid,
        email: user.email || '',
        role: 'user',
        createdAt: new Date()
      });
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    loading,
    isAdmin,
    isOrgLeader,
    canEditUser,
    getAccessibleUserIds
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
