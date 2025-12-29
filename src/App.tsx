import React, { useState, useEffect, useCallback } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Subject } from '../types';
import { Layout } from '../components/Layout';

const MENU_TYPES = {
  ANSWER: '🎯 ĐÁP ÁN & CASIO',
  GUIDE: '📝 GIA SƯ AI',
  QUIZ: '✏️ LUYỆN SKILL'
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<'HOME' | 'INPUT' | 'CROP' | 'ANALYSIS'>('HOME');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeMenu, setActiveMenu] = useState(MENU_TYPES.ANSWER);
  const [image, setImage] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [crop, setCrop] = useState<Crop>();
  const [aiUrls, setAiUrls] = useState({ ans: '', guide: '', quiz: '' });

  // --- HÀM XỬ LÝ CHÍNH ---
  const handleRunAnalysis = () => {
    if (!image && !voiceText) return alert("Vui lòng cung cấp đề bài!");
    setIsLoading(true);

    const inputData = voiceText || "Giải chi tiết bài tập này";
    const sub = selectedSubject || "Kiến thức";

    // Tab 1: Đáp án & Casio 580 (Dùng Bing vì ít chặn Iframe nhất)
    const qAns = `${sub}: ${inputData}. Cho đáp án và hướng dẫn bấm máy Casio fx-580VNX chi tiết.`;
    const urlAns = `https://www.bing.com/search?q=${encodeURIComponent(qAns)}&setlang=vi`;
    
    // Tab 2: Giải thích lý thuyết
    const qGuide = `Giải thích ngắn gọn công thức lý thuyết bài: ${inputData}`;
    const urlGuide = `https://www.bing.com/search?q=${encodeURIComponent(qGuide)}&setlang=vi`;

    // Tab 3: Phind (AI chuyên ra đề trắc nghiệm)
    const qQuiz = `Dựa trên bài: ${inputData}, soạn 2 câu trắc nghiệm tương tự môn ${sub} có đáp án A,B,C,D.`;
    const urlQuiz = `https://www.bing.com/search?q=${encodeURIComponent(qQuiz)}&setlang=vi`;

    setAiUrls({ ans: urlAns, guide: urlGuide, quiz: urlQuiz });

    setTimeout(() => {
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
      onBack={() => setScreen(screen === 'ANALYSIS' || screen === 'CROP' ? 'INPUT' : 'HOME')}
      title={selectedSubject || 'AI EDU SYSTEM'}
    >
      {/* --- MÀN HÌNH CHỌN MÔN --- */}
      {screen === 'HOME' && (
        <div className="grid grid-cols-2 gap-6 mt-10 animate-in fade-in">
          {[Subject.MATH, Subject.PHYSICS, Subject.CHEMISTRY, 'NHẬT KÝ'].map((sub) => (
            <button 
              key={sub} 
              onClick={() => { if (sub !== 'NHẬT KÝ') { setSelectedSubject(sub as Subject); setScreen('INPUT'); } }} 
              className="bg-indigo-600 aspect-square rounded-[3rem] flex flex-col items-center justify-center text-white shadow-2xl active:scale-90 transition-all border-4 border-white"
            >
              <span className="text-4xl mb-2">{sub === Subject.MATH ? '📐' : sub === Subject.PHYSICS ? '⚛️' : sub === Subject.CHEMISTRY ? '🧪' : '📔'}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{sub}</span>
            </button>
          ))}
        </div>
      )}

      {/* --- MÀN HÌNH NHẬP LIỆU: 3 CỔNG VÀO --- */}
      {screen === 'INPUT' && (
        <div className="space-y-10 animate-in zoom-in-95">
          <div className="w-full aspect-video bg-white rounded-[3rem] flex items-center justify-center overflow-hidden border-4 border-slate-50 relative shadow-2xl">
            {image ? <img src={image} className="p-4 h-full object-contain" /> : (
              <p className="text-slate-300 font-bold text-xs p-10 text-center uppercase tracking-widest leading-loose">
                {voiceText || "Vui lòng chọn: \n 📸 Camera | 🖼️ Ảnh | 🎙️ Giọng nói"}
              </p>
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-indigo-600 flex flex-col items-center justify-center text-white z-50">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-widest">AI đang bóc tách kết quả...</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-4 py-6 bg-slate-50 rounded-[3rem] shadow-inner border border-white">
            <button onClick={() => setScreen('CROP')} className="w-14 h-14 rounded-2xl bg-white text-indigo-600 shadow-md flex items-center justify-center text-2xl active:scale-75 transition-all">📸</button>
            
            <input type="file" id="up" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { const r = new FileReader(); r.onload = (ev) => setImage(ev.target?.result as string); r.readAsDataURL(f); }
            }} />
            <button onClick={() => document.getElementById('up')?.click()} className="w-14 h-14 rounded-2xl bg-white text-indigo-600 shadow-md flex items-center justify-center text-2xl active:scale-75 transition-all">🖼️</button>
            
            <button onClick={() => {
              setIsRecording(!isRecording);
              if(!isRecording) setVoiceText("Cho hàm số y=x^3-3x. Tìm cực trị của hàm số.");
            }} className={`w-14 h-14 rounded-2xl ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white'} text-indigo-600 shadow-md flex items-center justify-center text-2xl transition-all`}>🎙️</button>
            
            <button onClick={handleRunAnalysis} className="w-20 h-20 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl flex items-center justify-center active:scale-75 transition-all text-4xl">🚀</button>
          </div>
        </div>
      )}

      {/* --- MÀN HÌNH CẮT ẢNH --- */}
      {screen === 'CROP' && image && (
        <div className="flex flex-col items-center animate-in fade-in">
          <div className="rounded-[2.5rem] overflow-hidden border-4 border-indigo-600 shadow-2xl">
            <ReactCrop crop={crop} onChange={c => setCrop(c)}>
              <img src={image} onLoad={onImageLoad} className="max-h-[50vh]" />
            </ReactCrop>
          </div>
          <button onClick={() => setScreen('INPUT')} className="mt-8 px-12 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl active:scale-95 transition-all">XÁC NHẬN ✅</button>
        </div>
      )}

      {/* --- MÀN HÌNH KẾT QUẢ ĐA TẦNG (CLIPPING IFRAME) --- */}
      {screen === 'ANALYSIS' && (
        <div className="flex flex-col h-[80vh] space-y-4 animate-in slide-in-from-right">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-white">
            {Object.values(MENU_TYPES).map(m => (
              <button 
                key={m} 
                onClick={() => setActiveMenu(m)} 
                className={`flex-1 py-3 rounded-xl text-[8px] font-black transition-all ${activeMenu === m ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
              >
                {m}
              </button>
            ))}
          </div>
          
          <div className="flex-1 bg-white border-4 border-indigo-600 rounded-[3.5rem] overflow-hidden shadow-2xl relative">
             <div style={{ width: '100%', height: '100%', marginTop: '-140px' }}> 
                <iframe 
                   src={activeMenu === MENU_TYPES.ANSWER ? aiUrls.ans : activeMenu === MENU_TYPES.GUIDE ? aiUrls.guide : aiUrls.quiz} 
                   className="w-full"
                   style={{ height: 'calc(100% + 140px)' }}
                   title="AI Expert Result"
                   sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                ></iframe>
             </div>
          </div>
          <p className="text-[8px] text-center font-bold text-slate-300 uppercase tracking-[0.2em]">Hệ thống AI xử lý bởi Bing Cognitive Services</p>
        </div>
      )}
    </Layout>
  );
};

export default App;
