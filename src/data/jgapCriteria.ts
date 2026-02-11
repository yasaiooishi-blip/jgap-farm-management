import type { JGAPCriteria } from '../types';

// JGAP農場用管理点と適合基準（2022青果物）
// PDFの12ページ〜42ページの内容を詳細に構造化

export const jgapCriteria: JGAPCriteria[] = [
  // 1. 農場管理の見える化
  {
    id: 'jgap-1-1',
    sectionNumber: '1',
    sectionTitle: '農場管理の見える化',
    managementPoint: '1.1',
    description: 'JGAP適用範囲の明確化',
    criteriaLevel: '必須',
    criteriaContent: 'JGAP認証の適用範囲を明確にするために、以下の最新情報を文書化している。(1) 農場（農場名、所在地、連絡先）(2) 認証の対象となる品目（出荷の形態がある場合には出荷の形態を含む）(3) 総合規則9.2で定める認証の対象となる生産工程の範囲 (4) 圃場（圃場名等、面積、栽培品目）(5) 農産物取扱い施設（名称、所在地、取扱い品目）(6) 倉庫・保管庫（名称、所在地）(7) 外部委託先（名称、委託範囲、所在地、連絡先）',
    order: 1
  },
  {
    id: 'jgap-1-2',
    sectionNumber: '1',
    sectionTitle: '農場管理の見える化',
    managementPoint: '1.2',
    description: '地図の整備',
    criteriaLevel: '必須',
    criteriaContent: 'リスク評価に必要な情報を入手できるように地図を整備している。地図には、圃場、施設、倉庫、廃棄物の保管場所、給水場所、隣接地、糞尿等の処理・保管場所等が記載されている。',
    order: 2
  },
  {
    id: 'jgap-1-3',
    sectionNumber: '1',
    sectionTitle: '農場管理の見える化',
    managementPoint: '1.3',
    description: '生産計画',
    criteriaLevel: '必須',
    criteriaContent: '品目ごとに生産の見込み量や作業時期を文書化している。生産の実績を評価し、次年度以降の計画に活用している。',
    order: 3
  },
  {
    id: 'jgap-1-4',
    sectionNumber: '1',
    sectionTitle: '農場管理の見える化',
    managementPoint: '1.4',
    description: '記録の保管',
    criteriaLevel: '必須',
    criteriaContent: '管理点で記録が要求されているものについて、過去2年分以上保管している。必要な時に閲覧できる状態で保管している。',
    order: 4
  },
  {
    id: 'jgap-1-5',
    sectionNumber: '1',
    sectionTitle: '農場管理の見える化',
    managementPoint: '1.5',
    description: '苦情・事故・ルール違反への対応',
    criteriaLevel: '必須',
    criteriaContent: '苦情、事故、ルール違反が発生した際には、発生日、内容、応急対応、原因、是正処置等を記録している。',
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
    criteriaContent: '経営者、農場の責任者、商品管理の責任者、肥料管理の責任者、農薬管理の責任者、労働安全管理の責任者、労務管理の責任者を選任し、作業者に周知している。',
    order: 6
  },
  {
    id: 'jgap-2-2',
    sectionNumber: '2',
    sectionTitle: '経営者の責任',
    managementPoint: '2.2',
    description: '農場の責任者の責務',
    criteriaLevel: '必須',
    criteriaContent: '農場の責任者に必要な権限を与えている。農場の責任者は、基準文書を把握し、作業者に周知している。',
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
    criteriaContent: '年1回以上、すべての管理点について自己点検を実施している。不適合となった管理点を改善している。',
    order: 9
  },
  {
    id: 'jgap-2-5',
    sectionNumber: '2',
    sectionTitle: '経営者の責任',
    managementPoint: '2.5',
    description: '経営者による改善',
    criteriaLevel: '重要',
    criteriaContent: '経営者は年1回以上、自己点検結果、苦情、事故、ルール違反等を確認し、改善を指示している。その記録があり、作業者の意識を醸成している。',
    order: 10
  },
  {
    id: 'jgap-2-6',
    sectionNumber: '2',
    sectionTitle: '経営者の責任',
    managementPoint: '2.6',
    description: 'JGAPロゴマークの適切な使用',
    criteriaLevel: '必須',
    criteriaContent: 'JGAPロゴマークの使用基準を遵守し、使用許諾書を保管している。',
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
    criteriaContent: '他人の知的財産の権利を侵害していない。自らの知的財産を保護し活用している。',
    order: 13
  },

  // 3. 人権の尊重と労務管理
  {
    id: 'jgap-3-1',
    sectionNumber: '3',
    sectionTitle: '人権の尊重と労務管理',
    managementPoint: '3.1',
    description: '労務管理の責任者の責務',
    criteriaLevel: '重要',
    criteriaContent: '労務管理の責任者は、職場環境、労働条件等を統括し、労務管理に必要な知識の向上を図っている。',
    order: 14
  },
  {
    id: 'jgap-3-2',
    sectionNumber: '3',
    sectionTitle: '人権の尊重と労務管理',
    managementPoint: '3.2',
    description: '労働力の適切な確保',
    criteriaLevel: '必須',
    criteriaContent: '労働者名簿を整備している。個人情報を適切に管理している。外国人労働者の在留資格を確認している。年少者の雇用に関する法令を遵守している。',
    order: 15
  },
  {
    id: 'jgap-3-3',
    sectionNumber: '3',
    sectionTitle: '人権の尊重と労務管理',
    managementPoint: '3.3',
    description: '労働条件の提示',
    criteriaLevel: '重要',
    criteriaContent: '業務内容、期間、時間、場所、賃金、退職に関する事項を文書で提示している。',
    order: 16
  },
  {
    id: 'jgap-3-4',
    sectionNumber: '3',
    sectionTitle: '人権の尊重と労務管理',
    managementPoint: '3.4',
    description: '労働条件の遵守',
    criteriaLevel: '重要',
    criteriaContent: '法定労働時間、最低賃金、割増賃金を遵守している。賃金からの不当な控除を行っていない。',
    order: 17
  },
  {
    id: 'jgap-3-5',
    sectionNumber: '3',
    sectionTitle: '人権の尊重と労務管理',
    managementPoint: '3.5',
    description: '強制労働の禁止',
    criteriaLevel: '必須',
    criteriaContent: '奴隷労働、身体的拘束、書類の没収を行っていない。',
    order: 18
  },
  {
    id: 'jgap-3-6',
    sectionNumber: '3',
    sectionTitle: '人権の尊重と労務管理',
    managementPoint: '3.6',
    description: '使用者と労働者のコミュニケーション',
    criteriaLevel: '重要',
    criteriaContent: '年1回以上、意見交換を実施し記録している。団体交渉権を尊重している。',
    order: 19
  },
  {
    id: 'jgap-3-7',
    sectionNumber: '3',
    sectionTitle: '人権の尊重と労務管理',
    managementPoint: '3.7',
    description: '差別の禁止',
    criteriaLevel: '必須',
    criteriaContent: '人種、宗教、性別等による差別的な判断を行っていない。',
    order: 20
  },
  {
    id: 'jgap-3-8',
    sectionNumber: '3',
    sectionTitle: '人権の尊重と労務管理',
    managementPoint: '3.8',
    description: '十分な話し合いに基づく家族経営',
    criteriaLevel: '重要',
    criteriaContent: '家族間で就業環境について十分に話し合っている。',
    order: 21
  },
  {
    id: 'jgap-3-9',
    sectionNumber: '3',
    sectionTitle: '人権の尊重と労務管理',
    managementPoint: '3.9',
    description: '労働者用住居',
    criteriaLevel: '重要',
    criteriaContent: '労働者用住居は、安全で健康的な生活ができる環境を提供している。',
    order: 22
  },

  // 4. 教育訓練・入場者への注意喚起
  {
    id: 'jgap-4-1',
    sectionNumber: '4',
    sectionTitle: '教育訓練・入場者への注意喚起',
    managementPoint: '4.1',
    description: '作業者への教育訓練',
    criteriaLevel: '必須',
    criteriaContent: '年1回以上、作業者への教育訓練を実施している。理解できる言葉で指導している。記録を保管している。',
    order: 23
  },
  {
    id: 'jgap-4-2',
    sectionNumber: '4',
    sectionTitle: '教育訓練・入場者への注意喚起',
    managementPoint: '4.2',
    description: '公的な資格の保有または講習の修了',
    criteriaLevel: '必須',
    criteriaContent: '法令で義務付けられた資格または講習の修了を証明できる。',
    order: 24
  },
  {
    id: 'jgap-4-3',
    sectionNumber: '4',
    sectionTitle: '教育訓練・入場者への注意喚起',
    managementPoint: '4.3',
    description: '入場者に対する注意喚起',
    criteriaLevel: '重要',
    criteriaContent: '事故防止、食品安全、環境配慮のルールを入場者に周知している。',
    order: 25
  },

  // 5. 外部組織の管理
  {
    id: 'jgap-5-1',
    sectionNumber: '5',
    sectionTitle: '外部組織の管理',
    managementPoint: '5.1',
    description: '外部委託先との合意',
    criteriaLevel: '重要',
    criteriaContent: '外部委託の範囲、ルールの遵守、審査の受け入れ等について文書で合意している。',
    order: 26
  },
  {
    id: 'jgap-5-2',
    sectionNumber: '5',
    sectionTitle: '外部組織の管理',
    managementPoint: '5.2',
    description: '外部委託先の点検',
    criteriaLevel: '必須',
    criteriaContent: '年1回以上、外部委託先の適合状況を確認し記録している。',
    order: 27
  },
  {
    id: 'jgap-5-3',
    sectionNumber: '5',
    sectionTitle: '外部組織の管理',
    managementPoint: '5.3',
    description: '検査機関の評価・選定',
    criteriaLevel: '重要',
    criteriaContent: '登録検査機関、ISO17025認定機関等を利用している。',
    order: 28
  },

  // 6. 商品管理
  {
    id: 'jgap-6-1',
    sectionNumber: '6',
    sectionTitle: '商品管理',
    managementPoint: '6.1',
    description: '商品管理の責任者の責務',
    criteriaLevel: '重要',
    criteriaContent: '商品の規格、数量、トレーサビリティ、苦情対応を統括している。',
    order: 29
  },
  {
    id: 'jgap-6-2',
    sectionNumber: '6',
    sectionTitle: '商品管理',
    managementPoint: '6.2',
    description: 'トレーサビリティの確保',
    criteriaLevel: '必須',
    criteriaContent: '出荷から収穫、圃場までの紐付けができる。年1回トレーステストを実施している。原産地を正しく表示している。',
    order: 30
  },
  {
    id: 'jgap-6-3',
    sectionNumber: '6',
    sectionTitle: '商品管理',
    managementPoint: '6.3',
    description: '商品の苦情・異常・回収への対応手順',
    criteriaLevel: '必須',
    criteriaContent: '対応手順を文書化し、年1回見直している。',
    order: 31
  },
  {
    id: 'jgap-6-4',
    sectionNumber: '6',
    sectionTitle: '商品管理',
    managementPoint: '6.4',
    description: '商品の苦情・異常・回収への対応記録',
    criteriaLevel: '必須',
    criteriaContent: '手順に従って対応し記録している。',
    order: 32
  },
  {
    id: 'jgap-6-5',
    sectionNumber: '6',
    sectionTitle: '商品管理',
    managementPoint: '6.5',
    description: '他農場の農産物の取り扱い',
    criteriaLevel: '必須',
    criteriaContent: '識別管理と混同防止を行い、適切に表示している。',
    order: 33
  },

  // 7. 生産工程におけるリスク管理
  {
    id: 'jgap-7-1',
    sectionNumber: '7',
    sectionTitle: '生産工程におけるリスク管理',
    managementPoint: '7.1',
    description: '農産物の理解',
    criteriaLevel: '必須',
    criteriaContent: '食品安全上の留意点を把握している。',
    order: 34
  },
  {
    id: 'jgap-7-2',
    sectionNumber: '7',
    sectionTitle: '生産工程におけるリスク管理',
    managementPoint: '7.2',
    description: '工程の明確化',
    criteriaLevel: '必須',
    criteriaContent: '作業工程、資源、交差汚染箇所を文書化している。',
    order: 35
  },
  {
    id: 'jgap-7-3',
    sectionNumber: '7',
    sectionTitle: '生産工程におけるリスク管理',
    managementPoint: '7.3',
    description: 'リスク評価の実施',
    criteriaLevel: '必須',
    criteriaContent: '食品安全リスクを抽出し、低減対策を策定している。アレルゲンに配慮している。',
    order: 36
  },
  {
    id: 'jgap-7-3-1',
    sectionNumber: '7',
    sectionTitle: '生産工程におけるリスク管理',
    managementPoint: '7.3.1',
    description: '青果物特有のリスク',
    criteriaLevel: '必須',
    criteriaContent: '病原性大腸菌（生食用野菜）、パツリン（りんご、梨）を評価している。',
    order: 37
  },
  {
    id: 'jgap-7-3-2',
    sectionNumber: '7',
    sectionTitle: '生産工程におけるリスク管理',
    managementPoint: '7.3.2',
    description: '放射性物質への対応',
    criteriaLevel: '必須',
    criteriaContent: '行政の指示に基づき出荷管理を行っている。',
    order: 38
  },
  {
    id: 'jgap-7-4',
    sectionNumber: '7',
    sectionTitle: '生産工程におけるリスク管理',
    managementPoint: '7.4',
    description: '対策・ルールの周知・実施・確認',
    criteriaLevel: '必須',
    criteriaContent: '教育訓練を実施し、重要リスクへの具体的ルールを設定し確認している。',
    order: 39
  },
  {
    id: 'jgap-7-5',
    sectionNumber: '7',
    sectionTitle: '生産工程におけるリスク管理',
    managementPoint: '7.5',
    description: 'リスク評価等の見直し',
    criteriaLevel: '必須',
    criteriaContent: '年1回以上、リスク評価を見直し記録している。',
    order: 40
  },

  // 8. 作業者および入場者の衛生管理
  {
    id: 'jgap-8-1',
    sectionNumber: '8',
    sectionTitle: '作業者および入場者の衛生管理',
    managementPoint: '8.1',
    description: '健康状態の把握と対策',
    criteriaLevel: '必須',
    criteriaContent: '異常者の把握手順があり、立入禁止等の措置を講じている。',
    order: 41
  },
  {
    id: 'jgap-8-2',
    sectionNumber: '8',
    sectionTitle: '作業者および入場者の衛生管理',
    managementPoint: '8.2',
    description: '衛生管理のルール設定と周知',
    criteriaLevel: '重要',
    criteriaContent: '作業着、手洗い、行動、トイレ等のルールを文書化し周知している。',
    order: 42
  },
  {
    id: 'jgap-8-3',
    sectionNumber: '8',
    sectionTitle: '作業者および入場者の衛生管理',
    managementPoint: '8.3',
    description: '手洗い設備の整備',
    criteriaLevel: '重要',
    criteriaContent: '衛生的な水、洗浄剤、手拭等を設置し管理している。',
    order: 43
  },
  {
    id: 'jgap-8-4',
    sectionNumber: '8',
    sectionTitle: '作業者および入場者の衛生管理',
    managementPoint: '8.4',
    description: 'トイレの整備',
    criteriaLevel: '重要',
    criteriaContent: '十分な数を確保し、清掃と適切な汚物処理を行っている。',
    order: 44
  },
  {
    id: 'jgap-8-5',
    sectionNumber: '8',
    sectionTitle: '作業者および入場者の衛生管理',
    managementPoint: '8.5',
    description: '喫煙・飲食の場所の制限',
    criteriaLevel: '重要',
    criteriaContent: '場所を特定し汚染防止対策を講じている。',
    order: 45
  },

  // 9. 労働安全管理および事故発生時の対応
  {
    id: 'jgap-9-1',
    sectionNumber: '9',
    sectionTitle: '労働安全管理および事故発生時の対応',
    managementPoint: '9.1',
    description: '労働安全の責任者の責務',
    criteriaLevel: '重要',
    criteriaContent: '安全情報の入手、応急手当訓練、保護具管理を行っている。',
    order: 46
  },
  {
    id: 'jgap-9-2',
    sectionNumber: '9',
    sectionTitle: '労働安全管理および事故発生時の対応',
    managementPoint: '9.2',
    description: '事故の防止',
    criteriaLevel: '必須',
    criteriaContent: '機械使用、高所作業、熱中症等のリスク評価と対策を文書化している。',
    order: 47
  },
  {
    id: 'jgap-9-3',
    sectionNumber: '9',
    sectionTitle: '労働安全管理および事故発生時の対応',
    managementPoint: '9.3',
    description: '危険な作業に従事する要件',
    criteriaLevel: '重要',
    criteriaContent: '教育、資格、健康状態（酒気帯び禁止）、保護具を確認している。',
    order: 48
  },
  {
    id: 'jgap-9-4',
    sectionNumber: '9',
    sectionTitle: '労働安全管理および事故発生時の対応',
    managementPoint: '9.4',
    description: '事故発生時の対応',
    criteriaLevel: '重要',
    criteriaContent: '対応手順・連絡網を周知し、救急箱を設置している。',
    order: 49
  },
  {
    id: 'jgap-9-5',
    sectionNumber: '9',
    sectionTitle: '労働安全管理および事故発生時の対応',
    managementPoint: '9.5',
    description: '設備・機械・器具の安全な使用',
    criteriaLevel: '重要',
    criteriaContent: '取説遵守、改造禁止、使用前点検、公道走行ルール遵守を行っている。',
    order: 50
  },
  {
    id: 'jgap-9-6',
    sectionNumber: '9',
    sectionTitle: '労働安全管理および事故発生時の対応',
    managementPoint: '9.6',
    description: '労働災害に対する備え（強制加入）',
    criteriaLevel: '必須',
    criteriaContent: '法定保険に加入している。',
    order: 51
  },
  {
    id: 'jgap-9-7',
    sectionNumber: '9',
    sectionTitle: '労働安全管理および事故発生時の対応',
    managementPoint: '9.7',
    description: '労働災害に対する備え（任意加入等）',
    criteriaLevel: '努力',
    criteriaContent: '経営者・家族への補償対策を講じている。',
    order: 52
  },

  // 10. 設備・機械、器具等の管理
  {
    id: 'jgap-10-1-1',
    sectionNumber: '10',
    sectionTitle: '設備・機械、器具等の管理',
    managementPoint: '10.1.1',
    description: '施設・設備・機械等の管理',
    criteriaLevel: '必須',
    criteriaContent: 'リスト化し、点検・整備・清掃を実施し記録している。',
    order: 53
  },
  {
    id: 'jgap-10-1-2',
    sectionNumber: '10',
    sectionTitle: '設備・機械、器具等の管理',
    managementPoint: '10.1.2',
    description: '器具・備品や包装資材の管理',
    criteriaLevel: '必須',
    criteriaContent: '定期点検し、衛生的に保管し、誤表記を防止している。',
    order: 54
  },
  {
    id: 'jgap-10-2',
    sectionNumber: '10',
    sectionTitle: '設備・機械、器具等の管理',
    managementPoint: '10.2',
    description: '掃除道具および洗浄剤・消毒剤・機械油の管理',
    criteriaLevel: '必須',
    criteriaContent: '用途に適合し、分離保管し、使用期限を遵守している。',
    order: 55
  },
  {
    id: 'jgap-10-3',
    sectionNumber: '10',
    sectionTitle: '設備・機械、器具等の管理',
    managementPoint: '10.3',
    description: '毒物・劇物の管理',
    criteriaLevel: '重要',
    criteriaContent: '区分管理し、施錠し、表示している。',
    order: 56
  },
  {
    id: 'jgap-10-4',
    sectionNumber: '10',
    sectionTitle: '設備・機械、器具等の管理',
    managementPoint: '10.4',
    description: '商品の選別・計量機器の管理',
    criteriaLevel: '必須',
    criteriaContent: '定期的な点検と校正を実施している。',
    order: 57
  },
  {
    id: 'jgap-10-5',
    sectionNumber: '10',
    sectionTitle: '設備・機械、器具等の管理',
    managementPoint: '10.5',
    description: 'ボイラーおよび圧力容器の管理',
    criteriaLevel: '必須',
    criteriaContent: '届出し、作業主任者を選任し、自主点検を記録している。',
    order: 58
  },

  // 11. エネルギー等の管理、地球温暖化防止
  {
    id: 'jgap-11-1',
    sectionNumber: '11',
    sectionTitle: 'エネルギー等の管理、地球温暖化防止',
    managementPoint: '11.1',
    description: '燃料の管理',
    criteriaLevel: '必須',
    criteriaContent: '火気厳禁、消火器設置、漏れ・引火防止対策を講じている。',
    order: 59
  },
  {
    id: 'jgap-11-2',
    sectionNumber: '11',
    sectionTitle: 'エネルギー等の管理、地球温暖化防止',
    managementPoint: '11.2',
    description: '省エネルギーの推進',
    criteriaLevel: '重要',
    criteriaContent: '使用量を把握し、省エネ計画を実施し、再生エネを検討している。',
    order: 60
  },

  // 12. 廃棄物の管理および資源の有効利用
  {
    id: 'jgap-12-1',
    sectionNumber: '12',
    sectionTitle: '廃棄物の管理および資源の有効利用',
    managementPoint: '12.1',
    description: '廃棄物の適正処理および資源の有効利用',
    criteriaLevel: '必須',
    criteriaContent: '保管・処理方法を文書化し、削減に努めている。',
    order: 61
  },
  {
    id: 'jgap-12-2',
    sectionNumber: '12',
    sectionTitle: '廃棄物の管理および資源の有効利用',
    managementPoint: '12.2',
    description: '整理・整頓・清掃の実施',
    criteriaLevel: '必須',
    criteriaContent: '農場内を美化し、散乱を防止している。',
    order: 62
  },

  // 13. 周辺環境・生物多様性への配慮
  {
    id: 'jgap-13-1',
    sectionNumber: '13',
    sectionTitle: '周辺環境・生物多様性への配慮',
    managementPoint: '13.1',
    description: '周辺環境への配慮',
    criteriaLevel: '必須',
    criteriaContent: '騒音、悪臭、粉塵等の対策、公道への泥落下防止を行っている。',
    order: 63
  },
  {
    id: 'jgap-13-2-1',
    sectionNumber: '13',
    sectionTitle: '周辺環境・生物多様性への配慮',
    managementPoint: '13.2.1',
    description: '生物多様性への配慮①',
    criteriaLevel: '重要',
    criteriaContent: '鳥獣被害対策を講じ、自然保護地域の規制を遵守している。',
    order: 64
  },
  {
    id: 'jgap-13-2-2',
    sectionNumber: '13',
    sectionTitle: '周辺環境・生物多様性への配慮',
    managementPoint: '13.2.2',
    description: '生物多様性への配慮②',
    criteriaLevel: '努力',
    criteriaContent: '固有種を保全し、地域活動に参加している。',
    order: 65
  },
  {
    id: 'jgap-13-3',
    sectionNumber: '13',
    sectionTitle: '周辺環境・生物多様性への配慮',
    managementPoint: '13.3',
    description: '外来生物の管理',
    criteriaLevel: '重要',
    criteriaContent: '生態系に配慮し、行政指導を遵守している。',
    order: 66
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
