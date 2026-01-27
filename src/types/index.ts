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
  fieldId: string;
  fieldName: string;
  crop: string;
  workType: '施肥' | '除草' | '収穫' | '農薬散布' | '播種' | '定植' | '整地' | 'その他';
  workDetail: string;
  worker: string;
  createdAt: Date;
}

// ユーザーの型定義
export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
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
  fieldId: string;
  fieldName: string;
  crop: string;
  workType: WorkRecord['workType'];
  workDetail: string;
  worker: string;
}
