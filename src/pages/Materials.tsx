import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function Materials() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="material-icons mr-2 text-purple-600">inventory_2</span>
            資材管理
          </h1>
          <Button>
            <span className="material-icons mr-1 text-sm">add</span>
            新規資材登録
          </Button>
        </div>

        <Card>
          <div className="text-center py-12">
            <span className="material-icons text-8xl text-gray-300 mb-4 block">inventory_2</span>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              資材管理機能
            </h3>
            <p className="text-gray-600 mb-6">
              肥料、農薬、その他の資材の在庫管理や使用履歴を記録できます。
            </p>
            <div className="max-w-md mx-auto text-left space-y-3">
              <div className="flex items-start">
                <span className="material-icons text-green-600 mr-2">check_circle</span>
                <span className="text-gray-700">在庫数量の管理</span>
              </div>
              <div className="flex items-start">
                <span className="material-icons text-green-600 mr-2">check_circle</span>
                <span className="text-gray-700">使用履歴の記録</span>
              </div>
              <div className="flex items-start">
                <span className="material-icons text-green-600 mr-2">check_circle</span>
                <span className="text-gray-700">発注タイミングの通知</span>
              </div>
              <div className="flex items-start">
                <span className="material-icons text-green-600 mr-2">check_circle</span>
                <span className="text-gray-700">コスト分析</span>
              </div>
            </div>
            <div className="mt-8 text-sm text-gray-500">
              この機能は開発中です
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
