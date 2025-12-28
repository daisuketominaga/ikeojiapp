import { NextRequest, NextResponse } from 'next/server';

const QUESTION_PROMPT = `あなたは、人間の深層心理と可能性を見抜く、世界最高峰のプロファイリングAIです。
ユーザーの回答履歴に基づいて、その人の価値観により深くフォーカスした次の質問を生成してください。

### 質問生成のルール

1. **回答履歴の分析**
   - これまでの回答パターンから、ユーザーの価値観の傾向を把握
   - 左寄り（1-2点）の回答が多い領域と、右寄り（4-5点）の回答が多い領域を特定
   - 中間（3点）が多い場合は、より深掘りが必要な領域

2. **質問の深掘り**
   - 回答数が少ない（1-5問）: 基本的な価値観を探る質問
   - 回答数が中程度（6-15問）: 特定の価値観領域を深掘りする質問
   - 回答数が多い（16-20問）: より具体的で深い価値観を探る質問

3. **具体的事例の生成**
   - ユーザーのこれまでの回答パターンに基づいて、その人に合った具体的事例を生成
   - 例：個人の自由を重視する回答が多い場合 → 「転職を決断する際、あなたは...」のような具体的事例
   - 例：集団の調和を重視する回答が多い場合 → 「チームで意見が対立した時、あなたは...」のような具体的事例

4. **質問の構造**
   - 対極的な2つの価値観を提示
   - 左側（1点）と右側（5点）のラベルを明確に
   - その人に合った具体的事例を含める

### 出力フォーマット (JSON)
{
  "question": {
    "text": "（質問文。ユーザーに合った具体的事例を含める）",
    "leftLabel": "（左側の価値観。1点）",
    "rightLabel": "（右側の価値観。5点）",
    "example": "（その人に合った具体的事例。例：転職を決断する際、あなたは個人のキャリアを優先しますか、それとも家族との時間を優先しますか？）"
  },
  "reason": "（なぜこの質問を選んだのか。ユーザーの回答パターンに基づく理由）"
}`;

