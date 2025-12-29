import { NextRequest, NextResponse } from 'next/server';

// 歴史上の偉人データベース
const HISTORICAL_FIGURES = [
  // 【革新と変革】タイプ
  { name: "スティーブ・ジョブズ", type: "革新と変革", subType: "テクノロジー革新者", scores: { execution: 95, humanity: 60, style: 90, charm: 95, appearance: 70 }, description: "直感とデザインで世界を変えた革新者" },
  { name: "トーマス・エジソン", type: "革新と変革", subType: "テクノロジー革新者", scores: { execution: 100, humanity: 50, style: 70, charm: 80, appearance: 50 }, description: "1000回の失敗を恐れない実験精神の持ち主" },
  { name: "ニコラ・テスラ", type: "革新と変革", subType: "テクノロジー革新者", scores: { execution: 85, humanity: 55, style: 75, charm: 70, appearance: 60 }, description: "天才的ビジョンで未来を先取りした発明家" },
  { name: "松下幸之助", type: "革新と変革", subType: "産業革命者", scores: { execution: 90, humanity: 85, style: 80, charm: 90, appearance: 65 }, description: "水道哲学で産業民主化を実現" },
  { name: "豊臣秀吉", type: "革新と変革", subType: "社会システム革新者", scores: { execution: 100, humanity: 60, style: 85, charm: 95, appearance: 55 }, description: "身分を超えて頂点に立った変革者" },
  
  // 【論理と効率】タイプ
  { name: "アルベルト・アインシュタイン", type: "論理と効率", subType: "科学的思考者", scores: { execution: 75, humanity: 80, style: 65, charm: 85, appearance: 45 }, description: "直感と論理を融合した天才物理学者" },
  { name: "アイザック・ニュートン", type: "論理と効率", subType: "科学的思考者", scores: { execution: 90, humanity: 40, style: 50, charm: 70, appearance: 40 }, description: "自然法則を数学で解明" },
  { name: "徳川家康", type: "論理と効率", subType: "戦略的経営者", scores: { execution: 95, humanity: 70, style: 60, charm: 80, appearance: 55 }, description: "忍耐と戦略で260年の平和を構築" },
  { name: "渋沢栄一", type: "論理と効率", subType: "戦略的経営者", scores: { execution: 90, humanity: 90, style: 75, charm: 85, appearance: 60 }, description: "論理と倫理を融合した経営哲学" },
  { name: "レオナルド・ダ・ヴィンチ", type: "論理と効率", subType: "システム構築者", scores: { execution: 80, humanity: 70, style: 100, charm: 90, appearance: 75 }, description: "芸術と科学を統合した万能の天才" },
  
  // 【共感とリーダーシップ】タイプ
  { name: "マハトマ・ガンジー", type: "共感とリーダーシップ", subType: "非暴力・平和主義者", scores: { execution: 100, humanity: 100, style: 95, charm: 100, appearance: 50 }, description: "非暴力で帝国に勝利" },
  { name: "ネルソン・マンデラ", type: "共感とリーダーシップ", subType: "非暴力・平和主義者", scores: { execution: 95, humanity: 100, style: 90, charm: 100, appearance: 70 }, description: "27年の投獄を経て和解を導く" },
  { name: "マーティン・ルーサー・キング", type: "共感とリーダーシップ", subType: "非暴力・平和主義者", scores: { execution: 90, humanity: 100, style: 100, charm: 95, appearance: 75 }, description: "夢と愛で社会を変革" },
  { name: "西郷隆盛", type: "共感とリーダーシップ", subType: "義と信念の指導者", scores: { execution: 90, humanity: 95, style: 70, charm: 100, appearance: 60 }, description: "義を貫き、最後まで信念を守る" },
  { name: "坂本龍馬", type: "共感とリーダーシップ", subType: "義と信念の指導者", scores: { execution: 85, humanity: 90, style: 95, charm: 100, appearance: 70 }, description: "対立を超えて新時代を構想" },
  { name: "リンカーン", type: "共感とリーダーシップ", subType: "義と信念の指導者", scores: { execution: 95, humanity: 95, style: 90, charm: 90, appearance: 55 }, description: "国家統一と奴隷解放を実現" },
  { name: "マザー・テレサ", type: "共感とリーダーシップ", subType: "慈悲と奉仕の指導者", scores: { execution: 85, humanity: 100, style: 75, charm: 95, appearance: 45 }, description: "貧者への無償の愛" },
  
  // 【芸術と表現】タイプ
  { name: "ミケランジェロ", type: "芸術と表現", subType: "視覚芸術の巨匠", scores: { execution: 90, humanity: 60, style: 100, charm: 85, appearance: 55 }, description: "神の創造を人間の手で表現" },
  { name: "葛飾北斎", type: "芸術と表現", subType: "視覚芸術の巨匠", scores: { execution: 95, humanity: 65, style: 100, charm: 75, appearance: 45 }, description: "70歳を超えて進化し続けた" },
  { name: "パブロ・ピカソ", type: "芸術と表現", subType: "視覚芸術の巨匠", scores: { execution: 85, humanity: 55, style: 100, charm: 95, appearance: 70 }, description: "様式を次々と革新" },
  { name: "ベートーヴェン", type: "芸術と表現", subType: "音楽・文学の巨匠", scores: { execution: 95, humanity: 70, style: 100, charm: 85, appearance: 50 }, description: "聴覚を失っても創造を続けた" },
  { name: "モーツァルト", type: "芸術と表現", subType: "音楽・文学の巨匠", scores: { execution: 80, humanity: 75, style: 100, charm: 95, appearance: 65 }, description: "天才的な美の創造者" },
  { name: "夏目漱石", type: "芸術と表現", subType: "音楽・文学の巨匠", scores: { execution: 75, humanity: 85, style: 95, charm: 70, appearance: 50 }, description: "近代日本の心を描いた" },
  
  // 【戦略と勝利】タイプ
  { name: "ナポレオン・ボナパルト", type: "戦略と勝利", subType: "軍事戦略家", scores: { execution: 100, humanity: 45, style: 85, charm: 100, appearance: 65 }, description: "電撃戦で欧州を制覇" },
  { name: "ユリウス・カエサル", type: "戦略と勝利", subType: "軍事戦略家", scores: { execution: 100, humanity: 60, style: 90, charm: 100, appearance: 75 }, description: "政治と軍事を統合" },
  { name: "アレクサンドロス大王", type: "戦略と勝利", subType: "軍事戦略家", scores: { execution: 100, humanity: 50, style: 85, charm: 100, appearance: 85 }, description: "30歳で世界帝国を築く" },
  { name: "織田信長", type: "戦略と勝利", subType: "戦国の覇者", scores: { execution: 100, humanity: 40, style: 90, charm: 95, appearance: 70 }, description: "革新と破壊で時代を変えた" },
  { name: "上杉謙信", type: "戦略と勝利", subType: "戦国の覇者", scores: { execution: 95, humanity: 80, style: 75, charm: 90, appearance: 65 }, description: "義を重んじた軍神" },
  { name: "武田信玄", type: "戦略と勝利", subType: "戦国の覇者", scores: { execution: 95, humanity: 75, style: 70, charm: 90, appearance: 55 }, description: "人は石垣の人材活用" },
  { name: "ウィンストン・チャーチル", type: "戦略と勝利", subType: "政治的勝利者", scores: { execution: 95, humanity: 70, style: 100, charm: 95, appearance: 50 }, description: "決して諦めない精神" },
  
  // 【哲学と思索】タイプ
  { name: "孔子", type: "哲学と思索", subType: "東洋哲学者", scores: { execution: 70, humanity: 100, style: 80, charm: 90, appearance: 50 }, description: "仁と礼の道を説いた" },
  { name: "釈迦", type: "哲学と思索", subType: "東洋哲学者", scores: { execution: 75, humanity: 100, style: 85, charm: 100, appearance: 45 }, description: "苦からの解放を説いた" },
  { name: "ソクラテス", type: "哲学と思索", subType: "西洋哲学者", scores: { execution: 65, humanity: 85, style: 90, charm: 90, appearance: 40 }, description: "無知の知を説いた" },
  { name: "アリストテレス", type: "哲学と思索", subType: "西洋哲学者", scores: { execution: 80, humanity: 75, style: 85, charm: 85, appearance: 50 }, description: "万学の祖" },
  
  // 【誠実と献身】タイプ
  { name: "野口英世", type: "誠実と献身", subType: "科学への献身者", scores: { execution: 100, humanity: 80, style: 60, charm: 75, appearance: 45 }, description: "黄熱病研究に命を捧げた" },
  { name: "フローレンス・ナイチンゲール", type: "誠実と献身", subType: "社会への献身者", scores: { execution: 95, humanity: 100, style: 75, charm: 85, appearance: 65 }, description: "看護を科学に変えた献身" },
  { name: "杉原千畝", type: "誠実と献身", subType: "社会への献身者", scores: { execution: 85, humanity: 100, style: 60, charm: 80, appearance: 55 }, description: "6000人のユダヤ人を救った" },
  
  // 【調和と共存】タイプ
  { name: "聖徳太子", type: "調和と共存", subType: "和解と統合の指導者", scores: { execution: 85, humanity: 95, style: 80, charm: 90, appearance: 60 }, description: "和を以て貴しとなす" },
];

