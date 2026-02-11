import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, serverTimestamp, query, where, doc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
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
    startTime: '',
    endTime: '',
    fieldId: '',
    workType: '施肥' as WorkRecord['workType'],
    workDetail: '',
    worker: '',
    // 作業種別ごとの数量
    quantity: '',
    unit: '',
    // 農薬・肥料使用の追加項目
    useMaterial: false,
    materialId: '',
    materialQuantity: '',
    materialPurpose: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

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
        } as Field))
        .filter(field => field.userId === currentUser?.uid);
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

  // ファイル選択ハンドラー
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      // 写真と動画のみを許可
      const validFiles = files.filter(file => 
        file.type.startsWith('image/') || file.type.startsWith('video/')
      );
      
      if (validFiles.length !== files.length) {
        setError('写真または動画のみアップロードできます');
        return;
      }
      
      // 最大5ファイルまで
      if (uploadedFiles.length + validFiles.length > 5) {
        setError('最大5つまでファイルをアップロードできます');
        return;
      }
      
      setUploadedFiles(prev => [...prev, ...validFiles]);
      setError('');
    }
  };

  // ファイル削除ハンドラー
  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ファイルをFirebase Storageにアップロード
  const uploadFiles = async (): Promise<string[]> => {
    if (uploadedFiles.length === 0) return [];
    
    setUploading(true);
    const urls: string[] = [];
    
    try {
      for (const file of uploadedFiles) {
        const timestamp = Date.now();
        const fileName = `work-records/${currentUser?.uid}/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);
        
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
      }
    } catch (error) {
      console.error('ファイルアップロードエラー:', error);
      throw new Error('ファイルのアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
    
    return urls;
  };

  // 作業種別に応じた入力ラベルと単位を取得
  const getQuantityLabel = () => {
    switch (formData.workType) {
      case '施肥': return { label: '使用量', defaultUnit: 'kg' };
      case '農薬散布': return { label: '使用量', defaultUnit: 'L' };
      case '除草': return { label: '除草面積', defaultUnit: 'm²' };
      case '収穫': return { label: '収穫量', defaultUnit: 'kg' };
      case '播種': return { label: '播種量', defaultUnit: 'kg' };
      case '定植': return { label: '定植量', defaultUnit: '株' };
      case '整地': return { label: '整地面積', defaultUnit: 'm²' };
      case '調整作業': return { label: '調整量', defaultUnit: 'kg' };
      case '出荷': return { label: '出荷量', defaultUnit: 'kg' };
      default: return { label: '数量', defaultUnit: '' };
    }
  };

  // 作業時間を計算
  const calculateWorkHours = (start: string, end: string): number | null => {
    if (!start || !end) return null;
    
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      return null; // 終了時刻が開始時刻より前または同じ
    }
    
    return (endMinutes - startMinutes) / 60;
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

    // 作業時間のバリデーション
    let workHours: number | undefined = undefined;
    if (formData.startTime && formData.endTime) {
      const hours = calculateWorkHours(formData.startTime, formData.endTime);
      if (hours === null) {
        setError('終了時刻は開始時刻より後にしてください');
        return;
      }
      workHours = hours;
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

      // ファイルをアップロード
      const fileUrls = await uploadFiles();

      // 作業記録を追加
      const recordData: any = {
        userId: currentUser?.uid,
        date: formData.date,
        fieldId: formData.fieldId,
        fieldName: selectedField.name,
        crop: selectedField.crop,
        workType: formData.workType,
        workDetail: formData.workDetail,
        worker: formData.worker,
        mediaUrls: fileUrls, // 写真・動画のURL
        createdAt: serverTimestamp()
      };

      // 作業時間を追加
      if (formData.startTime) recordData.startTime = formData.startTime;
      if (formData.endTime) recordData.endTime = formData.endTime;
      if (workHours !== undefined) recordData.workHours = workHours;

      // 作業数量を追加
      if (formData.quantity && formData.unit) {
        recordData.quantity = Number(formData.quantity);
        recordData.unit = formData.unit;
      }

      await addDoc(collection(db, 'workRecords'), recordData);

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

          {/* 作業時間 */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="開始時刻"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              placeholder="例: 09:00"
            />
            <Input
              label="終了時刻"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              placeholder="例: 17:00"
            />
          </div>

          {/* 作業時間の表示 */}
          {formData.startTime && formData.endTime && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex items-center">
                <span className="material-icons text-blue-600 mr-2 text-sm">schedule</span>
                <p className="text-sm text-gray-700">
                  作業時間: <span className="font-semibold">{calculateWorkHours(formData.startTime, formData.endTime)?.toFixed(1) || '計算エラー'}</span> 時間
                </p>
              </div>
            </div>
          )}

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
            <option value="調整作業">調整作業</option>
            <option value="出荷">出荷</option>
            <option value="その他">その他</option>
          </Select>

          {/* 作業数量の入力（施肥・農薬散布以外） */}
          {formData.workType !== 'その他' && 
           formData.workType !== '施肥' && 
           formData.workType !== '農薬散布' && (
            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded space-y-4">
              <div className="flex items-center mb-2">
                <span className="material-icons text-green-600 mr-2">analytics</span>
                <h3 className="font-semibold text-gray-900">
                  作業数量（任意）
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={getQuantityLabel().label}
                  type="number"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    quantity: e.target.value,
                    unit: formData.unit || getQuantityLabel().defaultUnit 
                  })}
                  placeholder="例: 100"
                />
                <Input
                  label="単位"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder={getQuantityLabel().defaultUnit}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="flex items-start">
                  <span className="material-icons text-blue-600 mr-2 text-sm">info</span>
                  <p className="text-xs text-gray-700">
                    作業の実績数量を記録できます（例: 収穫量、除草面積など）
                  </p>
                </div>
              </div>
            </div>
          )}

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

          {/* 写真・動画のアップロード */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <span className="material-icons text-blue-600 mr-2">photo_camera</span>
              <h3 className="font-semibold text-gray-900">写真・動画を追加（任意）</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="cursor-pointer">
                  <div className="flex items-center justify-center bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg p-4 hover:bg-blue-100 transition">
                    <span className="material-icons text-blue-600 mr-2">add_photo_alternate</span>
                    <span className="text-blue-600 font-medium">ファイルを選択</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  写真または動画（最大5ファイル）
                </p>
              </div>

              {/* アップロードされたファイルのプレビュー */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative bg-gray-100 rounded p-2">
                      <div className="flex items-center space-x-2">
                        <span className="material-icons text-gray-600 text-sm">
                          {file.type.startsWith('image/') ? 'image' : 'videocam'}
                        </span>
                        <span className="text-sm text-gray-700 truncate flex-1">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <span className="material-icons text-sm">close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={loading || uploading}
              className="flex-1"
            >
              {loading || uploading ? '保存中...' : '保存'}
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
