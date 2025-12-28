'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // アプリをシェアする
  const handleShareApp = async () => {
    const shareText = `🎯 イケオジ診断やってみて！

15の質問に答えるだけで、あなたの価値観と近い歴史上の偉人がわかるよ！

👔 所要時間：約3分
📊 AI分析で深層心理を解析
👑 ガンジー？織田信長？あなたは誰に近い？

#イケオジ診断`;

    const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'イケオジ診断',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Web Share APIが使えない場合はURLをコピー
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // フォールバック
        const textArea = document.createElement('textarea');
        textArea.value = `${shareText}\n\n${shareUrl}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="bg-pattern" />
      
      {/* フローティングオーブ */}
      <div className="orb orb-purple w-64 h-64 -top-32 -left-32 animate-float" />
      <div className="orb orb-pink w-48 h-48 top-1/2 -right-24 animate-float delay-200" />
      <div className="orb orb-gold w-32 h-32 bottom-20 left-1/4 animate-float delay-400" />

      {/* メインコンテンツ */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        
        {/* ロゴ・ブランドエリア */}
        <div className={`text-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-block mb-6">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-pulse-glow">
              <span className="text-5xl">👔</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
            <span className="gradient-text">イケオジ</span>
            <span className="text-white">診断</span>
          </h1>
          
          <p className="text-gray-400 text-lg sm:text-xl max-w-md mx-auto leading-relaxed">
            15の質問で、あなたの本当の価値観と<br className="hidden sm:block" />
            <span className="gradient-text-gold font-bold">理想のイケオジ像</span>を発見
          </p>
        </div>

        {/* 特徴カード */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg sm:max-w-2xl w-full mb-10 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <FeatureCard 
            icon="🎯" 
            title="AI分析" 
            description="深層心理を解析"
            delay={0}
          />
          <FeatureCard 
            icon="👑" 
            title="ベンチマーク" 
            description="歴史上の偉人と比較"
            delay={100}
          />
          <FeatureCard 
            icon="📊" 
            title="可視化" 
            description="4つの軸で評価"
            delay={200}
          />
        </div>

        {/* CTAボタン */}
        <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button
            onClick={() => router.push('/diagnosis')}
            className="btn-premium group flex items-center gap-3"
          >
            <span>診断をはじめる</span>
            <svg 
              className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          
          <p className="text-gray-500 text-sm mt-4 text-center">
            所要時間：約3分 • 無料
          </p>

          {/* 友達に教えるボタン */}
          <button
            onClick={handleShareApp}
            className={`mt-6 w-full py-3 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              copied 
                ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{copied ? '✅' : '📤'}</span>
            <span>{copied ? 'コピーしました！' : '友達に教える'}</span>
          </button>
        </div>

        {/* 下部装飾テキスト */}
        <div className={`absolute bottom-8 left-0 right-0 text-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-gray-600 text-xs">
            Powered by AI • あなただけの診断結果
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: string; title: string; description: string; delay: number }) {
  return (
    <div 
      className="glass-card glass-card-hover p-5 text-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-bold text-white mb-1">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