// 回答パターンから5象限スコアを計算
function calculateScores(answers: Record<string, number>, questionHistory: any[]): { execution: number; humanity: number; style: number; charm: number; appearance: number } {
  // ベーススコア
  let execution = 50, humanity = 50, style = 50, charm = 50, appearance = 50;
  
  const answerValues = Object.values(answers) as number[];
  if (answerValues.length === 0) {
    return { execution, humanity, style, charm, appearance };
  }

  // 平均スコアと分布を計算
  const avgScore = answerValues.reduce((a, b) => a + b, 0) / answerValues.length;
  const leftCount = answerValues.filter(v => v <= 2).length;
  const rightCount = answerValues.filter(v => v >= 4).length;
  const extremeCount = answerValues.filter(v => v === 1 || v === 5).length;
  
  // 各質問への回答を分析
  questionHistory.forEach((q, idx) => {
    const answer = answers[(idx + 1).toString()] || answers[idx + 1] || 3;
    const text = q.text?.toLowerCase() || '';
    
    // 実行力に影響する質問
    if (text.includes('挑戦') || text.includes('決断') || text.includes('実行') || text.includes('目標') || text.includes('困難')) {
      execution += (answer - 3) * 6;
    }
    
    // 人間性に影響する質問
    if (text.includes('人間') || text.includes('共感') || text.includes('協調') || text.includes('集団') || text.includes('奥さん') || text.includes('愛')) {
      if (text.includes('奥さん')) {
        humanity += (5 - answer) * 8; // 左側（誠実）を選ぶと人間性UP
      } else {
        humanity += (answer - 3) * 6;
      }
    }
    
    // 表現力に影響する質問
    if (text.includes('表現') || text.includes('コミュニケーション') || text.includes('伝える') || text.includes('リーダー')) {
      style += (answer - 3) * 6;
    }
    
    // 魅力に影響する質問
    if (text.includes('影響') || text.includes('カリスマ') || text.includes('リーダー') || text.includes('憧れ')) {
      charm += (answer - 3) * 6;
    }
    
    // 外見力に影響する質問
    if (text.includes('外見') || text.includes('顔面') || text.includes('身だしなみ') || text.includes('第一印象') || text.includes('年齢')) {
      appearance += (answer - 3) * 10;
    }
    
    // 一般的な傾向
    if (text.includes('自由') || text.includes('独立')) {
      execution += (5 - answer) * 3;
      humanity += (answer - 3) * 3;
    }
    
    if (text.includes('論理') || text.includes('データ')) {
      execution += (5 - answer) * 4;
      humanity += (answer - 3) * 4;
    }
  });

  // 全体的な回答傾向を反映
  if (extremeCount > answerValues.length * 0.5) {
    // 極端な回答が多い場合、実行力とカリスマ性が高い
    execution += 10;
    charm += 10;
  }
  
  if (rightCount > leftCount) {
    humanity += 5;
    charm += 5;
  } else if (leftCount > rightCount) {
    execution += 5;
    style += 5;
  }

  // スコアを0-100の範囲に正規化
  execution = Math.max(30, Math.min(100, execution));
  humanity = Math.max(30, Math.min(100, humanity));
  style = Math.max(30, Math.min(100, style));
  charm = Math.max(30, Math.min(100, charm));
  appearance = Math.max(30, Math.min(100, appearance));

  return { execution, humanity, style, charm, appearance };
}

