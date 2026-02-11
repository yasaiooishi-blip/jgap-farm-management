// 圃場（Field）の型定義
export interface Field {
  id: string;
  userId: string;
  name: string;
  area: number; // 面積（ha）
  crop: string; // 栽培作物
  status: '栽培中' | '休耕' | '準備中';
  createdAt: Date;
}

// 作業記録（WorkRecord）の型定義
export interface WorkRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD形式
  startTime?: string; // HH:MM形式
  endTime?: string; // HH:MM形式
  workHours?: number; // 作業時間（時間）
  fieldId: string;
  fieldName: string;
  crop: string;
  workType: '施肥' | '除草' | '収穫' | '農薬散布' | '播種' | '定植' | '整地' | '調整作業' | '出荷' | 'その他';
  workDetail: string;
  worker: string;
  // 作業種別ごとの数量
  quantity?: number; // 数量
  unit?: string; // 単位
  createdAt: Date;
  mediaUrls?: string[]; // 写真・動画のURL
}

// ユーザーロール
export type UserRole = 'admin' | 'org_leader' | 'user';

// ユーザーの型定義
export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  displayName?: string;
  organizationId?: string;
  role: UserRole;
  createdAt: Date;
}

// 組織の型定義
export interface Organization {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  createdAt: Date;
}

// 共有権限の型定義
export interface Permission {
  id: string;
  fromUserId: string;     // 許可を与えるユーザー
  toUserId: string;       // 許可を受けるユーザー
  status: 'pending' | 'approved' | 'rejected';
  canEdit: boolean;       // 編集権限
  canView: boolean;       // 閲覧権限
  requestedAt: Date;
  approvedAt?: Date;
}

// 出荷記録の型定義
export interface Shipment {
  id: string;
  userId: string;
  shipmentDate: string; // YYYY-MM-DD形式
  destination: string; // 出荷先
  fieldId?: string;
  fieldName?: string;
  crop: string; // 作物名
  variety?: string; // 品種
  grade: '秀' | '優' | '良' | '規格外' | 'その他'; // 等級
  size?: 'L' | 'M' | 'S' | '2L' | '3L' | 'その他'; // サイズ
  quantity: number; // 出荷量
  unit: string; // 単位
  unitPrice?: number; // 単価
  totalAmount?: number; // 金額
  worker: string; // 担当者
  notes?: string; // 備考
  workRecordId?: string; // 作業記録との紐付け
  createdAt: Date;
}

// フォーム入力用の型定義
export interface FieldInput {
  name: string;
  area: number;
  crop: string;
  status: Field['status'];
}

export interface WorkRecordInput {
  date: string;
  startTime?: string;
  endTime?: string;
  workHours?: number;
  fieldId: string;
  fieldName: string;
  crop: string;
  workType: WorkRecord['workType'];
  workDetail: string;
  worker: string;
  quantity?: number;
  unit?: string;
}
