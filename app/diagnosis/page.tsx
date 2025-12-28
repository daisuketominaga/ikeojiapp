'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id?: number;
  text: string;
  leftLabel: string;
  rightLabel: string;
  example: string;
}

interface QuestionResponse {
  question: Question;
  reason: string;
}

export default function DiagnosisPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionReason, setQuestionReason] = useState<string>('');
  const [questionHistory, setQuestionHistory] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentAnswer, setCurrentAnswer] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentQuestionId, setCurrentQuestionId] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  const TOTAL_QUESTIONS = 15;
  const progress = (questionCount / TOTAL_QUESTIONS) * 100;
  const isLastQuestion = questionCount >= TOTAL_QUESTIONS;

  // プログレスリングの計算
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    fetchNextQuestion();
    setIsVisible(true);
  }, []);

  const fetchNextQuestion = async (currentAnswers = answers, currentQuestionCount = questionCount, currentHistory = questionHistory) => {
    setIsLoadingQuestion(true);
    setIsVisible(false);
    
    try {
      const requestBody = {
        answers: currentAnswers,
        questionCount: currentQuestionCount,
        questionHistory: currentHistory.map(q => ({ 
          id: q.id || 0, 
          text: q.text || '',
          leftLabel: q.leftLabel || '',
          rightLabel: q.rightLabel || ''
        })),
      };
      
      const response = await fetch('/api/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('質問の取得に失敗しました');
      }

      const data: QuestionResponse = await response.json();
      
      const questionWithId = {
        ...data.question,
        id: data.question.id || currentQuestionId
      };
      
      setCurrentQuestion(questionWithId);
      setQuestionReason(data.reason);
      setIsLoadingQuestion(false);
      
      // アニメーション用に少し遅延
      setTimeout(() => setIsVisible(true), 50);
    } catch (error) {
      console.error('Error fetching question:', error);
      alert('質問の取得に失敗しました。もう一度お試しください。');
      setIsLoadingQuestion(false);
    }
  };

  const handleAnswerSelect = (value: number) => {
    setCurrentAnswer(value);
  };

  const handleNext = async () => {
    if (currentAnswer === null || !currentQuestion) {
      alert('回答を選択してください');
      return;
    }

    const newAnswers = { ...answers, [currentQuestionId]: currentAnswer };
    setAnswers(newAnswers);
    
    const questionWithId = {
      ...currentQuestion,
      id: currentQuestion.id || currentQuestionId
    };
    const newQuestionHistory = [...questionHistory, questionWithId];
    setQuestionHistory(newQuestionHistory);
    
    const newQuestionCount = questionCount + 1;
    setQuestionCount(newQuestionCount);

    if (isLastQuestion) {
      handleSubmit(newAnswers);
    } else {
      setCurrentQuestionId(currentQuestionId + 1);
      setCurrentAnswer(null);
      
      setIsLoadingQuestion(true);
      setIsVisible(false);
      
      try {
        const response = await fetch('/api/question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answers: newAnswers,
            questionCount: newQuestionCount,
            questionHistory: newQuestionHistory.map(q => ({ id: q.id || 0, text: q.text })),
          }),
        });

        if (!response.ok) {
          throw new Error('質問の取得に失敗しました');
        }

        const data: QuestionResponse = await response.json();
        const questionWithId = {
          ...data.question,
          id: data.question.id || currentQuestionId + 1
        };
        setCurrentQuestion(questionWithId);
        setQuestionReason(data.reason);
        setIsLoadingQuestion(false);
        
        setTimeout(() => setIsVisible(true), 50);
      } catch (error) {
        console.error('Error fetching question:', error);
        alert('質問の取得に失敗しました。もう一度お試しください。');
        setIsLoadingQuestion(false);
      }
    }
  };

  const handlePrevious = () => {
    if (questionHistory.length > 0) {
      setIsVisible(false);
      
      setTimeout(() => {
        const previousQuestion = questionHistory[questionHistory.length - 1];
        const previousQuestionId = currentQuestionId - 1;
        
        setQuestionHistory(questionHistory.slice(0, -1));
        setCurrentQuestion(previousQuestion);
        setCurrentQuestionId(previousQuestionId);
        setCurrentAnswer(answers[previousQuestionId] || null);
        setQuestionCount(questionCount - 1);
        
        setTimeout(() => setIsVisible(true), 50);
      }, 200);
    }
  };

  const handleSubmit = async (finalAnswers: Record<number, number>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `以下の${questionCount}問の診断回答（5段階評価）を分析してください。\n\n${questionHistory.map((q, idx) => {
                const questionId = idx + 1;
                const score = finalAnswers[questionId];
                return `${questionId}. ${q.text}\n  具体例: ${q.example}\n  左: ${q.leftLabel} (1点) ←→ 右: ${q.rightLabel} (5点)\n  回答: ${score}点 (${score <= 2 ? '左寄り' : score >= 4 ? '右寄り' : '中間'})`;
              }).join('\n\n')}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('API呼び出しに失敗しました');
      }

      const data = await response.json();
      
      localStorage.setItem('ikeojiResult', JSON.stringify(data));
      
      router.push('/result');
    } catch (error) {
      console.error('Error submitting diagnosis:', error);
      alert('診断結果の取得に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  // ローディング画面
  if (isLoadingQuestion && questionCount === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="bg-pattern" />
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
        </div>
        <p className="text-gray-400 mt-6 text-lg">質問を準備中...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="bg-pattern" />
        <p className="text-white text-xl">質問の読み込みに失敗しました</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-premium mt-6"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="bg-pattern" />
      
      {/* フローティングオーブ */}
      <div className="orb orb-purple w-48 h-48 -top-24 -right-24 animate-float opacity-30" />
      <div className="orb orb-pink w-32 h-32 bottom-32 -left-16 animate-float delay-300 opacity-30" />

      <div className="relative z-10 min-h-screen flex flex-col px-4 py-6 sm:px-6 sm:py-8">
        
        {/* ヘッダー：プログレス */}
        <div className="flex items-center justify-between mb-6">
          {/* 戻るボタン */}
          <button
            onClick={handlePrevious}
            disabled={questionCount === 0}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-white/10"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* プログレスリング */}
          <div className="relative w-16 h-16">
            <svg className="progress-ring w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-white/10"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
              />
              <circle
                className="progress-ring-circle text-indigo-500"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {questionCount + 1}/{TOTAL_QUESTIONS}
              </span>
            </div>
          </div>

          {/* 閉じるボタン */}
          <button
            onClick={() => {
              if (confirm('診断を中断しますか？')) {
                router.push('/');
              }
            }}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
          
          {/* 質問カード */}
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            
            {/* 質問テキスト */}
            <div className="glass-card p-6 sm:p-8 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed text-center mb-6">
                {currentQuestion.text}
              </h2>

              {/* 具体的事例 */}
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-4 border border-indigo-500/20">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">💭</span>
                  <div>
                    <p className="text-indigo-300 text-sm font-semibold mb-1">あなたへの具体例</p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {currentQuestion.example}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 選択エリア */}
            <div className="glass-card p-6 sm:p-8">
              
              {/* ラベル */}
              <div className="flex justify-between items-start gap-4 mb-6">
                <div className="flex-1 text-left">
                  <span className="inline-block px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-xs font-semibold mb-2">
                    1〜2
                  </span>
                  <p className="text-gray-300 text-sm leading-snug">{currentQuestion.leftLabel}</p>
                </div>
                <div className="flex-1 text-right">
                  <span className="inline-block px-3 py-1 bg-pink-500/20 rounded-full text-pink-300 text-xs font-semibold mb-2">
                    4〜5
                  </span>
                  <p className="text-gray-300 text-sm leading-snug">{currentQuestion.rightLabel}</p>
                </div>
              </div>

              {/* 5段階選択 */}
              <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAnswerSelect(value)}
                    className={`
                      relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-bold text-lg transition-all duration-300
                      ${currentAnswer === value
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white scale-110 shadow-xl shadow-indigo-500/40'
                        : 'bg-white/5 border-2 border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/10'
                      }
                    `}
                  >
                    {value}
                    {currentAnswer === value && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* 選択フィードバック */}
              <div className="h-12 flex items-center justify-center">
                {currentAnswer !== null && (
                  <p className={`text-center text-sm font-medium animate-fade-in-up ${
                    currentAnswer <= 2 ? 'text-blue-300' : currentAnswer >= 4 ? 'text-pink-300' : 'text-gray-400'
                  }`}>
                    {currentAnswer <= 2 
                      ? `← ${currentQuestion.leftLabel}寄り`
                      : currentAnswer >= 4
                      ? `${currentQuestion.rightLabel}寄り →`
                      : '中間的な立場'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* フッター：次へボタン */}
        <div className="mt-6 max-w-lg mx-auto w-full">
          <button
            onClick={handleNext}
            disabled={isSubmitting || currentAnswer === null || isLoadingQuestion}
            className={`
              w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300
              ${currentAnswer !== null
                ? 'btn-premium'
                : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AIが分析中...
              </span>
            ) : isLoadingQuestion ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                準備中...
              </span>
            ) : isLastQuestion ? (
              <span className="flex items-center justify-center gap-2">
                <span>診断結果を見る</span>
                <span className="text-xl">✨</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>次の質問へ</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
