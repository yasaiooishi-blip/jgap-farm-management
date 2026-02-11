import type { JGAPCriteria } from '../types';

// JGAP農場用管理点と適合基準（2022青果物）
// 10ページ〜42ページの内容を構造化

export const jgapCriteria: JGAPCriteria[] = [
  // 1. 農場の見える化
  {
    id: 'jgap-1-1',
    sectionNumber: '1',
    sectionTitle: '農場の見える化',
    managementPoint: '1.1',
    description: '農場及び生産工程の一覧表を作成している',
    criteriaLevel: '必須',
    criteriaContent: '農場及び生産工程の一覧表が作成されていること。',
    order: 1
  },
  {
    id: 'jgap-1-2',
    sectionNumber: '1',
    sectionTitle: '農場の見える化',
    managementPoint: '1.2',
    description: '農場及び生産工程の管理責任者が明確になっている',
    criteriaLevel: '必須',
    criteriaContent: '農場及び生産工程の管理責任者が明確になっていること。',
    order: 2
  },

  // 2. 経営者の責任
  {
    id: 'jgap-2-1',
    sectionNumber: '2',
    sectionTitle: '経営者の責任',
    managementPoint: '2.1',
    description: '経営者は、食品安全、環境保全、労働安全及び人権・福祉に関する方針を定めている',
    criteriaLevel: '必須',
    criteriaContent: '経営者は、食品安全、環境保全、労働安全及び人権・福祉に関する方針を文書化していること。',
    order: 3
  },
  {
    id: 'jgap-2-2',
    sectionNumber: '2',
    sectionTitle: '経営者の責任',
    managementPoint: '2.2',
    description: '経営者は、定期的に管理の実施状況を確認し、必要な改善を行っている',
    criteriaLevel: '必須',
    criteriaContent: '経営者は、年1回以上、管理の実施状況を確認し、必要な改善を行っていること。',
    order: 4
  },

  // 3. 文書・記録の管理
  {
    id: 'jgap-3-1',
    sectionNumber: '3',
    sectionTitle: '文書・記録の管理',
    managementPoint: '3.1',
    description: 'JGAP管理点と適合基準に基づく文書及び記録を作成し、保管している',
    criteriaLevel: '必須',
    criteriaContent: 'JGAP管理点と適合基準に基づく文書及び記録を作成し、適切に保管していること。',
    order: 5
  },
  {
    id: 'jgap-3-2',
    sectionNumber: '3',
    sectionTitle: '文書・記録の管理',
    managementPoint: '3.2',
    description: '記録は、追記・修正の履歴が確認できるようになっている',
    criteriaLevel: '必須',
    criteriaContent: '記録の追記・修正を行う場合は、日付と記録者を明記し、元の記録が確認できるようにしていること。',
    order: 6
  },

  // 4. 教育・訓練
  {
    id: 'jgap-4-1',
    sectionNumber: '4',
    sectionTitle: '教育・訓練',
    managementPoint: '4.1',
    description: '作業者に対して、担当する作業に必要な教育・訓練を実施している',
    criteriaLevel: '必須',
    criteriaContent: '作業者に対して、年1回以上、担当する作業に必要な教育・訓練を実施していること。',
    order: 7
  },

  // 5. 栽培前の圃場の準備
  {
    id: 'jgap-5-1',
    sectionNumber: '5',
    sectionTitle: '栽培前の圃場の準備',
    managementPoint: '5.1',
    description: '栽培する圃場の土壌診断を定期的に実施している',
    criteriaLevel: '重要',
    criteriaContent: '栽培する圃場の土壌診断を3年に1回以上実施していること。',
    order: 8
  },
  {
    id: 'jgap-5-2',
    sectionNumber: '5',
    sectionTitle: '栽培前の圃場の準備',
    managementPoint: '5.2',
    description: '作付け計画を作成している',
    criteriaLevel: '必須',
    criteriaContent: '作付け計画を作成していること。',
    order: 9
  },

  // 6. 種子・苗等の管理
  {
    id: 'jgap-6-1',
    sectionNumber: '6',
    sectionTitle: '種子・苗等の管理',
    managementPoint: '6.1',
    description: '種子・苗等の購入記録を保管している',
    criteriaLevel: '必須',
    criteriaContent: '種子・苗等の購入記録（購入先、品種、数量、購入日）を保管していること。',
    order: 10
  },

  // 7. 肥料の管理
  {
    id: 'jgap-7-1',
    sectionNumber: '7',
    sectionTitle: '肥料の管理',
    managementPoint: '7.1',
    description: '施肥計画を作成している',
    criteriaLevel: '必須',
    criteriaContent: '施肥計画を作成していること。',
    order: 11
  },
  {
    id: 'jgap-7-2',
    sectionNumber: '7',
    sectionTitle: '肥料の管理',
    managementPoint: '7.2',
    description: '肥料の購入・使用記録を保管している',
    criteriaLevel: '必須',
    criteriaContent: '肥料の購入記録及び使用記録を保管していること。',
    order: 12
  },
  {
    id: 'jgap-7-3',
    sectionNumber: '7',
    sectionTitle: '肥料の管理',
    managementPoint: '7.3',
    description: '肥料を適切に保管している',
    criteriaLevel: '必須',
    criteriaContent: '肥料を適切な場所に保管し、種類ごとに区分していること。',
    order: 13
  },

  // 8. 農薬の管理
  {
    id: 'jgap-8-1',
    sectionNumber: '8',
    sectionTitle: '農薬の管理',
    managementPoint: '8.1',
    description: '病害虫・雑草の防除計画を作成している',
    criteriaLevel: '必須',
    criteriaContent: '病害虫・雑草の防除計画を作成していること。',
    order: 14
  },
  {
    id: 'jgap-8-2',
    sectionNumber: '8',
    sectionTitle: '農薬の管理',
    managementPoint: '8.2',
    description: '農薬の購入・使用記録を保管している',
    criteriaLevel: '必須',
    criteriaContent: '農薬の購入記録及び使用記録を保管していること。',
    order: 15
  },
  {
    id: 'jgap-8-3',
    sectionNumber: '8',
    sectionTitle: '農薬の管理',
    managementPoint: '8.3',
    description: '農薬を適切に保管している',
    criteriaLevel: '必須',
    criteriaContent: '農薬を鍵のかかる専用の保管庫に保管していること。',
    order: 16
  },

  // 9. 水の管理
  {
    id: 'jgap-9-1',
    sectionNumber: '9',
    sectionTitle: '水の管理',
    managementPoint: '9.1',
    description: '栽培に使用する水の水源及び水質を把握している',
    criteriaLevel: '必須',
    criteriaContent: '栽培に使用する水の水源及び水質を把握していること。',
    order: 17
  },
  {
    id: 'jgap-9-2',
    sectionNumber: '9',
    sectionTitle: '水の管理',
    managementPoint: '9.2',
    description: '栽培に使用する水の水質検査を定期的に実施している',
    criteriaLevel: '重要',
    criteriaContent: '栽培に使用する水の水質検査を年1回以上実施していること。',
    order: 18
  },

  // 10. 収穫・調製
  {
    id: 'jgap-10-1',
    sectionNumber: '10',
    sectionTitle: '収穫・調製',
    managementPoint: '10.1',
    description: '収穫・調製作業の手順を文書化している',
    criteriaLevel: '必須',
    criteriaContent: '収穫・調製作業の手順を文書化していること。',
    order: 19
  },
  {
    id: 'jgap-10-2',
    sectionNumber: '10',
    sectionTitle: '収穫・調製',
    managementPoint: '10.2',
    description: '収穫・調製に使用する器具及び容器を清潔に保っている',
    criteriaLevel: '必須',
    criteriaContent: '収穫・調製に使用する器具及び容器を清潔に保っていること。',
    order: 20
  },

  // 11. 選別・選果
  {
    id: 'jgap-11-1',
    sectionNumber: '11',
    sectionTitle: '選別・選果',
    managementPoint: '11.1',
    description: '選別・選果作業の手順を文書化している',
    criteriaLevel: '必須',
    criteriaContent: '選別・選果作業の手順を文書化していること。',
    order: 21
  },

  // 12. 保管・出荷
  {
    id: 'jgap-12-1',
    sectionNumber: '12',
    sectionTitle: '保管・出荷',
    managementPoint: '12.1',
    description: '農産物を適切な場所に保管している',
    criteriaLevel: '必須',
    criteriaContent: '農産物を清潔な場所に保管していること。',
    order: 22
  },
  {
    id: 'jgap-12-2',
    sectionNumber: '12',
    sectionTitle: '保管・出荷',
    managementPoint: '12.2',
    description: '出荷記録を保管している',
    criteriaLevel: '必須',
    criteriaContent: '出荷記録（出荷先、品目、数量、出荷日）を保管していること。',
    order: 23
  },

  // 13. トレーサビリティ
  {
    id: 'jgap-13-1',
    sectionNumber: '13',
    sectionTitle: 'トレーサビリティ',
    managementPoint: '13.1',
    description: '農産物のロット管理を行っている',
    criteriaLevel: '必須',
    criteriaContent: '農産物のロット管理を行い、出荷記録から生産記録まで追跡できること。',
    order: 24
  },

  // 14. 製品回収
  {
    id: 'jgap-14-1',
    sectionNumber: '14',
    sectionTitle: '製品回収',
    managementPoint: '14.1',
    description: '製品回収の手順を文書化している',
    criteriaLevel: '必須',
    criteriaContent: '製品回収の手順を文書化していること。',
    order: 25
  },

  // 15. 苦情対応
  {
    id: 'jgap-15-1',
    sectionNumber: '15',
    sectionTitle: '苦情対応',
    managementPoint: '15.1',
    description: '顧客等からの苦情に対応する手順を文書化している',
    criteriaLevel: '必須',
    criteriaContent: '顧客等からの苦情に対応する手順を文書化していること。',
    order: 26
  },

  // 16. 農場の施設及び設備の管理
  {
    id: 'jgap-16-1',
    sectionNumber: '16',
    sectionTitle: '農場の施設及び設備の管理',
    managementPoint: '16.1',
    description: '農場の施設及び設備を適切に管理している',
    criteriaLevel: '必須',
    criteriaContent: '農場の施設及び設備を適切に管理していること。',
    order: 27
  },

  // 17. 労働安全
  {
    id: 'jgap-17-1',
    sectionNumber: '17',
    sectionTitle: '労働安全',
    managementPoint: '17.1',
    description: '作業者の安全衛生に関する手順を文書化している',
    criteriaLevel: '必須',
    criteriaContent: '作業者の安全衛生に関する手順を文書化していること。',
    order: 28
  },
  {
    id: 'jgap-17-2',
    sectionNumber: '17',
    sectionTitle: '労働安全',
    managementPoint: '17.2',
    description: '危険な作業を特定し、必要な対策を実施している',
    criteriaLevel: '必須',
    criteriaContent: '危険な作業を特定し、必要な対策を実施していること。',
    order: 29
  },

  // 18. 環境保全
  {
    id: 'jgap-18-1',
    sectionNumber: '18',
    sectionTitle: '環境保全',
    managementPoint: '18.1',
    description: '廃棄物を適切に処理している',
    criteriaLevel: '必須',
    criteriaContent: '廃棄物を法令に従って適切に処理していること。',
    order: 30
  },
  {
    id: 'jgap-18-2',
    sectionNumber: '18',
    sectionTitle: '環境保全',
    managementPoint: '18.2',
    description: 'エネルギー使用の削減に取り組んでいる',
    criteriaLevel: '推奨',
    criteriaContent: 'エネルギー使用の削減に取り組んでいること。',
    order: 31
  },

  // 19. 人権・福祉
  {
    id: 'jgap-19-1',
    sectionNumber: '19',
    sectionTitle: '人権・福祉',
    managementPoint: '19.1',
    description: '作業者の人権を尊重している',
    criteriaLevel: '必須',
    criteriaContent: '作業者の人権を尊重し、差別や虐待を行っていないこと。',
    order: 32
  },
  {
    id: 'jgap-19-2',
    sectionNumber: '19',
    sectionTitle: '人権・福祉',
    managementPoint: '19.2',
    description: '作業者の労働条件を適切に管理している',
    criteriaLevel: '必須',
    criteriaContent: '作業者の労働条件を法令に従って適切に管理していること。',
    order: 33
  }
];

// セクションのリストを取得
export const getSections = (): { number: string; title: string }[] => {
  const sections = new Map<string, string>();
  jgapCriteria.forEach(criteria => {
    if (!sections.has(criteria.sectionNumber)) {
      sections.set(criteria.sectionNumber, criteria.sectionTitle);
    }
  });
  return Array.from(sections.entries()).map(([number, title]) => ({ number, title }));
};

// セクションごとの管理点を取得
export const getCriteriaBySection = (sectionNumber: string): JGAPCriteria[] => {
  return jgapCriteria.filter(criteria => criteria.sectionNumber === sectionNumber);
};

// 検索機能
export const searchCriteria = (query: string): JGAPCriteria[] => {
  const lowerQuery = query.toLowerCase();
  return jgapCriteria.filter(criteria =>
    criteria.managementPoint.toLowerCase().includes(lowerQuery) ||
    criteria.description.toLowerCase().includes(lowerQuery) ||
    criteria.criteriaContent.toLowerCase().includes(lowerQuery) ||
    criteria.sectionTitle.toLowerCase().includes(lowerQuery)
  );
};
