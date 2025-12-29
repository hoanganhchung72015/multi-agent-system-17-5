import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { Subject } from '../types';
import { Layout } from '../components/Layout';

const MENU_TYPES = {
  ANSWER: '🎯 Quét ngay',
  GUIDE: '📝 Thông suốt',
  QUIZ: '✏️ Chinh phục'
};

interface DiaryEntry {
  id: string;
  subject: string;
  type: 'IMAGE' | 'VOICE';
  content: string; 
  time: string;
}

const App: React.FC = () => {
  // --- TRẠNG THÁI ---
  const [screen, setScreen] = useState<'HOME' | 'INPUT' | 'CROP' | 'ANALYSIS' | 'DIARY'>('HOME');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeMenu, setActiveMenu] = useState(MENU_TYPES.ANSWER);
  const [image, setImage] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [crop, setCrop] = useState<Crop>();
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [analysisResult, setAnalysisResult] = useState('');

  // Tải nhật ký từ bộ nhớ
  useEffect(() => {
    const saved = localStorage.getItem('study_diary');
    if (saved) setDiaryEntries(JSON.parse(saved));
  }, []);

  const saveToDiary = useCallback((type: 'IMAGE' | 'VOICE', content: string) => {
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      subject: selectedSubject || 'Chưa rõ',
      type,
      content,
      time: new Date().toLocaleString('vi-VN'),
    };
    const updated = [newEntry, ...diaryEntries];
    setDiaryEntries(updated);
    localStorage.setItem('study_diary', JSON.stringify(updated));
  }, [selectedSubject, diaryEntries]);

  // --- XỬ LÝ CHÍNH (KẾT QUẢ TẠI APP) ---
  const handleRunAnalysis = () => {
    if (!image && !voiceText) return alert("Vui lòng cung cấp dữ liệu!");
    
    setIsLoading(true);
    saveToDiary(image ? 'IMAGE' : 'VOICE', image || voiceText);
    
    // Giả lập logic phân tích thông minh dựa trên môn học
    setTimeout(() => {
      let result = "";
      if (selectedSubject === Subject.MATH) {
        result = "### Lời giải Toán học\n\n**Đề bài:** " + (voiceText || "Phân tích hình ảnh") + "\n\n**Giải chi tiết:**\n- Bước 1: Áp dụng công thức $x = \\frac{-b}{2a}$\n- Bước 2: Thay số ta được $x = 5$\n\n**Kết luận:** Tập nghiệm $S = \\{5\\}$";
      } else {
        result = "### Kết quả phân tích " + selectedSubject + "\n\nĐã xác định được dạng bài tập. Hệ thống gợi ý bạn nên tập trung vào các định luật cơ bản để giải quyết vấn đề này.";
      }
      
      setAnalysisResult(result);
      setIsLoading(false);
      setScreen('ANALYSIS');
    }, 2000);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
  };

  return (
    <Layout 
      onBack={() => {
        if (screen === 'ANALYSIS' || screen === 'CROP') setScreen('INPUT');
        else if (screen === 'INPUT' || screen === 'DIARY') setScreen('HOME');
      }}
      title={selectedSubject || (screen === 'DIARY' ? 'Nhật ký' : '')}
    >
      {/* MÀN HOME: CHỌN MÔN */}
      {screen === 'HOME' && (
        <div className="grid grid-cols-2 gap-5 mt-6 animate-in fade-in">
          {[
            { id: Subject.MATH, color: 'bg-indigo-600', icon: '📐' },
            { id: Subject.PHYSICS, color: 'bg-violet-600', icon: '⚛️' },
            { id: Subject.CHEMISTRY, color: 'bg-emerald-600', icon: '🧪' },
            { id: 'DIARY', color: 'bg-amber-600', icon: '📔' },
          ].map((sub) => (
            <button 
              key={sub.id} 
              onClick={() => { if (sub.id === 'DIARY') setScreen('DIARY'); else { setSelectedSubject(sub.id as Subject); setScreen('INPUT'); } }} 
              className={`${sub.color} aspect-square rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-all`}
            >
              <span className="text-lg font-black mb-2 uppercase">{sub.id}</span>
              <span className="text-5xl">{sub.icon}</span>
            </button>
          ))}
        </div>
      )}

      {/* MÀN INPUT: CHỨC NĂNG GỐC */}
      {screen === 'INPUT' && (
        <div className="space-y-10 animate-in zoom-in-95">
          <div className="w-full aspect-[16/10] bg-white rounded-[3rem] flex items-center justify-center overflow-hidden border-2 border-slate-100 relative shadow-2xl">
            {image ? <img src={image} className="p-6 h-full object-contain" /> : <div className="p-10 text-center text-slate-300 font-bold uppercase text-xs">{voiceText || "Đang chờ đề bài..."}</div>}
            {isLoading && (
              <div className="absolute inset-0 bg-indigo-600/90 backdrop-blur-md flex flex-col items-center justify-center text-white z-50">
                <div className="w-12 h-12 border-4 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-widest">Đang truy xuất lời giải...</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-4">
            <button onClick={() => setScreen('CROP')} className="w-16 h-16 rounded-3xl bg-indigo-600 text-white shadow-lg flex items-center justify-center active:scale-75 text-2xl">📸</button>
            <input type="file" id="f" className="hidden" onChange={(e) => { 
              const file = e.target.files?.[0]; 
              if (file) { 
                const reader = new FileReader(); 
                reader.onload = (ev) => setImage(ev.target?.result as string); 
                reader.readAsDataURL(file); 
              } 
            }} />
            <button onClick={() => document.getElementById('f')?.click()} className="w-16 h-16 rounded-3xl bg-indigo-600 text-white shadow-lg flex items-center justify-center active:scale-75 text-2xl">🖼️</button>
            <button onClick={() => setIsRecording(!isRecording)} className={`w-16 h-16 rounded-3xl ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-indigo-600'} text-white shadow-lg flex items-center justify-center text-2xl`}>🎙️</button>
            <button onClick={handleRunAnalysis} className="w-16 h-16 rounded-3xl bg-indigo-600 text-white shadow-lg flex items-center justify-center active:scale-75 text-2xl">🚀</button>
          </div>
        </div>
      )}

      {/* MÀN CẮT ẢNH */}
      {screen === 'CROP' && image && (
        <div className="flex flex-col items-center">
          <ReactCrop crop={crop} onChange={c => setCrop(c)}>
            <img src={image} onLoad={onImageLoad} className="max-h-[50vh] rounded-xl" />
          </ReactCrop>
          <button onClick={() => setScreen('INPUT')} className="mt-6 px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">XÁC NHẬN CẮT ✅</button>
        </div>
      )}

      {/* MÀN ANALYSIS: KẾT QUẢ TẠI APP */}
      {screen === 'ANALYSIS' && (
        <div className="space-y-4 animate-in slide-in-from-right">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {Object.values(MENU_TYPES).map(m => (
              <button key={m} onClick={() => setActiveMenu(m)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${activeMenu === m ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}>
                {m}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-xl min-h-[350px]">
            <article className="prose prose-sm prose-slate">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {analysisResult}
              </ReactMarkdown>
            </article>
          </div>
        </div>
      )}

      {/* MÀN NHẬT KÝ */}
      {screen === 'DIARY' && (
        <div className="space-y-4 animate-in slide-in-from-bottom">
          {diaryEntries.map(entry => (
            <div key={entry.id} className="bg-white p-4 rounded-[1.5rem] shadow-sm flex items-center justify-between border">
              <div>
                <p className="text-[10px] text-slate-400 font-bold">{entry.time}</p>
                <p className="font-black text-slate-700">{entry.subject} - {entry.type}</p>
              </div>
              {entry.type === 'IMAGE' && <img src={entry.content} className="w-12 h-12 rounded-lg object-cover" />}
            </div>
          ))}
          {diaryEntries.length === 0 && <p className="text-center text-slate-300 italic py-20">Nhật ký đang trống...</p>}
        </div>
      )}
    </Layout>
  );
};

export default App;
