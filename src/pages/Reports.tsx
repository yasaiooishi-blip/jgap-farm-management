import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// jsPDF の型定義を拡張
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface WorkRecord {
  id: string;
  date: string;
  fieldName: string;
  workType: string;
  worker: string;
}

interface MaterialUsage {
  id: string;
  date: string;
  materialName: string;
  materialType: string;
  quantity: number;
  unit: string;
  fieldName: string;
  worker: string;
  purpose: string;
}

interface Material {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
}

export default function Reports() {
  const { currentUser } = useAuth();
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [materialUsages, setMaterialUsages] = useState<MaterialUsage[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<'work' | 'material' | 'usage'>('work');

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    try {
      // 作業記録を取得
      const workQuery = query(
        collection(db, 'workRecords'),
        where('userId', '==', currentUser.uid)
      );
      const workSnapshot = await getDocs(workQuery);
      const workData: WorkRecord[] = workSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as WorkRecord));

      // 資材使用記録を取得
      const usageQuery = query(
        collection(db, 'materialUsage'),
        where('userId', '==', currentUser.uid)
      );
      const usageSnapshot = await getDocs(usageQuery);
      const usageData: MaterialUsage[] = usageSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MaterialUsage));

      // 資材を取得
      const materialQuery = query(
        collection(db, 'materials'),
        where('userId', '==', currentUser.uid)
      );
      const materialSnapshot = await getDocs(materialQuery);
      const materialData: Material[] = materialSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Material));

      setWorkRecords(workData);
      setMaterialUsages(usageData);
      setMaterials(materialData);
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 作業記録の月別集計
  const getWorkByMonth = () => {
    const monthCounts: { [key: string]: number } = {};
    workRecords.forEach(record => {
      const month = record.date.substring(0, 7); // YYYY-MM
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    return Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  // 作業種別の集計
  const getWorkByType = () => {
    const typeCounts: { [key: string]: number } = {};
    workRecords.forEach(record => {
      typeCounts[record.workType] = (typeCounts[record.workType] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  };

  // 資材種別の集計
  const getMaterialByType = () => {
    const typeCounts: { [key: string]: number } = {};
    materials.forEach(material => {
      typeCounts[material.type] = (typeCounts[material.type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  };

  // 農薬・肥料使用量の月別集計
  const getUsageByMonth = () => {
    const monthData: { [key: string]: { 肥料: number; 農薬: number } } = {};
    materialUsages.forEach(usage => {
      const month = usage.date.substring(0, 7);
      if (!monthData[month]) {
        monthData[month] = { 肥料: 0, 農薬: 0 };
      }
      if (usage.materialType === '肥料' || usage.materialType === '農薬') {
        monthData[month][usage.materialType] += usage.quantity;
      }
    });
    return Object.entries(monthData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  // 各資材ごとの使用量集計
  const getUsageByMaterial = () => {
    const materialData: { [key: string]: { name: string; type: string; totalQuantity: number; count: number; unit: string } } = {};
    
    materialUsages.forEach(usage => {
      if (!materialData[usage.materialName]) {
        materialData[usage.materialName] = {
          name: usage.materialName,
          type: usage.materialType,
          totalQuantity: 0,
          count: 0,
          unit: usage.unit
        };
      }
      materialData[usage.materialName].totalQuantity += usage.quantity;
      materialData[usage.materialName].count += 1;
    });

    return Object.values(materialData).sort((a, b) => b.totalQuantity - a.totalQuantity);
  };

  // 各資材の使用量（グラフ用）
  const getMaterialUsageChart = () => {
    const materialData: { [key: string]: number } = {};
    
    materialUsages.forEach(usage => {
      materialData[usage.materialName] = (materialData[usage.materialName] || 0) + usage.quantity;
    });

    return Object.entries(materialData)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // 上位10件
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // CSV出力
  const exportToCSV = (type: 'work' | 'material' | 'usage') => {
    let csvContent = '';
    let filename = '';

    if (type === 'work') {
      csvContent = '作業日,圃場名,作業種別,作業者\n';
      workRecords.forEach(record => {
        csvContent += `${record.date},${record.fieldName},${record.workType},${record.worker}\n`;
      });
      filename = '作業記録.csv';
    } else if (type === 'material') {
      csvContent = '資材名,種別,在庫数量,単位\n';
      materials.forEach(material => {
        csvContent += `${material.name},${material.type},${material.quantity},${material.unit}\n`;
      });
      filename = '資材一覧.csv';
    } else if (type === 'usage') {
      csvContent = '使用日,資材名,種別,圃場,使用量,作業者,目的\n';
      materialUsages.forEach(usage => {
        csvContent += `${usage.date},${usage.materialName},${usage.materialType},${usage.fieldName},${usage.quantity}${usage.unit},${usage.worker},${usage.purpose}\n`;
      });
      filename = '農薬肥料使用簿.csv';
    }

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // PDF出力
  const exportToPDF = (type: 'work' | 'material' | 'usage') => {
    const doc = new jsPDF();
    
    // 日本語フォントの設定（簡易版）
    doc.setFont('helvetica');
    
    if (type === 'work') {
      doc.text('Work Records Report', 14, 15);
      const tableData = workRecords.map(record => [
        record.date,
        record.fieldName,
        record.workType,
        record.worker
      ]);
      doc.autoTable({
        head: [['Date', 'Field', 'Work Type', 'Worker']],
        body: tableData,
        startY: 20
      });
      doc.save('work-records.pdf');
    } else if (type === 'material') {
      doc.text('Materials Inventory Report', 14, 15);
      const tableData = materials.map(material => [
        material.name,
        material.type,
        `${material.quantity} ${material.unit}`
      ]);
      doc.autoTable({
        head: [['Name', 'Type', 'Quantity']],
        body: tableData,
        startY: 20
      });
      doc.save('materials.pdf');
    } else if (type === 'usage') {
      doc.text('Pesticide & Fertilizer Usage Report', 14, 15);
      const tableData = materialUsages.map(usage => [
        usage.date,
        usage.materialName,
        usage.materialType,
        usage.fieldName,
        `${usage.quantity} ${usage.unit}`,
        usage.worker
      ]);
      doc.autoTable({
        head: [['Date', 'Material', 'Type', 'Field', 'Quantity', 'Worker']],
        body: tableData,
        startY: 20
      });
      doc.save('material-usage.pdf');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="material-icons mr-2 text-orange-600">assessment</span>
            レポート
          </h1>
        </div>

        {/* JGAP情報カード */}
        <Card>
          <div className="flex items-start space-x-3">
            <span className="material-icons text-green-600 text-2xl">verified</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">JGAP認証対応レポート</h3>
              <p className="text-sm text-gray-600">
                作業記録、資材管理、農薬・肥料使用履歴をグラフで可視化し、PDF/CSV形式で出力できます。
                JGAP認証の審査資料としてもご活用いただけます。
              </p>
            </div>
          </div>
        </Card>

        {/* タブ選択 */}
        <Card>
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setSelectedReport('work')}
              className={`px-4 py-2 font-medium transition-colors ${
                selectedReport === 'work'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              作業記録
            </button>
            <button
              onClick={() => setSelectedReport('material')}
              className={`px-4 py-2 font-medium transition-colors ${
                selectedReport === 'material'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              資材管理
            </button>
            <button
              onClick={() => setSelectedReport('usage')}
              className={`px-4 py-2 font-medium transition-colors ${
                selectedReport === 'usage'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              農薬・肥料使用簿
            </button>
          </div>

          <div className="mt-6 flex space-x-3">
            <Button
              onClick={() => exportToCSV(selectedReport)}
              variant="secondary"
            >
              <span className="material-icons mr-1 text-sm">table_chart</span>
              CSV出力
            </Button>
            <Button
              onClick={() => exportToPDF(selectedReport)}
              variant="secondary"
            >
              <span className="material-icons mr-1 text-sm">picture_as_pdf</span>
              PDF出力
            </Button>
          </div>
        </Card>

        {/* 作業記録レポート */}
        {selectedReport === 'work' && (
          <>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">月別作業件数</h3>
              {workRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-8">データがありません</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getWorkByMonth()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#10b981" name="作業件数" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">作業種別の分布</h3>
              {workRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-8">データがありません</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getWorkByType()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getWorkByType().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </>
        )}

        {/* 資材管理レポート */}
        {selectedReport === 'material' && (
          <>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">資材種別の分布</h3>
              {materials.length === 0 ? (
                <p className="text-gray-500 text-center py-8">データがありません</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getMaterialByType()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getMaterialByType().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">資材在庫一覧</h3>
              {materials.length === 0 ? (
                <p className="text-gray-500 text-center py-8">データがありません</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          資材名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          種別
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          在庫数量
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {materials.map((material) => (
                        <tr key={material.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {material.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {material.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {material.quantity} {material.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}

        {/* 農薬・肥料使用簿レポート */}
        {selectedReport === 'usage' && (
          <>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">月別使用量（農薬・肥料）</h3>
              {materialUsages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">データがありません</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getUsageByMonth()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="肥料" stroke="#10b981" name="肥料 (kg)" />
                    <Line type="monotone" dataKey="農薬" stroke="#ef4444" name="農薬 (kg)" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">各資材の使用量（上位10件）</h3>
              {materialUsages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">データがありません</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getMaterialUsageChart()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantity" fill="#8b5cf6" name="使用量" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">各資材ごとの使用量集計</h3>
              {materialUsages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">データがありません</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          資材名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          種別
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          総使用量
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          使用回数
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getUsageByMaterial().map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded ${
                              item.type === '肥料' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.totalQuantity.toFixed(1)} {item.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.count} 回
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">使用履歴一覧</h3>
              {materialUsages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">データがありません</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          使用日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          資材名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          種別
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          使用量
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          圃場
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {materialUsages.slice(0, 10).map((usage) => (
                        <tr key={usage.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(usage.date).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {usage.materialName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {usage.materialType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {usage.quantity} {usage.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {usage.fieldName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