// 類似度を計算
function calculateSimilarity(userScores: any, figureScores: any): number {
  const weights = { execution: 1.2, humanity: 1.5, style: 1.0, charm: 1.3, appearance: 0.8 };
  let totalDiff = 0;
  let totalWeight = 0;
  
  for (const key of Object.keys(weights) as (keyof typeof weights)[]) {
    const diff = Math.abs(userScores[key] - figureScores[key]);
    totalDiff += diff * weights[key];
    totalWeight += weights[key] * 100;
  }
  
  return 100 - (totalDiff / totalWeight * 100);
}

// 価値観タイプを決定
function determineValueType(scores: any): { main: string; sub: string; description: string } {
  const types = [
    { main: "【革新と変革】", sub: "変革を恐れない挑戦者", check: () => scores.execution >= 75 && scores.style >= 65, description: "既存の枠組みを超え、新しい価値を創造することに情熱を持つタイプ" },
    { main: "【論理と効率】", sub: "冷静な分析者", check: () => scores.execution >= 70 && scores.humanity <= 60, description: "データと分析に基づき、最適解を追求するタイプ" },
    { main: "【共感とリーダーシップ】", sub: "人々を導く指導者", check: () => scores.humanity >= 80 && scores.charm >= 70, description: "人々の心を動かし、大義のために人々を導くタイプ" },
    { main: "【芸術と表現】", sub: "創造的な表現者", check: () => scores.style >= 75, description: "美と創造性を通じて人々の心に訴えるタイプ" },
    { main: "【戦略と勝利】", sub: "勝利を追求する戦略家", check: () => scores.execution >= 80 && scores.charm >= 75, description: "競争環境で最適な判断を下し、勝利を収めるタイプ" },
    { main: "【哲学と思索】", sub: "深い洞察を持つ思索者", check: () => scores.humanity >= 75 && scores.execution <= 65, description: "物事の本質を追求し、深い洞察を持つタイプ" },
    { main: "【誠実と献身】", sub: "使命に生きる献身者", check: () => scores.humanity >= 85, description: "真摯に使命に向き合い、献身的に働くタイプ" },
    { main: "【調和と共存】", sub: "調和を重んじる調停者", check: () => scores.humanity >= 70 && scores.charm >= 65 && scores.execution <= 70, description: "対立を超えて共存の道を探るタイプ" },
  ];

  for (const type of types) {
    if (type.check()) {
      return { main: type.main, sub: type.sub, description: type.description };
    }
  }

  // デフォルト
  if (scores.humanity >= scores.execution) {
    return { main: "【共感とリーダーシップ】", sub: "バランスの取れたリーダー", description: "人々との関係を大切にしながら、着実に前進するタイプ" };
  } else {
    return { main: "【論理と効率】", sub: "実践的な行動者", description: "論理的に考え、効率的に行動するタイプ" };
  }
}

