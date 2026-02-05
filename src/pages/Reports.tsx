import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function Reports() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="material-icons mr-2 text-orange-600">assessment</span>
            レポート・分析
          </h1>
          <Button>
            <span className="material-icons mr-1 text-sm">download</span>
            レポート出力
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="JGAP認証レポート">
            <div className="space-y-3">
              <p className="text-gray-600">
                JGAP認証に必要な記録を自動的に集計し、レポートを作成します。
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="material-icons text-green-600 text-sm mr-2">check</span>
                  作業記録レポート
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-green-600 text-sm mr-2">check</span>
                  資材使用履歴
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-green-600 text-sm mr-2">check</span>
                  圃場管理記録
                </li>
              </ul>
              <Button variant="secondary" size="sm" className="w-full">
                認証レポート作成
              </Button>
            </div>
          </Card>

          <Card title="作業分析">
            <div className="space-y-3">
              <p className="text-gray-600">
                作業時間やコストを分析し、効率化のヒントを提供します。
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="material-icons text-blue-600 text-sm mr-2">timeline</span>
                  作業時間分析
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-blue-600 text-sm mr-2">pie_chart</span>
                  コスト分析
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-blue-600 text-sm mr-2">trending_up</span>
                  生産性分析
                </li>
              </ul>
              <Button variant="secondary" size="sm" className="w-full">
                分析レポート表示
              </Button>
            </div>
          </Card>

          <Card title="収穫量レポート">
            <div className="space-y-3">
              <p className="text-gray-600">
                圃場ごと、作物ごとの収穫量を集計し、傾向を分析します。
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="material-icons text-purple-600 text-sm mr-2">agriculture</span>
                  圃場別収穫量
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-purple-600 text-sm mr-2">calendar_today</span>
                  月別推移
                </li>
                <li className="flex items-center">
                  <span className="material-icons text-purple-600 text-sm mr-2">compare_arrows</span>
                  前年比較
                </li>
              </ul>
              <Button variant="secondary" size="sm" className="w-full">
                収穫量レポート表示
              </Button>
            </div>
          </Card>

          <Card title="データエクスポート">
            <div className="space-y-3">
              <p className="text-gray-600">
                各種データをCSV形式でエクスポートできます。
              </p>
              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full">
                  <span className="material-icons text-sm mr-1">download</span>
                  作業記録CSV
                </Button>
                <Button variant="secondary" size="sm" className="w-full">
                  <span className="material-icons text-sm mr-1">download</span>
                  圃場情報CSV
                </Button>
                <Button variant="secondary" size="sm" className="w-full">
                  <span className="material-icons text-sm mr-1">download</span>
                  資材使用CSV
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="text-center py-8 text-sm text-gray-500">
            <span className="material-icons text-6xl text-gray-300 mb-4 block">construction</span>
            <p>一部の機能は開発中です</p>
            <p className="mt-2">今後のアップデートでさらに充実した分析機能を提供予定です</p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