// 質問プール（質問数と回答パターンに応じて選択）
const QUESTION_POOL: Array<{
  id: number;
  text: string;
  leftLabel: string;
  rightLabel: string;
  examples: Array<{ left: string; right: string; }>;
  stage: 'early' | 'mid' | 'late';
  priority: number; // 優先度（低いほど優先）
  isRequired?: boolean; // 必須質問フラグ
}> = [
  // 初期段階（1-7問）
  {
    id: 1,
    text: 'あなたはどちらを重視しますか？',
    leftLabel: '個人の自由と独立',
    rightLabel: '集団の調和と協調',
    examples: [
      { left: '転職を決断する際、あなたは個人のキャリア成長を優先しますか？', right: 'それとも現在のチームとの関係を優先しますか？' },
      { left: '週末の過ごし方で、一人で自由に行動したいですか？', right: 'それとも家族や友人との時間を大切にしますか？' },
      { left: '新しい環境に移る時、自分のペースで進めたいですか？', right: 'それとも周囲に合わせて調和を保ちたいですか？' }
    ],
    stage: 'early',
    priority: 1
  },
  {
    id: 2,
    text: '困難な状況では？',
    leftLabel: '論理とデータで判断',
    rightLabel: '直感と感情で判断',
    examples: [
      { left: '重要なプロジェクトで失敗の可能性がある時、データ分析を重視しますか？', right: 'それともチームメンバーの感情やモチベーションを重視しますか？' },
      { left: '投資判断をする際、市場データと統計を基に決めますか？', right: 'それとも直感や将来への期待を重視しますか？' },
      { left: '人間関係のトラブルで、論理的に解決策を提示しますか？', right: 'それとも相手の気持ちに寄り添いますか？' }
    ],
    stage: 'early',
    priority: 2
  },
  {
    id: 3,
    text: 'リーダーシップのスタイルは？',
    leftLabel: '先頭に立って引っ張る',
    rightLabel: '後ろから支えて導く',
    examples: [
      { left: 'チームで困難な課題に直面した時、先頭に立って解決策を示しますか？', right: 'それともメンバーを支えて導きますか？' },
      { left: '新しいプロジェクトを始める時、自ら率先して動きますか？', right: 'それともメンバーの意見を聞いてから進めますか？' },
      { left: '目標達成のために、自分が先頭に立って引っ張りますか？', right: 'それともメンバーを後ろから支えますか？' }
    ],
    stage: 'early',
    priority: 3
  },
  {
    id: 4,
    text: '他人からの評価で重視するのは？',
    leftLabel: '能力と成果',
    rightLabel: '人柄と信頼',
    examples: [
      { left: '昇進の評価で、成果や実績を重視されますか？', right: 'それとも人柄や信頼関係を重視されますか？' },
      { left: '同僚からの評価で、仕事の能力を認められたいですか？', right: 'それとも人間として信頼されたいですか？' },
      { left: '上司からの評価で、結果を出したことを評価されたいですか？', right: 'それとも誠実さや人柄を評価されたいですか？' }
    ],
    stage: 'early',
    priority: 4
  },
  {
    id: 5,
    text: '人生で最も譲れないものは？',
    leftLabel: '成功と達成',
    rightLabel: '愛とつながり',
    examples: [
      { left: 'キャリアの成功と家族の時間、どちらを優先しますか？', right: 'それとも家族との時間を優先しますか？' },
      { left: '目標達成のために、個人の時間を犠牲にできますか？', right: 'それとも大切な人との時間を守りますか？' },
      { left: '大きな成功を掴むために、人間関係を犠牲にできますか？', right: 'それとも人間関係を最優先にしますか？' }
    ],
    stage: 'early',
    priority: 5
  },
  {
    id: 6,
    text: 'ストレス対処法は？',
    leftLabel: '一人で考える時間',
    rightLabel: '誰かと話す時間',
    examples: [
      { left: '仕事でストレスを感じた時、一人で静かに考える時間が必要ですか？', right: 'それとも誰かと話して気持ちを共有したいですか？' },
      { left: '悩みがある時、一人で解決策を見つけたいですか？', right: 'それとも信頼できる人に相談したいですか？' },
      { left: '疲れた時、一人でリラックスしたいですか？', right: 'それとも誰かと一緒に過ごしたいですか？' }
    ],
    stage: 'early',
    priority: 6
  },
  {
    id: 7,
    text: 'あなたの強みは？',
    leftLabel: '実行力と効率',
    rightLabel: '共感力と理解',
    examples: [
      { left: 'プロジェクトを進める際、効率的に実行する能力を発揮しますか？', right: 'それともチームメンバーの気持ちを理解する能力を発揮しますか？' },
      { left: '目標達成のために、迅速に行動できますか？', right: 'それとも相手の立場を理解してから行動しますか？' },
      { left: '仕事で、タスクを効率的に処理することを重視しますか？', right: 'それとも人間関係を大切にしますか？' }
    ],
    stage: 'early',
    priority: 7
  },
  // 中盤（8-14問）
  {
    id: 8,
    text: '理想の休日は？',
    leftLabel: '新しい挑戦と冒険',
    rightLabel: '静かな休息とリラックス',
    examples: [
      { left: '休日は新しい場所を訪れたり、新しいことに挑戦したいですか？', right: 'それとも家で静かに過ごしたいですか？' },
      { left: '週末はアクティブに動きたいですか？', right: 'それとものんびりと過ごしたいですか？' },
      { left: '休みの日は冒険的な体験をしたいですか？', right: 'それとも穏やかな時間を過ごしたいですか？' }
    ],
    stage: 'mid',
    priority: 1
  },
  {
    id: 9,
    text: '人間関係で重視するのは？',
    leftLabel: '率直さと誠実さ',
    rightLabel: '思いやりと配慮',
    examples: [
      { left: '友人との関係で、率直に意見を言うことを重視しますか？', right: 'それとも相手の気持ちを配慮しますか？' },
      { left: '意見が対立した時、正直に自分の考えを伝えますか？', right: 'それとも相手を傷つけないよう配慮しますか？' },
      { left: '人間関係で、誠実さを最優先にしますか？', right: 'それとも思いやりを最優先にしますか？' }
    ],
    stage: 'mid',
    priority: 2
  },
  {
    id: 10,
    text: '理想の自分は？',
    leftLabel: '影響力のある存在',
    rightLabel: '支えとなる存在',
    examples: [
      { left: '10年後、多くの人に影響を与える存在になりたいですか？', right: 'それとも大切な人を支える存在になりたいですか？' },
      { left: '社会で、リーダーとして影響力を持ちたいですか？', right: 'それとも誰かの支えになりたいですか？' },
      { left: '人生で、多くの人を導く存在になりたいですか？', right: 'それとも誰かを支える存在になりたいですか？' }
    ],
    stage: 'mid',
    priority: 3
  },
  {
    id: 11,
    text: 'あなたの行動原理は？',
    leftLabel: '可能性を広げる',
    rightLabel: '本質を深める',
    examples: [
      { left: '新しいスキルを学ぶ際、幅広い知識を身につけたいですか？', right: 'それとも特定の分野を深く極めたいですか？' },
      { left: 'キャリアで、様々な経験を積みたいですか？', right: 'それとも一つの分野を極めたいですか？' },
      { left: '人生で、多くの可能性を広げたいですか？', right: 'それとも深い理解を獲得したいですか？' }
    ],
    stage: 'mid',
    priority: 4
  },
  {
    id: 12,
    text: '仕事や活動において、何を優先しますか？',
    leftLabel: '結果と成果',
    rightLabel: '過程と成長',
    examples: [
      { left: 'プロジェクトで、最終的な成果を重視しますか？', right: 'それともプロセスでの学びや成長を重視しますか？' },
      { left: '目標達成のために、結果だけを重視しますか？', right: 'それとも過程での経験を重視しますか？' },
      { left: '評価される時、成果を評価されたいですか？', right: 'それとも努力や成長を評価されたいですか？' }
    ],
    stage: 'mid',
    priority: 5
  },
  {
    id: 13,
    text: 'あなたの人生哲学は？',
    leftLabel: '変革と革新',
    rightLabel: '伝統と継承',
    examples: [
      { left: '社会を変えるために、新しいアイデアを実現したいですか？', right: 'それとも伝統的な価値観を守りたいですか？' },
      { left: '組織で、革新的な改革を推進したいですか？', right: 'それとも既存の文化を継承したいですか？' },
      { left: '人生で、新しいことに挑戦したいですか？', right: 'それとも伝統を大切にしたいですか？' }
    ],
    stage: 'mid',
    priority: 6
  },
  {
    id: 14,
    text: '他人に影響を与えるとき、どのような方法を使いますか？',
    leftLabel: '言葉と論理で説得',
    rightLabel: '行動と姿勢で示す',
    examples: [
      { left: '意見を伝える時、論理的に説明して説得しますか？', right: 'それとも行動で示しますか？' },
      { left: 'チームを導く時、言葉で明確に指示しますか？', right: 'それとも背中で示しますか？' },
      { left: '影響を与える時、説得力のある言葉を使いますか？', right: 'それとも行動で示しますか？' }
    ],
    stage: 'mid',
    priority: 7
  },
  // 後半（15-20問）
  {
    id: 15,
    text: 'あなたが最も憧れる人物の特徴は？',
    leftLabel: 'カリスマ性と魅力',
    rightLabel: '誠実さと信頼性',
    examples: [
      { left: '憧れる人は、多くの人を魅了するカリスマ性を持っていますか？', right: 'それとも誠実で信頼できる人ですか？' },
      { left: '理想の人物は、影響力のある存在ですか？', right: 'それとも信頼できる存在ですか？' },
      { left: '尊敬する人は、魅力的な人ですか？', right: 'それとも誠実な人ですか？' }
    ],
    stage: 'late',
    priority: 1
  },
  {
    id: 16,
    text: '困難な決断を迫られたとき、何を基準に判断しますか？',
    leftLabel: '最適解を追求',
    rightLabel: '価値観を優先',
    examples: [
      { left: '重要な決断で、データに基づいた最適解を選びますか？', right: 'それとも自分の価値観に基づいて決めますか？' },
      { left: '選択に迷った時、論理的な判断をしますか？', right: 'それとも心の声を聞きますか？' },
      { left: '決断する時、効率性を重視しますか？', right: 'それとも信念を重視しますか？' }
    ],
    stage: 'late',
    priority: 2
  },
  {
    id: 17,
    text: 'あなたのコミュニケーションスタイルは？',
    leftLabel: '明確で直接的',
    rightLabel: '柔らかく間接的',
    examples: [
      { left: '意見を伝える時、はっきりと直接的に伝えますか？', right: 'それとも柔らかく間接的に伝えますか？' },
      { left: 'フィードバックをする時、率直に伝えますか？', right: 'それとも配慮して伝えますか？' },
      { left: 'コミュニケーションで、明確さを重視しますか？', right: 'それとも和を重視しますか？' }
    ],
    stage: 'late',
    priority: 3
  },
  {
    id: 18,
    text: '成功とは何だと思いますか？',
    leftLabel: '目標達成と勝利',
    rightLabel: '充実感と満足',
    examples: [
      { left: '成功は、目標を達成することだと思いますか？', right: 'それとも充実感を感じることだと思いますか？' },
      { left: '成功の基準は、結果や成果ですか？', right: 'それとも満足感ですか？' },
      { left: '成功とは、勝利することですか？', right: 'それとも幸せを感じることですか？' }
    ],
    stage: 'late',
    priority: 4
  },
  {
    id: 19,
    text: 'あなたが最も大切にする人間関係は？',
    leftLabel: '刺激的な関係',
    rightLabel: '安定した関係',
    examples: [
      { left: '人間関係で、刺激的で新しい発見がある関係を大切にしますか？', right: 'それとも安定した信頼関係を大切にしますか？' },
      { left: '友人関係で、新しい体験を共有する関係を重視しますか？', right: 'それとも長く続く安定した関係を重視しますか？' },
      { left: '人間関係で、変化や成長を促す関係を選びますか？', right: 'それとも安心できる関係を選びますか？' }
    ],
    stage: 'late',
    priority: 5
  },
  {
    id: 20,
    text: '10年後の自分はどうなっていたいですか？',
    leftLabel: '新しい領域を開拓',
    rightLabel: '深い理解を獲得',
    examples: [
      { left: '10年後、新しい分野で活躍したいですか？', right: 'それとも現在の分野で深い専門性を獲得したいですか？' },
      { left: '将来、様々な経験を積みたいですか？', right: 'それとも一つのことを極めたいですか？' },
      { left: '10年後、広い視野を持ちたいですか？', right: 'それとも深い知識を持ちたいですか？' }
    ],
    stage: 'late',
    priority: 6
  },
  // 必須質問（必ず1回含める）
  {
    id: 21,
    text: 'あなたには奥さんがいます。その上で何が大切だと考えますか？',
    leftLabel: '奥様への絶対的な愛の誓い',
    rightLabel: '誰にも絶対に分からなければ自分の性欲に正直になる',
    examples: [
      { left: '結婚した以上、奥様への愛と忠誠を最優先にしますか？', right: 'それとも、誰にも分からなければ自分の欲望に正直になりますか？' },
      { left: '結婚生活では、奥様への誠実さを守りますか？', right: 'それとも、バレなければ自分の欲求を満たしますか？' },
      { left: 'パートナーシップで、絶対的な信頼関係を築きますか？', right: 'それとも、秘密があっても問題ないと考えますか？' }
    ],
    stage: 'mid', // 中盤で必ず含める
    priority: 0, // 最高優先度
    isRequired: true // 必須フラグ
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers, questionCount, questionHistory } = body; // questionHistoryを追加

    // デバッグ情報をログに出力
    console.log('=== 質問生成API デバッグ情報 ===');
    console.log('質問数:', questionCount);
    console.log('回答数:', Object.keys(answers).length);
    console.log('回答内容:', answers);
    console.log('質問履歴数:', questionHistory?.length || 0);
    console.log('質問履歴:', JSON.stringify(questionHistory, null, 2));

    // 最初の質問の場合は固定の質問を返す
    if (questionCount === 0) {
      const firstQuestion = QUESTION_POOL.find(q => q.id === 1)!;
      const firstExample = firstQuestion.examples[0]; // 最初の具体例を使用
      console.log('最初の質問を返します:', firstQuestion.id, firstQuestion.text);
      return NextResponse.json({
        question: {
          id: firstQuestion.id,
          text: firstQuestion.text,
          leftLabel: firstQuestion.leftLabel,
          rightLabel: firstQuestion.rightLabel,
          example: `${firstExample.left} ${firstExample.right}`
        },
        reason: '最初の質問として、基本的な価値観を探ります。'
      });
    }
    
    // 回答パターンを分析
    const answerValues = Object.values(answers) as number[];
    const averageScore = answerValues.reduce((sum, score) => sum + score, 0) / questionCount;
    
    // 回答の分布を分析
    const leftAnswers = answerValues.filter(s => s <= 2).length;
    const middleAnswers = answerValues.filter(s => s === 3).length;
    const rightAnswers = answerValues.filter(s => s >= 4).length;
    
    // 最近の回答の傾向（最後の3問、または全ての回答）
    const recentAnswers = answerValues.slice(-Math.min(3, answerValues.length));
    const recentAverage = recentAnswers.length > 0 
      ? recentAnswers.reduce((sum, score) => sum + score, 0) / recentAnswers.length 
      : averageScore;
    
    // 質問のステージを決定（15問に調整）
    let stage: 'early' | 'mid' | 'late';
    if (questionCount <= 5) {
      stage = 'early';
    } else if (questionCount <= 10) {
      stage = 'mid';
    } else {
      stage = 'late';
    }
    
    // 既に使用された質問IDを確実に取得（テキストも含めてチェック）
    const usedQuestionIds: number[] = [];
    const usedQuestionTexts: string[] = [];
    
    if (questionHistory && Array.isArray(questionHistory)) {
      questionHistory.forEach((q: any) => {
        if (q.id && typeof q.id === 'number') {
          usedQuestionIds.push(q.id);
        }
        if (q.text && typeof q.text === 'string') {
          usedQuestionTexts.push(q.text);
        }
      });
    }
    
    console.log('使用済み質問ID:', usedQuestionIds);
    console.log('使用済み質問テキスト:', usedQuestionTexts);
    
    // 必須質問（id: 21）がまだ使用されていないかチェック
    const requiredQuestion = QUESTION_POOL.find(q => q.id === 21);
    const isRequiredQuestionUsed = usedQuestionIds.includes(21) || usedQuestionTexts.some(text => text.includes('奥さんがいます'));
    
    // ステージに合う質問をフィルタリング
    let availableQuestions = QUESTION_POOL.filter(q => q.stage === stage);
    
    // 必須質問が未使用で、中盤以降の場合は必須質問を優先的に追加（15問に調整）
    if (!isRequiredQuestionUsed && questionCount >= 5 && questionCount <= 10 && requiredQuestion) {
      // 必須質問を利用可能な質問リストの先頭に追加
      availableQuestions = [requiredQuestion, ...availableQuestions.filter(q => q.id !== 21)];
      console.log('必須質問（id: 21）を優先的に追加しました');
    }
    
    console.log('ステージ:', stage, '利用可能な質問数:', availableQuestions.length);
    console.log('利用可能な質問ID:', availableQuestions.map(q => q.id));
    
    // 既に使用された質問を完全に除外（IDとテキストの両方でチェック）
    const unusedQuestions = availableQuestions.filter(q => {
      const isIdUsed = usedQuestionIds.includes(q.id);
      const isTextUsed = usedQuestionTexts.includes(q.text);
      const isUnused = !isIdUsed && !isTextUsed;
      if (!isUnused) {
        console.log(`質問 ${q.id} (${q.text}) は使用済み - ID使用: ${isIdUsed}, テキスト使用: ${isTextUsed}`);
      }
      return isUnused;
    });
    console.log('未使用の質問数:', unusedQuestions.length);
    console.log('未使用の質問ID:', unusedQuestions.map(q => q.id));
    
    // 必須質問が未使用で、中盤以降の場合は必須質問を優先的に選択（15問に調整）
    let selectedQuestion: typeof QUESTION_POOL[0] | undefined;
    if (!isRequiredQuestionUsed && questionCount >= 5 && questionCount <= 10 && requiredQuestion) {
      const requiredInUnused = unusedQuestions.find(q => q.id === 21);
      if (requiredInUnused) {
        console.log('必須質問（id: 21）を優先的に選択します');
        selectedQuestion = requiredInUnused;
      }
    }
    
    // 使用可能な質問を決定
    let questionsToChooseFrom: typeof QUESTION_POOL;
    if (unusedQuestions.length > 0) {
      questionsToChooseFrom = unusedQuestions;
    } else {
      // 全て使用済みの場合は、ステージ内の質問を再利用（ただし、直前の質問は必ず避ける）
      const lastQuestionId = usedQuestionIds.length > 0 ? usedQuestionIds[usedQuestionIds.length - 1] : null;
      const lastQuestionText = usedQuestionTexts.length > 0 ? usedQuestionTexts[usedQuestionTexts.length - 1] : null;
      
      questionsToChooseFrom = availableQuestions.filter(q => {
        const isLastQuestion = (lastQuestionId && q.id === lastQuestionId) || 
                               (lastQuestionText && q.text === lastQuestionText);
        return !isLastQuestion;
      });
      
      // それでも選択肢がない場合は、ステージ内の全ての質問から選択（ただし最後の質問は避ける）
      if (questionsToChooseFrom.length === 0) {
        questionsToChooseFrom = availableQuestions.filter(q => {
          if (lastQuestionId && q.id === lastQuestionId) return false;
          if (lastQuestionText && q.text === lastQuestionText) return false;
          return true;
        });
        // それでも選択肢がない場合は、ステージ内の全ての質問を使用
        if (questionsToChooseFrom.length === 0) {
          questionsToChooseFrom = availableQuestions;
        }
      }
    }
    
    // 回答パターンを詳細に分析して、価値観に最も近づく質問を選択
    // 必須質問が既に選択されている場合はスキップ
    if (!selectedQuestion && questionsToChooseFrom.length > 0) {
      // 回答パターンに基づいて、最も適切な質問を選択
      // 1. 最近の回答の傾向を分析
      const recentTrend = recentAverage - averageScore; // 最近の傾向（正の値は右寄り、負の値は左寄り）
      
      // 2. 回答の一貫性を分析
      const variance = answerValues.reduce((sum, score) => {
        return sum + Math.pow(score - averageScore, 2);
      }, 0) / questionCount;
      const isConsistent = variance < 1.5; // 一貫性が高い
      
      // 3. 質問をスコアリングして選択
      const scoredQuestions = questionsToChooseFrom.map(q => {
        let score = 0;
        
        // 質問数に基づくスコア（質問数が増えるほど、より深い質問を優先）
        if (questionCount <= 3) {
          score += q.priority <= 3 ? 10 : 5; // 初期は基本的な質問を優先
        } else if (questionCount <= 7) {
          score += q.priority >= 4 && q.priority <= 6 ? 10 : 5; // 中盤は中程度の質問を優先
        } else {
          score += q.priority >= 5 ? 10 : 5; // 後半は深い質問を優先
        }
        
        // 回答パターンに基づくスコア
        if (averageScore <= 2.5) {
          // 左寄りの回答が多い場合、左寄りの質問を優先
          score += q.priority <= 3 ? 15 : 5;
        } else if (averageScore >= 3.5) {
          // 右寄りの回答が多い場合、右寄りの質問を優先
          score += q.priority >= 4 ? 15 : 5;
        } else {
          // 中間の場合、バランスの取れた質問を優先
          score += q.priority >= 3 && q.priority <= 5 ? 15 : 5;
        }
        
        // 最近の傾向に基づくスコア
        if (recentTrend > 0.5) {
          // 最近右寄りの傾向がある場合、右寄りの質問を優先
          score += q.priority >= 4 ? 10 : 0;
        } else if (recentTrend < -0.5) {
          // 最近左寄りの傾向がある場合、左寄りの質問を優先
          score += q.priority <= 3 ? 10 : 0;
        }
        
        // 一貫性が高い場合、より深い質問を優先
        if (isConsistent && questionCount > 5) {
          score += q.priority >= 5 ? 10 : 0;
        }
        
        // 質問数のインデックスを考慮（同じスコアの場合、質問数に基づいて選択）
        const indexScore = (questionCount * 7 + q.id) % 100;
        score += indexScore / 100;
        
        return { question: q, score };
      });
      
      // スコアが高い順にソート
      scoredQuestions.sort((a, b) => b.score - a.score);
      
      // 最もスコアが高い質問を選択（ただし、質問数に基づいて少しランダム性を持たせる）
      const topQuestions = scoredQuestions.slice(0, Math.min(3, scoredQuestions.length));
      console.log('トップ3の質問:', topQuestions.map(tq => ({
        id: tq.question.id,
        text: tq.question.text,
        score: tq.score.toFixed(2)
      })));
      const selectedIndex = questionCount % topQuestions.length;
      selectedQuestion = topQuestions[selectedIndex].question;
      console.log('選択された質問:', selectedQuestion.id, selectedQuestion.text, 'インデックス:', selectedIndex);
    } else {
      // フォールバック
      selectedQuestion = availableQuestions[0] || QUESTION_POOL[0];
    }
    
    // 質問が見つからない場合のフォールバック
    if (!selectedQuestion) {
      // 必須質問が未使用の場合は優先（15問に調整）
      if (!isRequiredQuestionUsed && requiredQuestion && questionCount >= 5 && questionCount <= 10) {
        selectedQuestion = requiredQuestion;
        console.log('フォールバック: 必須質問を選択');
      } else {
        selectedQuestion = availableQuestions[0] || QUESTION_POOL[0];
        console.log('フォールバック: デフォルト質問を選択');
      }
    }
    
    // 回答パターンに基づいて具体例を選択
    // 質問数と回答パターン、質問IDの組み合わせで具体例を決定（確実に異なる具体例が選ばれるように）
    // 1問目は0番目の具体例、2問目は1番目以降の具体例を使用
    let exampleIndex;
    if (questionCount === 1) {
      // 2問目の場合は、1問目と異なる具体例を選択
      exampleIndex = 1 % selectedQuestion.examples.length;
    } else {
      // 3問目以降は、質問数と質問IDの組み合わせで決定
      const exampleSeed = questionCount * 7 + (selectedQuestion.id || 0) + Math.floor(averageScore * 3);
      exampleIndex = exampleSeed % selectedQuestion.examples.length;
    }
    const selectedExample = selectedQuestion.examples[exampleIndex];
    
    console.log('選択された具体例インデックス:', exampleIndex);
    console.log('選択された具体例:', selectedExample);
    console.log('=== デバッグ情報終了 ===\n');
    
    const demoResponse = {
      question: {
        id: selectedQuestion.id,
        text: selectedQuestion.text,
        leftLabel: selectedQuestion.leftLabel,
        rightLabel: selectedQuestion.rightLabel,
        example: `${selectedExample.left} ${selectedExample.right}`
      },
      reason: `これまでの回答パターン（平均: ${averageScore.toFixed(1)}点、左寄り: ${leftAnswers}問、中間: ${middleAnswers}問、右寄り: ${rightAnswers}問）に基づいて、${stage === 'early' ? '基本的な価値観' : stage === 'mid' ? '特定の領域' : '深い価値観'}を探る質問を生成しました。`
    };
    
    return NextResponse.json(demoResponse);
  } catch (error) {
    console.error('Error in question API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