// ユーザーアーキタイプを生成
function generateArchetype(scores: any, valueType: any): string {
  const archetypes = [
    { check: () => scores.execution >= 85 && scores.charm >= 85, text: "カリスマ的な変革者" },
    { check: () => scores.humanity >= 90 && scores.charm >= 80, text: "人々を癒やし導く光" },
    { check: () => scores.execution >= 80 && scores.humanity >= 80, text: "信念と共感を兼ね備えた指導者" },
    { check: () => scores.style >= 85, text: "独自の世界観を持つ表現者" },
    { check: () => scores.humanity >= 85, text: "静かな強さで人を導くビジョナリー" },
    { check: () => scores.execution >= 80, text: "不屈の意志を持つ実行者" },
    { check: () => scores.charm >= 80, text: "人を惹きつける魅力を持つ存在" },
    { check: () => scores.appearance >= 75, text: "内外ともに磨かれた存在感の持ち主" },
  ];

  for (const arch of archetypes) {
    if (arch.check()) {
      return arch.text;
    }
  }

  return "可能性を秘めた成長途上のリーダー";
}

// コアバリューを決定
function determineCoreValue(scores: any): string {
  if (scores.humanity >= 85) return "他者への思いやりと誠実さ";
  if (scores.execution >= 85) return "目標達成への強い意志";
  if (scores.charm >= 85) return "人を惹きつける信念の力";
  if (scores.style >= 85) return "自己表現と創造性";
  if (scores.humanity >= 75 && scores.execution >= 75) return "信念を持ち、行動で示す誠実さ";
  if (scores.execution >= 75) return "効率的に結果を出す実行力";
  if (scores.humanity >= 75) return "人との調和と協力";
  return "バランスの取れた総合的な成長";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    // メッセージから回答を抽出
    const userMessage = messages[0]?.content || '';
    
    // 回答を解析
    const answers: Record<string, number> = {};
    const questionHistory: any[] = [];
    
    const lines = userMessage.split('\n');
    let currentQuestion: any = null;
    
    for (const line of lines) {
      const questionMatch = line.match(/^(\d+)\.\s*(.+)/);
      if (questionMatch) {
        if (currentQuestion) {
          questionHistory.push(currentQuestion);
        }
        currentQuestion = { 
          number: parseInt(questionMatch[1]), 
          text: questionMatch[2].trim() 
        };
      }
      
      const answerMatch = line.match(/回答:\s*(\d)点/);
      if (answerMatch && currentQuestion) {
        const score = parseInt(answerMatch[1]);
        answers[currentQuestion.number.toString()] = score;
        currentQuestion.answer = score;
      }
      
      if (line.includes('左:')) {
        const leftMatch = line.match(/左:\s*([^(]+)/);
        if (leftMatch && currentQuestion) {
          currentQuestion.leftLabel = leftMatch[1].trim();
        }
      }
      
      if (line.includes('右:')) {
        const rightMatch = line.match(/右:\s*([^(]+)/);
        if (rightMatch && currentQuestion) {
          currentQuestion.rightLabel = rightMatch[1].trim();
        }
      }
    }
    
    if (currentQuestion) {
      questionHistory.push(currentQuestion);
    }

    // スコアを計算
    const scores = calculateScores(answers, questionHistory);
    
    // 類似する偉人を検索
    const figuresWithSimilarity = HISTORICAL_FIGURES.map(figure => ({
      ...figure,
      similarity: calculateSimilarity(scores, figure.scores)
    })).sort((a, b) => b.similarity - a.similarity);

    // 上位3人を選択（同じタイプが続かないように）
    const selectedFigures: typeof figuresWithSimilarity = [];
    const usedTypes = new Set<string>();
    
    for (const figure of figuresWithSimilarity) {
      if (selectedFigures.length >= 3) break;
      
      // 最初の1人は最も類似度が高い人
      if (selectedFigures.length === 0) {
        selectedFigures.push(figure);
        usedTypes.add(figure.type);
      } else {
        // 2人目以降は異なるタイプを優先
        if (!usedTypes.has(figure.type) || selectedFigures.length >= 2) {
          selectedFigures.push(figure);
          usedTypes.add(figure.type);
        }
      }
    }

    // 価値観タイプを決定
    const valueType = determineValueType(scores);
    const archetype = generateArchetype(scores, valueType);
    const coreValue = determineCoreValue(scores);

    // 1位との差分を計算
    const firstPlace = selectedFigures[0];
    const gaps = {
      execution: Math.max(0, firstPlace.scores.execution - scores.execution),
      humanity: Math.max(0, firstPlace.scores.humanity - scores.humanity),
      style: Math.max(0, firstPlace.scores.style - scores.style),
      charm: Math.max(0, firstPlace.scores.charm - scores.charm),
      appearance: Math.max(0, firstPlace.scores.appearance - scores.appearance),
    };

    // 質問分析を生成
    const questionAnalysis = questionHistory.map((q, idx) => {
      const answer = q.answer || 3;
      const text = q.text || '';
      const leftLabel = q.leftLabel || '左の選択肢';
      const rightLabel = q.rightLabel || '右の選択肢';
      
      // 各象限への影響を計算
      let impact = { execution: 0, humanity: 0, style: 0, charm: 0, appearance: 0 };
      
      if (text.includes('外見') || text.includes('顔面')) {
        impact.appearance = (answer - 3) * 8;
        impact.charm = (answer - 3) * 3;
      } else if (text.includes('奥さん') || text.includes('愛')) {
        impact.humanity = (5 - answer) * 8;
        impact.charm = (5 - answer) * 3;
      } else if (text.includes('挑戦') || text.includes('困難')) {
        impact.execution = (answer - 3) * 6;
        impact.charm = (answer - 3) * 3;
      } else if (text.includes('リーダー') || text.includes('影響')) {
        impact.charm = (answer - 3) * 5;
        impact.style = (answer - 3) * 4;
      } else if (text.includes('協調') || text.includes('集団')) {
        impact.humanity = (answer - 3) * 6;
        impact.execution = (3 - answer) * 3;
      } else {
        // デフォルト
        impact.execution = (answer - 3) * 2;
        impact.humanity = (answer - 3) * 2;
        impact.style = (answer - 3) * 2;
        impact.charm = (answer - 3) * 2;
      }

      // 選択内容を具体的に表示
      let selectedChoice: string;
      let choiceDescription: string;
      
      if (answer === 1) {
        selectedChoice = leftLabel;
        choiceDescription = `「${leftLabel}」を強く支持`;
      } else if (answer === 2) {
        selectedChoice = leftLabel;
        choiceDescription = `「${leftLabel}」寄り`;
      } else if (answer === 3) {
        selectedChoice = '中間';
        choiceDescription = `「${leftLabel}」と「${rightLabel}」の中間`;
      } else if (answer === 4) {
        selectedChoice = rightLabel;
        choiceDescription = `「${rightLabel}」寄り`;
      } else {
        selectedChoice = rightLabel;
        choiceDescription = `「${rightLabel}」を強く支持`;
      }

      return {
        questionNumber: idx + 1,
        questionText: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        fullQuestionText: text,
        leftLabel: leftLabel,
        rightLabel: rightLabel,
        userAnswer: answer,
        selectedChoice: selectedChoice,
        interpretation: choiceDescription,
        impact
      };
    });

    // 不足している要素を特定
    const weakPoints = [];
    if (gaps.execution > 20) weakPoints.push(`実行力（${scores.execution}点→${firstPlace.scores.execution}点を目指す）`);
    if (gaps.humanity > 20) weakPoints.push(`人間性（${scores.humanity}点→${firstPlace.scores.humanity}点を目指す）`);
    if (gaps.style > 20) weakPoints.push(`表現力（${scores.style}点→${firstPlace.scores.style}点を目指す）`);
    if (gaps.charm > 20) weakPoints.push(`魅力（${scores.charm}点→${firstPlace.scores.charm}点を目指す）`);
    if (gaps.appearance > 20) weakPoints.push(`外見力（${scores.appearance}点→${firstPlace.scores.appearance}点を目指す）`);

    const response = {
      isFinished: true,
      result: {
        valueType,
        userArchetype: archetype,
        coreValue,
        benchmarks: selectedFigures.map((figure, idx) => ({
          rank: idx + 1,
          name: figure.name,
          valueType: `【${figure.type}】${figure.subType}`,
          reason: idx === 0 
            ? `あなたの価値観パターン（実行力${scores.execution}点、人間性${scores.humanity}点）は、${figure.description}である${figure.name}の生き様と最も共鳴しています。`
            : `${figure.description}。あなたの持つ${scores.humanity >= 70 ? '他者への思いやり' : '行動力'}と共通する部分があります。`,
          ...(idx === 0 && {
            superiority: `${figure.name}は、あなたと同じ価値観を持ちながら、それを歴史に残る形で実現しました。特に${Object.entries(gaps).filter(([k, v]) => v > 15).map(([k]) => k === 'execution' ? '実行力' : k === 'humanity' ? '人間性' : k === 'style' ? '表現力' : k === 'charm' ? '魅力' : '外見力').join('と')}において、あなたより高いレベルに達しています。`,
            gaps
          })
        })),
        scores,
        questionAnalysis,
        positioningText: `あなたは現在、${Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] === 'execution' ? '実行力' : Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] === 'humanity' ? '人間性' : Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] === 'style' ? '表現力' : Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] === 'charm' ? '魅力' : '外見力'}において最も高いスコア（${Math.max(...Object.values(scores))}点）を持っています。${firstPlace.name}との比較では、${weakPoints.length > 0 ? weakPoints.slice(0, 2).join('と') + 'に改善の余地があります。' : '非常にバランスの取れたプロファイルです。'}`,
        actionableAdvice: `【${firstPlace.name}との差を埋めるために】

${weakPoints.length > 0 ? `あなたのレーダーチャートを見ると、${weakPoints.join('、')}の領域で${firstPlace.name}との差があります。

【具体的なアドバイス】
${gaps.execution > 15 ? `
1. **実行力を高める**
   - 毎日小さな目標を設定し、必ず達成する習慣をつける
   - 「完璧」を求めず、まず行動に移すことを優先する
   - 週に1つ、新しい挑戦をする` : ''}
${gaps.humanity > 15 ? `
2. **人間性を深める**
   - 相手の話を最後まで聴く習慣をつける
   - 週に1回は誰かの役に立つ行動をする
   - 感謝の気持ちを言葉にして伝える` : ''}
${gaps.style > 15 ? `
3. **表現力を磨く**
   - 自分の考えを毎日書き出す習慣をつける
   - 人前で話す機会を積極的に作る
   - フィードバックを求め、改善する` : ''}
${gaps.charm > 15 ? `
4. **魅力を高める**
   - 自分の信念を明確にし、それを行動で示す
   - ポジティブなエネルギーを発信する
   - 人の長所を見つけ、認める` : ''}
${gaps.appearance > 15 ? `
5. **外見力を向上させる**
   - 清潔感を常に意識する
   - 姿勢と表情を意識的に改善する
   - 自分に合ったスタイルを見つける` : ''}` : `あなたは${firstPlace.name}にかなり近いバランスを持っています。現在の強みを活かしながら、さらなる高みを目指しましょう。`}

あなたには${firstPlace.name}と同じ可能性が秘められています。一歩一歩、着実に成長していきましょう。`
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
