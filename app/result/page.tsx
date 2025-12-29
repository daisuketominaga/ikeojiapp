'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface QuestionAnalysis {
  questionNumber: number;
  questionText: string;
  fullQuestionText?: string;
  leftLabel?: string;
  rightLabel?: string;
  userAnswer: number;
  selectedChoice?: string;
  interpretation: string;
  impact: {
    execution: number;
    humanity: number;
    style: number;
    charm: number;
    appearance: number;
  };
}

interface ValueType {
  main: string;
  sub: string;
  description: string;
}

interface Benchmark {
  rank: number;
  name: string;
  valueType?: string;
  reason: string;
  superiority?: string;
  gaps?: {
    execution: number;
    humanity: number;
    style: number;
    charm: number;
    appearance: number;
  };
}

interface ResultData {
  valueType?: ValueType;
  userArchetype: string;
  coreValue: string;
  benchmarks: Benchmark[];
  scores: {
    execution: number;
    humanity: number;
    style: number;
    charm: number;
    appearance: number;
  };
  questionAnalysis?: QuestionAnalysis[];
  positioningText: string;
  actionableAdvice: string;
}

export default function ResultPage() {
  const router = useRouter();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [showQuestionDetails, setShowQuestionDetails] = useState(false);



  useEffect(() => {
    const storedData = localStorage.getItem('ikeojiResult');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.result) {
          if (parsed.result.benchmark && !parsed.result.benchmarks) {
            parsed.result.benchmarks = [
              {
                rank: 1,
                name: parsed.result.benchmark.name,
                reason: parsed.result.benchmark.reason
              }
            ];
          }
          setResultData(parsed.result);
          setLoading(false);
          setTimeout(() => setIsVisible(true), 100);
          return;
        }
      } catch (error) {
        console.error('Failed to parse result data:', error);
      }
    }
    
    router.push('/diagnosis');
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="bg-pattern" />
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">✨</span>
          </div>
        </div>
        <p className="text-gray-400 mt-6 text-lg">結果を読み込み中...</p>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="bg-pattern" />
        <p className="text-white text-xl mb-6">結果データが見つかりません</p>
        <button 
          onClick={() => router.push('/diagnosis')}
          className="btn-premium"
        >
          診断をやり直す
        </button>
      </div>
    );
  }

  // レーダーチャート用のデータ（5象限）
  const chartData = [
    { subject: '実行力', user: resultData.scores.execution, benchmark: 100 },
    { subject: '人間性', user: resultData.scores.humanity, benchmark: 100 },
    { subject: '表現力', user: resultData.scores.style, benchmark: 100 },
    { subject: '魅力', user: resultData.scores.charm, benchmark: 100 },
    { subject: '外見力', user: resultData.scores.appearance || 50, benchmark: 100 },
  ];

  const totalScoreOutOf500 = resultData.scores.execution + resultData.scores.humanity + 
                              resultData.scores.style + resultData.scores.charm + 
                              (resultData.scores.appearance || 50);
  const totalScoreOutOf100 = (totalScoreOutOf500 / 5).toFixed(1);

  const getRankBadge = (rank: number) => {
    switch(rank) {
      case 1: return { emoji: '🥇', bg: 'from-yellow-500/30 to-amber-600/30', border: 'border-yellow-400/50', text: 'text-yellow-300' };
      case 2: return { emoji: '🥈', bg: 'from-gray-400/30 to-gray-500/30', border: 'border-gray-300/50', text: 'text-gray-300' };
      case 3: return { emoji: '🥉', bg: 'from-orange-500/30 to-orange-600/30', border: 'border-orange-400/50', text: 'text-orange-300' };
      default: return { emoji: '👤', bg: 'from-gray-500/30 to-gray-600/30', border: 'border-gray-400/50', text: 'text-gray-300' };
    }
  };

  // 影響度の色を取得
  const getImpactColor = (value: number) => {
    if (value > 5) return 'text-green-400 bg-green-500/20';
    if (value > 0) return 'text-green-300 bg-green-500/10';
    if (value < -5) return 'text-red-400 bg-red-500/20';
    if (value < 0) return 'text-red-300 bg-red-500/10';
    return 'text-gray-400 bg-gray-500/10';
  };

  // 回答のラベル
  const getAnswerLabel = (answer: number) => {
    switch(answer) {
      case 1: return { text: '強く左寄り', color: 'bg-blue-500' };
      case 2: return { text: '左寄り', color: 'bg-blue-400' };
      case 3: return { text: '中間', color: 'bg-gray-400' };
      case 4: return { text: '右寄り', color: 'bg-pink-400' };
      case 5: return { text: '強く右寄り', color: 'bg-pink-500' };
      default: return { text: '不明', color: 'bg-gray-500' };
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="bg-pattern" />
      
      {/* フローティングオーブ */}
      <div className="orb orb-gold w-64 h-64 -top-32 -right-32 animate-float opacity-40" />
      <div className="orb orb-purple w-48 h-48 top-1/3 -left-24 animate-float delay-200 opacity-30" />
      <div className="orb orb-pink w-32 h-32 bottom-48 right-8 animate-float delay-400 opacity-30" />

      {/* コンテンツ */}
      <div className="relative z-10 px-4 py-8 sm:px-6 max-w-2xl mx-auto">
        
        {/* 価値観タイプ表示（最上部） */}
        {resultData.valueType && (
          <div className={`mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 rounded-2xl p-5 border border-amber-400/30 backdrop-blur-lg">
              <div className="text-center">
                <p className="text-amber-400/80 text-xs font-semibold mb-2 tracking-wider">あなたの価値観タイプ</p>
                <h2 className="text-2xl sm:text-3xl font-black mb-2">
                  <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                    {resultData.valueType.main}
                  </span>
                </h2>
                <div className="inline-block px-3 py-1 bg-amber-500/20 rounded-full mb-3">
                  <p className="text-amber-300 text-sm font-medium">
                    {resultData.valueType.sub}
                  </p>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed max-w-md mx-auto">
                  {resultData.valueType.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ヘッダー：ユーザータイプ表示 */}
        <div className={`text-center mb-8 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-block mb-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30 animate-pulse-glow">
              <span className="text-4xl">👔</span>
            </div>
          </div>
          
          <p className="text-amber-300 text-sm font-semibold mb-2 tracking-wider">YOUR IKEOJI TYPE</p>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 leading-tight">
            <span className="gradient-text-gold">{resultData.userArchetype}</span>
          </h1>
          
          {resultData.coreValue && (
            <div className="inline-block px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <p className="text-gray-400 text-sm">
                核となる価値観: <span className="text-white font-medium">{resultData.coreValue}</span>
              </p>
            </div>
          )}
        </div>

        {/* スコアサマリー */}
        <div className={`glass-card p-6 mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">あなたの総合スコア</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-black gradient-text">{totalScoreOutOf100}</span>
              <span className="text-2xl text-gray-500">/100</span>
            </div>
          </div>
        </div>

        {/* レーダーチャート */}
        <div className={`glass-card p-6 mb-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-lg font-bold text-center mb-4 text-white">能力レーダー</h2>
          
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#ffffff', fontSize: 12, fontWeight: 600 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  name={resultData.benchmarks[0]?.name || 'ベンチマーク'}
                  dataKey="benchmark"
                  stroke="#fbbf24"
                  fill="#fbbf24"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Radar
                  name="あなた"
                  dataKey="user"
                  stroke="#818cf8"
                  fill="#6366f1"
                  fillOpacity={0.4}
                  strokeWidth={3}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 各スコア詳細（5象限） */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: '実行力', score: resultData.scores.execution, color: 'from-blue-500 to-cyan-500' },
              { label: '人間性', score: resultData.scores.humanity, color: 'from-green-500 to-emerald-500' },
              { label: '表現力', score: resultData.scores.style, color: 'from-purple-500 to-pink-500' },
              { label: '魅力', score: resultData.scores.charm, color: 'from-orange-500 to-red-500' },
              { label: '外見力', score: resultData.scores.appearance || 50, color: 'from-rose-500 to-pink-400' },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">{item.label}</span>
                  <span className="text-white font-bold">{item.score}<span className="text-gray-500 text-xs">/100</span></span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ベンチマークランキング */}
        <div className={`glass-card p-6 mb-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-lg font-bold text-center mb-4 text-white">あなたに近い歴史上の偉人</h2>
          
          <div className="space-y-3">
            {resultData.benchmarks.map((benchmark) => {
              const badge = getRankBadge(benchmark.rank);
              return (
                <div
                  key={benchmark.rank}
                  className={`bg-gradient-to-r ${badge.bg} rounded-2xl p-4 border ${badge.border}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0">{badge.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-bold ${badge.text} mb-1`}>
                        {benchmark.name}
                      </h3>
                      {benchmark.valueType && (
                        <div className="inline-block px-2 py-0.5 bg-white/10 rounded-md mb-2">
                          <p className="text-xs text-amber-300/80">{benchmark.valueType}</p>
                        </div>
                      )}
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {benchmark.reason}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 1位との差分 */}
        {resultData.benchmarks[0]?.gaps && (
          <div className={`glass-card p-6 mb-6 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-lg font-bold text-center mb-2 text-white">
              {resultData.benchmarks[0].name}との差分
            </h2>
            <p className="text-gray-400 text-sm text-center mb-4">あと何点で追いつける？</p>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '実行力', gap: resultData.benchmarks[0].gaps.execution, score: resultData.scores.execution },
                { label: '人間性', gap: resultData.benchmarks[0].gaps.humanity, score: resultData.scores.humanity },
                { label: '表現力', gap: resultData.benchmarks[0].gaps.style, score: resultData.scores.style },
                { label: '魅力', gap: resultData.benchmarks[0].gaps.charm, score: resultData.scores.charm },
                { label: '外見力', gap: resultData.benchmarks[0].gaps.appearance || 0, score: resultData.scores.appearance || 50 },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                  <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                  <p className={`text-xl font-bold ${item.gap > 30 ? 'text-red-400' : item.gap > 15 ? 'text-yellow-400' : 'text-green-400'}`}>
                    -{item.gap}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    あなた: {item.score}点
                  </p>
                </div>
              ))}
            </div>
            
            {resultData.benchmarks[0].superiority && (
              <div className="mt-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <p className="text-amber-200 text-sm leading-relaxed">
                  {resultData.benchmarks[0].superiority}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 現状分析 */}
        {resultData.positioningText && (
          <div className={`glass-card p-6 mb-6 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📊</span>
              <h2 className="text-lg font-bold text-white">現状分析</h2>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{resultData.positioningText}</p>
          </div>
        )}

        {/* AIコーチからの提言 */}
        <div className={`transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl p-6 border border-indigo-400/20 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🤖</span>
              <h2 className="text-lg font-bold text-white">AIコーチからの提言</h2>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {resultData.actionableAdvice}
              </p>
            </div>
          </div>
        </div>

        {/* 質問回答の詳細分析 */}
        {resultData.questionAnalysis && resultData.questionAnalysis.length > 0 && (
          <div className={`transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="glass-card p-6 mb-6">
              <button
                onClick={() => setShowQuestionDetails(!showQuestionDetails)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  <h2 className="text-lg font-bold text-white">回答詳細分析</h2>
                </div>
                <div className={`transform transition-transform ${showQuestionDetails ? 'rotate-180' : ''}`}>
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <p className="text-gray-400 text-sm mt-2">
                各質問への回答が5象限にどう影響したかを確認できます
              </p>

              {showQuestionDetails && (
                <div className="mt-6 space-y-4">
                  {resultData.questionAnalysis.map((qa, index) => {
                    const answerInfo = getAnswerLabel(qa.userAnswer);
                    return (
                      <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        {/* 質問ヘッダー */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded">
                                Q{qa.questionNumber}
                              </span>
                              <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${answerInfo.color}`}>
                                {qa.userAnswer}点
                              </span>
                            </div>
                            <p className="text-white text-sm font-medium">{qa.questionText}</p>
                          </div>
                        </div>

                        {/* 選択肢の表示 */}
                        {qa.leftLabel && qa.rightLabel && (
                          <div className="flex items-center gap-2 mb-3 text-xs">
                            <div className={`flex-1 p-2 rounded-lg text-center ${qa.userAnswer <= 2 ? 'bg-blue-500/30 border border-blue-400/50 text-blue-300' : 'bg-white/5 text-gray-400'}`}>
                              ⬅️ {qa.leftLabel}
                            </div>
                            <div className="text-gray-500 text-[10px]">vs</div>
                            <div className={`flex-1 p-2 rounded-lg text-center ${qa.userAnswer >= 4 ? 'bg-orange-500/30 border border-orange-400/50 text-orange-300' : 'bg-white/5 text-gray-400'}`}>
                              {qa.rightLabel} ➡️
                            </div>
                          </div>
                        )}

                        {/* 回答の解釈 */}
                        <div className="bg-white/5 rounded-lg p-3 mb-3">
                          <p className="text-gray-300 text-xs leading-relaxed">
                            🎯 あなたの選択: <span className="text-white font-medium">{qa.interpretation}</span>
                          </p>
                        </div>

                        {/* 5象限への影響 */}
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            { key: 'execution', label: '実行力', value: qa.impact.execution },
                            { key: 'humanity', label: '人間性', value: qa.impact.humanity },
                            { key: 'style', label: '表現力', value: qa.impact.style },
                            { key: 'charm', label: '魅力', value: qa.impact.charm },
                            { key: 'appearance', label: '外見力', value: qa.impact.appearance || 0 },
                          ].map((impact) => (
                            <div 
                              key={impact.key}
                              className={`rounded-lg p-2 text-center ${getImpactColor(impact.value)}`}
                            >
                              <p className="text-[10px] opacity-70">{impact.label}</p>
                              <p className="text-sm font-bold">
                                {impact.value > 0 ? '+' : ''}{impact.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* 影響度サマリー（5象限） */}
                  <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-500/20">
                    <h3 className="text-white font-bold text-sm mb-3">📊 影響度サマリー</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { 
                          label: '実行力', 
                          total: resultData.questionAnalysis.reduce((sum, q) => sum + q.impact.execution, 0),
                          final: resultData.scores.execution
                        },
                        { 
                          label: '人間性', 
                          total: resultData.questionAnalysis.reduce((sum, q) => sum + q.impact.humanity, 0),
                          final: resultData.scores.humanity
                        },
                        { 
                          label: '表現力', 
                          total: resultData.questionAnalysis.reduce((sum, q) => sum + q.impact.style, 0),
                          final: resultData.scores.style
                        },
                        { 
                          label: '魅力', 
                          total: resultData.questionAnalysis.reduce((sum, q) => sum + q.impact.charm, 0),
                          final: resultData.scores.charm
                        },
                        { 
                          label: '外見力', 
                          total: resultData.questionAnalysis.reduce((sum, q) => sum + (q.impact.appearance || 0), 0),
                          final: resultData.scores.appearance || 50
                        },
                      ].map((item) => (
                        <div key={item.label} className="bg-white/5 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 text-xs">{item.label}</span>
                            <span className="text-white font-bold text-sm">{item.final}点</span>
                          </div>
                          <p className="text-gray-500 text-xs">
                            質問からの影響: {item.total > 0 ? '+' : ''}{item.total}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className={`mt-8 space-y-3 transition-all duration-700 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* 最初に戻る */}
          <button
            onClick={() => {
              localStorage.removeItem('ikeojiResult');
              router.push('/');
            }}
            className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-lg shadow-indigo-500/30"
          >
            <span>🏠</span>
            <span>トップに戻る</span>
          </button>
        </div>

        {/* フッター */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-xs">
            Powered by AI • イケオジ診断
          </p>
        </div>
      </div>
    </div>
  );
}
