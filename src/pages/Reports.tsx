import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
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
  workHours?: number;
  quantity?: number;
  unit?: string;
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

interface Shipment {
  id: string;
  shipmentDate: string;
  destination: string;
  crop: string;
  variety?: string;
  grade: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalAmount?: number;
  worker: string;
}

export default function Reports() {
  const { currentUser } = useAuth();
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [materialUsages, setMaterialUsages] = useState<MaterialUsage[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<'overview' | 'work' | 'material' | 'usage' | 'shipment'>('overview');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

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

      // 出荷記録を取得
      const shipmentQuery = query(
        collection(db, 'shipments'),
        where('userId', '==', currentUser.uid)
      );
      const shipmentSnapshot = await getDocs(shipmentQuery);
      const shipmentData: Shipment[] = shipmentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Shipment));

      setWorkRecords(workData);
      setMaterialUsages(usageData);
      setMaterials(materialData);
      setShipments(shipmentData);
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 期間フィルター適用
  const filterByDate = <T extends { date?: string; shipmentDate?: string }>(data: T[]): T[] => {
    if (!dateRange.startDate && !dateRange.endDate) return data;
    
    return data.filter(item => {
      const itemDate = (item as any).date || (item as any).shipmentDate;
      if (!itemDate) return true;
      
      if (dateRange.startDate && itemDate < dateRange.startDate) return false;
      if (dateRange.endDate && itemDate > dateRange.endDate) return false;
      return true;
    });
  };

  const filteredWorkRecords = filterByDate(workRecords);
  const filteredMaterialUsages = filterByDate(materialUsages);
  const filteredShipments = filterByDate(shipments);

  // クイック期間設定
  const setQuickDate = (type: 'this-month' | 'last-month' | 'this-year' | 'last-year') => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (type) {
      case 'this-month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last-month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this-year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case 'last-year':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
    }

    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  };

  // 総合ダッシュボードの統計
  const getOverviewStats = () => {
    const totalWorkRecords = filteredWorkRecords.length;
    const totalShipments = filteredShipments.length;
    const totalShipmentQuantity = filteredShipments.reduce((sum, s) => sum + s.quantity, 0);
    const totalRevenue = filteredShipments.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalWorkHours = filteredWorkRecords.reduce((sum, r) => sum + (r.workHours || 0), 0);

    return {
      totalWorkRecords,
      totalShipments,
      totalShipmentQuantity,
      totalRevenue,
      totalWorkHours
    };
  };

  // 月別作業件数
  const getWorkByMonth = () => {
    const monthCounts: { [key: string]: number } = {};
    filteredWorkRecords.forEach(record => {
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
    filteredWorkRecords.forEach(record => {
      typeCounts[record.workType] = (typeCounts[record.workType] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  };

  // 月別売上
  const getRevenueByMonth = () => {
    const monthData: { [key: string]: { revenue: number; quantity: number } } = {};
    filteredShipments.forEach(shipment => {
      const month = shipment.shipmentDate.substring(0, 7);
      if (!monthData[month]) {
        monthData[month] = { revenue: 0, quantity: 0 };
      }
      monthData[month].revenue += shipment.totalAmount || 0;
      monthData[month].quantity += shipment.quantity;
    });
    return Object.entries(monthData)
      .map(([month, data]) => ({ month, revenue: data.revenue, quantity: data.quantity }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  // 作物別売上
  const getRevenueByCrop = () => {
    const cropData: { [key: string]: number } = {};
    filteredShipments.forEach(shipment => {
      cropData[shipment.crop] = (cropData[shipment.crop] || 0) + (shipment.totalAmount || 0);
    });
    return Object.entries(cropData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // 出荷先別売上
  const getRevenueByDestination = () => {
    const destData: { [key: string]: number } = {};
    filteredShipments.forEach(shipment => {
      destData[shipment.destination] = (destData[shipment.destination] || 0) + (shipment.totalAmount || 0);
    });
    return Object.entries(destData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  // 等級別出荷量
  const getQuantityByGrade = () => {
    const gradeData: { [key: string]: number } = {};
    filteredShipments.forEach(shipment => {
      gradeData[shipment.grade] = (gradeData[shipment.grade] || 0) + shipment.quantity;
    });
    return Object.entries(gradeData).map(([name, value]) => ({ name, value }));
  };

  // 農薬・肥料使用量の月別集計
  const getUsageByMonth = () => {
    const monthData: { [key: string]: { 肥料: number; 農薬: number } } = {};
    filteredMaterialUsages.forEach(usage => {
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

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // CSV出力
  const exportToCSV = (type: 'work' | 'material' | 'usage' | 'shipment') => {
    let csvContent = '';
    let filename = '';

    if (type === 'work') {
      csvContent = '作業日,圃場名,作業種別,作業者,作業時間,数量,単位\n';
      filteredWorkRecords.forEach(record => {
        csvContent += `${record.date},${record.fieldName},${record.workType},${record.worker},${record.workHours || ''},${record.quantity || ''},${record.unit || ''}\n`;
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
      filteredMaterialUsages.forEach(usage => {
        csvContent += `${usage.date},${usage.materialName},${usage.materialType},${usage.fieldName},${usage.quantity}${usage.unit},${usage.worker},${usage.purpose}\n`;
      });
      filename = '農薬肥料使用簿.csv';
    } else if (type === 'shipment') {
      csvContent = '出荷日,出荷先,作物,品種,等級,出荷量,単位,単価,金額,担当者\n';
      filteredShipments.forEach(shipment => {
        csvContent += `${shipment.shipmentDate},${shipment.destination},${shipment.crop},${shipment.variety || ''},${shipment.grade},${shipment.quantity},${shipment.unit},${shipment.unitPrice || ''},${shipment.totalAmount || ''},${shipment.worker}\n`;
      });
      filename = '出荷記録.csv';
    }

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // PDF出力
  const exportToPDF = (type: 'work' | 'material' | 'usage' | 'shipment') => {
    const doc = new jsPDF();
    doc.setFont('helvetica');
    
    if (type === 'work') {
      doc.text('Work Records Report', 14, 15);
      const tableData = filteredWorkRecords.map(record => [
        record.date,
        record.fieldName,
        record.workType,
        record.worker,
        record.workHours ? `${record.workHours}h` : '-'
      ]);
      doc.autoTable({
        head: [['Date', 'Field', 'Work Type', 'Worker', 'Hours']],
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
      const tableData = filteredMaterialUsages.map(usage => [
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
    } else if (type === 'shipment') {
      doc.text('Shipment Report', 14, 15);
      const tableData = filteredShipments.map(shipment => [
        shipment.shipmentDate,
        shipment.destination,
        shipment.crop,
        shipment.grade,
        `${shipment.quantity} ${shipment.unit}`,
        shipment.totalAmount ? `¥${shipment.totalAmount.toLocaleString()}` : '-'
      ]);
      doc.autoTable({
        head: [['Date', 'Destination', 'Crop', 'Grade', 'Quantity', 'Amount']],
        body: tableData,
        startY: 20
      });
      doc.save('shipments.pdf');
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

  const stats = getOverviewStats();

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
                作業記録、資材管理、農薬・肥料使用履歴、出荷記録をグラフで可視化し、PDF/CSV形式で出力できます。
                JGAP認証の審査資料としてもご活用いただけます。
              </p>
            </div>
          </div>
        </Card>

        {/* 期間フィルター */}
        <Card title="期間設定">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Input
              label="開始日"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
            <Input
              label="終了日"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
            <div className="flex items-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setQuickDate('this-month')}
              >
                今月
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setQuickDate('last-month')}
              >
                先月
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setQuickDate('this-year')}
              >
                今年
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
              >
                クリア
              </Button>
            </div>
          </div>
        </Card>

        {/* タブ選択 */}
        <Card>
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            <button
              onClick={() => setSelectedReport('overview')}
              className={`px-4 py-2 font-medium transition-colors ${
                selectedReport === 'overview'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              総合ダッシュボード
            </button>
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
              onClick={() => setSelectedReport('shipment')}
              className={`px-4 py-2 font-medium transition-colors ${
                selectedReport === 'shipment'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              出荷分析
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
            {selectedReport !== 'overview' && (
              <>
                <Button
                  onClick={() => exportToCSV(selectedReport as any)}
                  variant="secondary"
                >
                  <span className="material-icons mr-1 text-sm">table_chart</span>
                  CSV出力
                </Button>
                <Button
                  onClick={() => exportToPDF(selectedReport as any)}
                  variant="secondary"
                >
                  <span className="material-icons mr-1 text-sm">picture_as_pdf</span>
                  PDF出力
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* 総合ダッシュボード */}
        {selectedReport === 'overview' && (
          <>
            {/* KPI統計 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">作業件数</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalWorkRecords}</p>
                  <p className="text-xs text-gray-500 mt-1">件</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">出荷件数</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalShipments}</p>
                  <p className="text-xs text-gray-500 mt-1">件</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">総出荷量</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalShipmentQuantity.toFixed(1)}</p>
                  <p className="text-xs text-gray-500 mt-1">kg</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">総売上</p>
                  <p className="text-3xl font-bold text-orange-600">¥{Math.floor(stats.totalRevenue / 1000)}K</p>
                  <p className="text-xs text-gray-500 mt-1">¥{stats.totalRevenue.toLocaleString()}</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">作業時間</p>
                  <p className="text-3xl font-bold text-teal-600">{stats.totalWorkHours.toFixed(1)}</p>
                  <p className="text-xs text-gray-500 mt-1">時間</p>
                </div>
              </Card>
            </div>

            {/* 月別売上推移 */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">月別売上推移</h3>
              {filteredShipments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">データがありません</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getRevenueByMonth()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#f59e0b" name="売上 (円)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* 作物別売上 */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">作物別売上</h3>
              {filteredShipments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">データがありません</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getRevenueByCrop()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#10b981" name="売上 (円)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* 作業種別と出荷先 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">作業種別の分布</h3>
                {filteredWorkRecords.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">データがありません</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getWorkByType()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getWorkByType().map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">出荷先別売上（上位10件）</h3>
                {filteredShipments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">データがありません</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={getRevenueByDestination()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" name="売上 (円)" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>
          </>
        )}

        {/* 作業記録レポート */}
        {selectedReport === 'work' && (
          <>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">月別作業件数</h3>
              {filteredWorkRecords.length === 0 ? (
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
              {filteredWorkRecords.length === 0 ? (
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
                      {getWorkByType().map((_, index) => (
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

        {/* 出荷分析レポート */}
        {selectedReport === 'shipment' && (
          <>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">月別売上・出荷量</h3>
              {filteredShipments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">データがありません</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getRevenueByMonth()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#f59e0b" name="売上 (円)" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="quantity" stroke="#10b981" name="出荷量 (kg)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">作物別売上</h3>
                {filteredShipments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">データがありません</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getRevenueByCrop()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" name="売上 (円)" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">等級別出荷量</h3>
                {filteredShipments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">データがありません</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getQuantityByGrade()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getQuantityByGrade().map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">出荷先別売上（上位10件）</h3>
              {filteredShipments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">データがありません</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getRevenueByDestination()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" name="売上 (円)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </>
        )}

        {/* 資材管理レポート（既存） */}
        {selectedReport === 'material' && (
          <>
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

        {/* 農薬・肥料使用簿レポート（既存） */}
        {selectedReport === 'usage' && (
          <>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">月別使用量（農薬・肥料）</h3>
              {filteredMaterialUsages.length === 0 ? (
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
          </>
        )}
      </div>
    </Layout>
  );
}
