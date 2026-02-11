import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import type { JGAPCriteria, JGAPAttachment } from '../types';
import { getSections, getCriteriaBySection, searchCriteria } from '../data/jgapCriteria';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const ComplianceCriteria: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [selectedSection, setSelectedSection] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [attachments, setAttachments] = useState<Map<string, JGAPAttachment[]>>(new Map());
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState<JGAPCriteria | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sections = getSections();

  // 添付資料を読み込む
  useEffect(() => {
    if (currentUser) {
      loadAttachments();
    }
  }, [currentUser]);

  const loadAttachments = async () => {
    if (!currentUser) return;

    try {
      const attachmentsQuery = query(
        collection(db, 'jgapAttachments'),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(attachmentsQuery);
      
      const attachmentMap = new Map<string, JGAPAttachment[]>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const attachment: JGAPAttachment = {
          id: doc.id,
          userId: data.userId,
          organizationId: data.organizationId,
          criteriaId: data.criteriaId,
          itemId: data.itemId || null,
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          notes: data.notes
        };

        // itemIdがある場合はitemIdでグループ化、ない場合はcriteriaIdでグループ化
        const key = data.itemId || data.criteriaId;
        const existing = attachmentMap.get(key) || [];
        attachmentMap.set(key, [...existing, attachment]);
      });

      setAttachments(attachmentMap);
    } catch (error) {
      console.error('添付資料の読み込みエラー:', error);
    }
  };

  // ファイルアップロード処理
  const handleFileUpload = async (criteriaId: string, itemId: string | null, file: File) => {
    if (!currentUser) return;

    try {
      setUploadingItemId(itemId || criteriaId);
      
      // Firebase Storageにアップロード
      const timestamp = Date.now();
      const storageRef = ref(storage, `jgap-attachments/${currentUser.uid}/${timestamp}_${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // Firestoreに記録
      await addDoc(collection(db, 'jgapAttachments'), {
        userId: currentUser.uid,
        organizationId: userProfile?.organizationId || null,
        criteriaId,
        itemId: itemId || null,
        fileName: file.name,
        fileUrl,
        fileType: file.type,
        uploadedAt: serverTimestamp(),
        notes: uploadNotes
      });

      // 再読み込み
      await loadAttachments();
      
      // リセット
      setShowAttachmentModal(false);
      setSelectedCriteria(null);
      setSelectedItemId(null);
      setUploadNotes('');
    } catch (error) {
      console.error('ファイルアップロードエラー:', error);
      alert('ファイルのアップロードに失敗しました');
    } finally {
      setUploadingItemId(null);
    }
  };

  // 添付資料を削除
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('この資料を削除しますか？')) return;

    try {
      await deleteDoc(doc(db, 'jgapAttachments', attachmentId));
      await loadAttachments();
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  // 適合基準レベルの色を取得
  const getLevelColor = (level: string) => {
    switch (level) {
      case '必須':
        return 'bg-red-100 text-red-800';
      case '重要':
        return 'bg-yellow-100 text-yellow-800';
      case '推奨':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 表示する管理点を取得
  const displayedCriteria = searchQuery 
    ? searchCriteria(searchQuery)
    : getCriteriaBySection(selectedSection);

  return (
    <Layout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">JGAP管理点と適合基準</h1>
            <p className="mt-2 text-sm text-gray-600">
              農場用管理点と適合基準（2022青果物）
            </p>
          </div>
        </div>

        {/* 検索バー */}
        <Card>
          <div className="p-6">
            <Input
              label="管理点を検索"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="管理点番号、内容、適合基準で検索..."
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* セクション一覧（サイドバー） */}
          {!searchQuery && (
            <div className="lg:col-span-1">
              <Card>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">セクション</h2>
                  <div className="space-y-2">
                    {sections.map((section) => {
                      const sectionAttachments = getCriteriaBySection(section.number)
                        .reduce((count, criteria) => {
                          return count + (attachments.get(criteria.id)?.length || 0);
                        }, 0);
                      const totalCriteria = getCriteriaBySection(section.number).length;
                      
                      return (
                        <button
                          key={section.number}
                          onClick={() => setSelectedSection(section.number)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                            selectedSection === section.number
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{section.number}. {section.title}</div>
                              <div className="text-xs mt-1 opacity-75">
                                {sectionAttachments}/{totalCriteria} 件添付
                              </div>
                            </div>
                            {sectionAttachments === totalCriteria && totalCriteria > 0 && (
                              <span className="material-icons text-sm">check_circle</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 管理点一覧 */}
          <div className={searchQuery ? 'lg:col-span-4' : 'lg:col-span-3'}>
            <Card>
              <div className="p-6">
                {searchQuery && (
                  <div className="mb-4 text-sm text-gray-600">
                    検索結果: {displayedCriteria.length}件
                  </div>
                )}
                
                <div className="space-y-6">
                  {displayedCriteria.map((criteria) => {
                    const criteriaAttachments = attachments.get(criteria.id) || [];
                    const hasAttachment = criteriaAttachments.length > 0;

                    return (
                      <div
                        key={criteria.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        {/* 管理点ヘッダー */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-bold text-gray-900">
                                {criteria.managementPoint}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(criteria.criteriaLevel)}`}>
                                {criteria.criteriaLevel}
                              </span>
                              {searchQuery && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                  {criteria.sectionNumber}. {criteria.sectionTitle}
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-semibold text-gray-900">
                              {criteria.description}
                            </h3>
                          </div>
                        </div>

                        {/* 適合基準 */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="text-sm font-semibold text-gray-700 mb-2">
                            適合基準:
                          </div>
                          <div className="text-sm text-gray-700">
                            {criteria.criteriaContent}
                          </div>
                        </div>

                        {/* 添付資料 */}
                        <div className="mb-4">
                          {criteriaAttachments.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-sm font-semibold text-gray-700">
                                添付資料 ({criteriaAttachments.length}件):
                              </div>
                              {criteriaAttachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center justify-between bg-blue-50 rounded-lg p-3"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <span className="material-icons text-blue-600">
                                      insert_drive_file
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <a
                                        href={attachment.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate block"
                                      >
                                        {attachment.fileName}
                                      </a>
                                      {attachment.notes && (
                                        <div className="text-xs text-gray-600 mt-1">
                                          {attachment.notes}
                                        </div>
                                      )}
                                      <div className="text-xs text-gray-500 mt-1">
                                        {attachment.uploadedAt.toLocaleDateString('ja-JP')}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteAttachment(attachment.id)}
                                    className="ml-2 text-red-600 hover:text-red-800"
                                  >
                                    <span className="material-icons text-sm">delete</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              添付資料がありません
                            </div>
                          )}
                        </div>

                        {/* 資料添付ボタン */}
                        <Button
                          onClick={() => {
                            setSelectedCriteria(criteria);
                            setShowAttachmentModal(true);
                          }}
                          className={`w-full ${
                            hasAttachment
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                          disabled={uploadingCriteriaId === criteria.id}
                        >
                          <span className="material-icons mr-2">attach_file</span>
                          {uploadingCriteriaId === criteria.id
                            ? 'アップロード中...'
                            : hasAttachment
                            ? '資料を追加'
                            : '資料を添付（未添付）'}
                        </Button>
                      </div>
                    );
                  })}

                  {displayedCriteria.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <span className="material-icons text-6xl mb-4 block">search_off</span>
                      <p>該当する管理点が見つかりませんでした</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 資料添付モーダル */}
        {showAttachmentModal && selectedCriteria && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">資料を添付</h2>
                  <button
                    onClick={() => {
                      setShowAttachmentModal(false);
                      setSelectedCriteria(null);
                      setUploadNotes('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>

                {/* 管理点情報 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">
                      {selectedCriteria.managementPoint}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(selectedCriteria.criteriaLevel)}`}>
                      {selectedCriteria.criteriaLevel}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {selectedCriteria.description}
                  </div>
                </div>

                {/* メモ入力 */}
                <div className="mb-6">
                  <Input
                    label="メモ（任意）"
                    type="text"
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    placeholder="資料に関するメモを入力..."
                  />
                </div>

                {/* ファイル選択 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ファイルを選択
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(selectedCriteria.id, file);
                      }
                    }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-green-50 file:text-green-700
                      hover:file:bg-green-100"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    PDF, Word, Excel, CSV, 画像ファイル対応
                  </p>
                </div>

                {/* ボタン */}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowAttachmentModal(false);
                      setSelectedCriteria(null);
                      setUploadNotes('');
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ComplianceCriteria;
