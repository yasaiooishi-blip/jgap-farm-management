import type { JGAPCriteria } from '../types';

// JGAP農場用管理点と適合基準（2022青果物）- 詳細版
// 適合基準の項目((1), (2), a., b. など)ごとに資料添付可能

export const jgapCriteria: JGAPCriteria[] = [
  // 1. 農場管理の見える化
  {
    id: 'jgap-1-1',
    sectionNumber: '1',
    sectionTitle: '農場管理の見える化',
    managementPoint: '1.1',
    description: 'JGAP適用範囲の明確化',
    criteriaLevel: '必須',
    criteriaContent: 'JGAP認証の適用範囲を明確にするために、以下の最新情報を文書化している。',
    criteriaItems: [
      {
        id: '1.1-1',
        label: '(1)',
        content: '農場（農場名、所在地、連絡先）'
      },
      {
        id: '1.1-2',
        label: '(2)',
        content: '認証の対象となる品目（出荷の形態がある場合には出荷の形態を含む）'
      },
      {
        id: '1.1-3',
        label: '(3)',
        content: '総合規則9.2で定める認証の対象となる生産工程の範囲'
      },
      {
        id: '1.1-4',
        label: '(4)',
        content: '圃場（圃場名等、面積、栽培品目）'
      },
      {
        id: '1.1-5',
        label: '(5)',
        content: '農産物取扱い施設（名称、所在地、取扱い品目）'
      },
      {
        id: '1.1-6',
        label: '(6)',
        content: '倉庫・保管庫（名称、所在地）'
      },
      {
        id: '1.1-7',
        label: '(7)',
        content: '外部委託先（名称、委託範囲、所在地、連絡先）'
      }
    ],
    order: 1
  },
  {
    id: 'jgap-1-2',
    sectionNumber: '1',
    sectionTitle: '農場管理の見える化',
    managementPoint: '1.2',
    description: '地図の整備',
    criteriaLevel: '必須',
    criteriaContent: 'リスク評価に活用するために、少なくとも以下の情報を記載した地図を作成している。',
    criteriaItems: [
      {
        id: '1.2-1',
        label: '(1)',
        content: '圃場'
      },
      {
        id: '1.2-2',
        label: '(2)',
        content: '農産物取扱い施設'
      },
      {
        id: '1.2-3',
        label: '(3)',
        content: '倉庫・保管庫'
      },
      {
        id: '1.2-4',
        label: '(4)',
        content: '廃棄物保管場所'
      },
      {
        id: '1.2-5',
        label: '(5)',
        content: '生産工程で利用する給水場所、貯水場所'
      },
      {
        id: '1.2-6',
        label: '(6)',
        content: '圃場に隣接する土地の利用状況'
      },
      {
        id: '1.2-7',
        label: '(7)',
        content: '農薬の残液・洗浄水の処理場所'
      }
    ],
    order: 2
  },
  {
    id: 'jgap-1-3',
    sectionNumber: '1',
    sectionTitle: '農場管理の見える化',
    managementPoint: '1.3',
    description: '生産計画',
    criteriaLevel: '必須',
    criteriaContent: '以下の項目を含む生産計画を立て、実績を評価している。',
    criteriaItems: [
      {
        id: '1.3-a',
        label: 'a.',
        content: '以下の項目を含む生産計画を立て文書化している',
        subItems: [
          { id: '1.3-a-1', label: '(1)', content: '品目ごとの生産見込量' },
          { id: '1.3-a-2', label: '(2)', content: '作業内容および実施時期' }
        ]
      },
      {
        id: '1.3-b',
        label: 'b.',
        content: '生産計画に対して実績を評価し、次年度以降の計画に活用している'
      }
    ],
    order: 3
  },
  {
    id: 'jgap-1-4',
    sectionNumber: '1',
    sectionTitle: '農場管理の見える化',
    managementPoint: '1.4',
    description: '記録の保管',
    criteriaLevel: '必須',
    criteriaContent: '管理点で記録が要求されているものについて、以下を満たしている。',
    criteriaItems: [
      {
        id: '1.4-1',
        label: '(1)',
        content: '過去2年分以上保管している（初回審査の場合は3か月分以上）'
      },
      {
        id: '1.4-2',
        label: '(2)',
        content: '法令や顧客の要求がある場合はそれに従っている'
      },
      {
        id: '1.4-3',
        label: '(3)',
        content: '必要な時に閲覧できる状態で保管している'
      }
    ],
    order: 4
  },
  {
    id: 'jgap-1-5',
    sectionNumber: '1',
    sectionTitle: '農場管理の見える化',
    managementPoint: '1.5',
    description: '苦情・事故・ルール違反への対応',
    criteriaLevel: '必須',
    criteriaContent: '苦情、事故、ルール違反が発生した際には、以下を記録している。',
    criteriaItems: [
      { id: '1.5-1', label: '(1)', content: '発生日' },
      { id: '1.5-2', label: '(2)', content: '記録日' },
      { id: '1.5-3', label: '(3)', content: '記録者' },
      { id: '1.5-4', label: '(4)', content: '内容' },
      { id: '1.5-5', label: '(5)', content: '応急対応' },
      { id: '1.5-6', label: '(6)', content: '原因' },
      { id: '1.5-7', label: '(7)', content: '是正処置' },
      { id: '1.5-8', label: '(8)', content: '確認日' }
    ],
    order: 5
  },

  // 2. 経営者の責任
  {
    id: 'jgap-2-1',
    sectionNumber: '2',
    sectionTitle: '経営者の責任',
    managementPoint: '2.1',
    description: '責任者の明確化',
    criteriaLevel: '必須',
    criteriaContent: '以下の責任者を選任し、作業者に周知している。',
    criteriaItems: [
      { id: '2.1-1', label: '(1)', content: '経営者' },
      { id: '2.1-2', label: '(2)', content: '農場の責任者' },
      { id: '2.1-3', label: '(3)', content: '商品管理の責任者' },
      { id: '2.1-4', label: '(4)', content: '肥料管理の責任者' },
      { id: '2.1-5', label: '(5)', content: '農薬管理の責任者' },
      { id: '2.1-6', label: '(6)', content: '労働安全管理の責任者' },
      { id: '2.1-7', label: '(7)', content: '労務管理の責任者' }
    ],
    order: 6
  },
  {
    id: 'jgap-2-2',
    sectionNumber: '2',
    sectionTitle: '経営者の責任',
    managementPoint: '2.2',
    description: '農場の責任者の責務',
    criteriaLevel: '必須',
    criteriaContent: '農場の責任者に必要な権限を与え、以下を実施している。',
    criteriaItems: [
      {
        id: '2.2-a',
        label: 'a.',
        content: '農場の責任者に必要な権限を与えている'
      },
      {
        id: '2.2-b',
        label: 'b.',
        content: '農場の責任者は以下を実施している',
        subItems: [
          { id: '2.2-b-1', label: '(1)', content: '管理点と適合基準を理解している' },
          { id: '2.2-b-2', label: '(2)', content: '文書の改定があった場合は、その内容を把握し作業者に周知している' }
        ]
      }
    ],
    order: 7
  },
  {
    id: 'jgap-2-3',
    sectionNumber: '2',
    sectionTitle: '経営者の責任',
    managementPoint: '2.3',
    description: '方針の策定・共有',
    criteriaLevel: '重要',
    criteriaContent: '農場管理に関する方針を文書化し、作業者に周知している。',
    order: 8
  },
  {
    id: 'jgap-2-4',
    sectionNumber: '2',
    sectionTitle: '経営者の責任',
    managementPoint: '2.4',
    description: '自己点検の実施',
    criteriaLevel: '必須',
    criteriaContent: '以下を実施している。',
    criteriaItems: [
      { id: '2.4-1', label: '(1)', content: '年1回以上、すべての管理点について自己点検を実施している' },
      { id: '2.4-2', label: '(2)', content: '不適合となった管理点を改善している' }
    ],
    order: 9
  },
  {
    id: 'jgap-2-5',
    sectionNumber: '2',
    sectionTitle: '経営者の責任',
    managementPoint: '2.5',
    description: '経営者による改善',
    criteriaLevel: '重要',
    criteriaContent: '経営者は以下を実施している。',
    criteriaItems: [
      {
        id: '2.5-a',
        label: 'a.',
        content: '年1回以上、以下を確認し、改善を指示している',
        subItems: [
          { id: '2.5-a-1', label: '(1)', content: '自己点検の結果' },
          { id: '2.5-a-2', label: '(2)', content: '苦情への対応状況' },
          { id: '2.5-a-3', label: '(3)', content: '外部審査の結果' },
          { id: '2.5-a-4', label: '(4)', content: '事故、ルール違反の記録' },
          { id: '2.5-a-5', label: '(5)', content: 'JGAP認証範囲の変更点' }
        ]
      },
      {
        id: '2.5-b',
        label: 'b.',
        content: '見直しを指示した記録がある'
      },
      {
        id: '2.5-c',
        label: 'c.',
        content: '作業者の意識を醸成している'
      }
    ],
    order: 10
  },
  {
    id: 'jgap-2-6',
    sectionNumber: '2',
    sectionTitle: '経営者の責任',
    managementPoint: '2.6',
    description: 'JGAPロゴマークの適切な使用',
    criteriaLevel: '必須',
    criteriaContent: '以下を実施している。',
    criteriaItems: [
      { id: '2.6-1', label: '(1)', content: 'JGAPロゴマークの使用基準を遵守している' },
      { id: '2.6-2', label: '(2)', content: '使用許諾書を保管している' }
    ],
    order: 11
  },
  {
    id: 'jgap-2-7',
    sectionNumber: '2',
    sectionTitle: '経営者の責任',
    managementPoint: '2.7',
    description: '経営の維持・継続のための対策',
    criteriaLevel: '重要',
    criteriaContent: '自然災害、火災、設備の故障、感染症の流行等に備えた対策や計画がある。',
    order: 12
  },
  {
    id: 'jgap-2-8',
    sectionNumber: '2',
    sectionTitle: '経営者の責任',
    managementPoint: '2.8',
    description: '知的財産の管理',
    criteriaLevel: '必須',
    criteriaContent: '以下を実施している。',
    criteriaItems: [
      { id: '2.8-1', label: '(1)', content: '他人の知的財産の権利を侵害していない' },
      { id: '2.8-2', label: '(2)', content: '自らの知的財産を保護し活用している' }
    ],
    order: 13
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
  return Array.from(sections.entries())
    .sort((a, b) => {
      const numA = parseFloat(a[0]);
      const numB = parseFloat(b[0]);
      return numA - numB;
    })
    .map(([number, title]) => ({ number, title }));
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
