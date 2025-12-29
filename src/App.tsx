import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { Subject } from '../types';
import { Layout } from '../components/Layout';

const MENU_TYPES = {
  ANSWER: '🎯 Đáp án',
  GUIDE: '📝 Phương pháp',
  QUIZ: '✏️ Luyện tập'
};

// --- BỘ DỮ LIỆU TRI THỨC NỘI BỘ (Để trình diễn KHKT) ---
const KNOWLEDGE_BASE: Record<string, any> = {
  [Subject.MATH]: {
    answer: "### Kết quả: $x = 5; y = -2$\n\nPhương trình có nghiệm duy nhất dựa trên phương pháp thế.",
    guide: "1. Cô lập biến $x$ từ phương trình (1).\n2. Thay vào phương trình (2).\n3. Giải phương trình bậc nhất một ẩn.",
    quiz: "Hãy thử giải hệ phương trình tương tự: \n\n $\\begin{cases} 2x + y = 8 \\\\ x - y = 1 \\end{cases}$"
  },
  [Subject.PHYSICS]: {
    answer: "### Kết quả: $v = 20 m/s$\n\nVận tốc của vật tại thời điểm chạm đất.",
    guide: "1. Xác định độ cao $h$.\n2. Áp dụng công thức rơi tự do: $v = \\sqrt{2gh}$.\n3. Lấy $g = 10m/s^2$.",
    quiz: "Nếu độ cao tăng gấp đôi, vận tốc chạm đất sẽ thay đổi như thế nào?"
  },
  [Subject.CHEMISTRY]: {
    answer: "### Phản ứng: $2H_2 + O_2 \\rightarrow 2H_2O$\n\nĐây là phản ứng hóa hợp, tỏa nhiều nhiệt.",
    guide: "1. Viết sơ đồ phản ứng.\n2. Cân bằng số nguyên tử mỗi nguyên tố.\n3. Xác định điều kiện nhiệt độ ($t^o$).",
    quiz: "Tính thể tích khí $O_2$ cần dùng để đốt cháy hoàn toàn 4 gam khí $H_2$?"
  }
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<'HOME' | 'INPUT' | 'CROP' | 'ANALYSIS'>('HOME');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeMenu, setActiveMenu] = useState(MENU_TYPES.ANSWER);
  const [image, setImage] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<any>(null);

  const handleRunAnalysis = () => {
    if (!image && !voiceText) return alert("Vui lòng cung cấp đề bài!");
    
    setIsLoading(true);
    
    // Giả lập xử lý dữ liệu trong 1.5 giây để tăng tính trải nghiệm
    setTimeout(() => {
      const result = KNOWLEDGE_BASE[selectedSubject || Subject.MATH];
      setCurrentResult(result);
      setIsLoading(false);
      setScreen('ANALYSIS');
    }, 1500);
  };

  return (
    <Layout 
      onBack={() => setScreen(screen === 'ANALYSIS' ? 'INPUT' : 'HOME')}
      title={selectedSubject || 'Hỗ trợ học tập'}
    >
      {/* MÀN HÌNH CHÍNH */}
      {screen === 'HOME' && (
        <div className="grid grid-cols-2 gap-5 mt-6 animate-in fade-in slide-in-from-bottom-4">
          {[
            { id: Subject.MATH, color: 'bg-indigo-600', icon: '📐' },
            { id: Subject.PHYSICS, color: 'bg-violet-600', icon: '⚛️' },
            { id: Subject.CHEMISTRY, color: 'bg-emerald-600', icon: '🧪' },
            { id: 'DIARY', color: 'bg-amber-600', icon: '📔' },
          ].map((sub) => (
            <button key={sub.id} onClick={() => { setSelectedSubject(sub.id as Subject); setScreen('INPUT'); }} className={`${sub.color} aspect-square rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-all`}>
              <span className="text-lg font-black mb-2 uppercase tracking-tight">{sub.id}</span>
              <span className="text-5xl">{sub.icon}</span>
            </button>
          ))}
        </div>
      )}

      {/* MÀN HÌNH NHẬP LIỆU */}
      {screen === 'INPUT' && (
        <div className="space-y-10 animate-in zoom-in-95">
          <div className="w-full aspect-[16/10] bg-white rounded-[3rem] flex items-center justify-center overflow-hidden border-2 border-slate-100 relative shadow-2xl">
            {image ? <img src={image} className="p-6 h-full object-contain" /> : <div className="p-10 text-center text-slate-300 font-bold uppercase text-[10px] tracking-[0.2em]">{voiceText || "Đang nhận tín hiệu..."}</div>}
            
            {isLoading && (
              <div className="absolute inset-0 bg-indigo-600/90 backdrop-blur-md flex flex-col items-center justify-center text-white z-50">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Hệ thống đang phân tích...</p>
              </div>
            )}
          </div>

          <div className="flex justify-around items-center px-4 bg-slate-50 py-6 rounded-[2.5rem]">
            <button onClick={() => setScreen('CROP')} className="w-14 h-14 rounded-2xl bg-white text-indigo-600 shadow-sm flex items-center justify-center active:scale-75 text-xl border border-slate-100">📸</button>
            <button onClick={handleRunAnalysis} className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white shadow-2xl flex items-center justify-center active:scale-75 transition-all text-3xl">🚀</button>
            <button onClick={() => setVoiceText("Bài toán: 2x + 4 = 10")} className="w-14 h-14 rounded-2xl bg-white text-indigo-600 shadow-sm flex items-center justify-center active:scale-75 text-xl border border-slate-100">🎙️</button>
          </div>
        </div>
      )}

      {/* MÀN HÌNH KẾT QUẢ NGAY TẠI APP */}
      {screen === 'ANALYSIS' && currentResult && (
        <div className="flex flex-col h-full space-y-4 animate-in slide-in-from-right">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-white">
            {Object.values(MENU_TYPES).map(m => (
              <button key={m} onClick={() => setActiveMenu(m)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${activeMenu === m ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}>
                {m}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 overflow-hidden flex flex-col p-8">
            <div className="prose prose-slate prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {activeMenu === MENU_TYPES.ANSWER ? currentResult.answer : 
                 activeMenu === MENU_TYPES.GUIDE ? currentResult.guide : 
                 currentResult.quiz}
              </ReactMarkdown>
            </div>
            
            <div className="mt-auto pt-6 border-t">
               <button onClick={() => alert("Đã lưu bài học thành công!")} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                 💾 LƯU VÀO NHẬT KÝ
               </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
