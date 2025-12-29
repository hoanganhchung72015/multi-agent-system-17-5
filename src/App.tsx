import React, { useState, useEffect, useCallback } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Import các định nghĩa cần thiết
import { Subject } from '../types';
import { Layout } from '../components/Layout';

const MENU_TYPES = {
  ANSWER: '🎯 ĐÁP ÁN & CASIO',
  GUIDE: '📝 GIA SƯ AI',
  QUIZ: '✏️ LUYỆN SKILL'
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<'HOME' | 'INPUT' | 'CROP' | 'ANALYSIS' | 'DIARY'>('HOME');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeMenu, setActiveMenu] = useState(MENU_TYPES.ANSWER);
  const [image, setImage] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [crop, setCrop] = useState<Crop>();
  const [aiUrls, setAiUrls] = useState({ ans: '', guide: '', quiz: '' });

  // --- HÀM XỬ LÝ CHÍNH: DUCKDUCKGO AI INTEGRATION ---
  const handleRunAnalysis = () => {
    const inputData = voiceText || "Giải bài tập trong ảnh";
    if (!image && !voiceText) return alert("Vui lòng cung cấp đề bài!");
    
    setIsLoading(true);
    const sub = selectedSubject || "Kiến thức";

    // Cấu hình URL DuckDuckGo với các tham số ẩn thanh tìm kiếm (&k1=-1) 
    // để giao diện hiện ra giống như văn bản trả về của App
    
    // Tab 1: Đáp án & Casio 580 (Sử dụng toán học chuyên sâu)
    const qAns = `${sub}: ${inputData}. Trả lời đáp án ngắn gọn và cách bấm máy Casio fx580VNX.`;
    const urlAns = `https://duckduckgo.com/?q=${encodeURIComponent(qAns)}&k1=-1&kaf=1&ia=answer`;
    
    // Tab 2: Giải thích gọn (Tập trung vào lý thuyết cốt lõi)
    const qGuide = `Giải thích ngắn gọn công thức và lý thuyết bài: ${inputData}`;
    const urlGuide = `https://duckduckgo.com/?q=${encodeURIComponent(qGuide)}&k1=-1&ia=web`;

    // Tab 3: Phind (AI 2) - Soạn câu hỏi trắc nghiệm tương tác
    // Phind vẫn là AI mạnh nhất để ra đề trắc nghiệm mà không cần API
    const qQuiz = `Dựa trên bài: ${inputData}, soạn 2 câu trắc nghiệm tương tự môn ${sub} có đáp án A,B,C,D.`;
    const urlQuiz = `https://www.phind.com/search?q=${encodeURIComponent(qQuiz)}`;

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
      title={selectedSubject || 'Hệ thống AI Đa tầng'}
    >
      {/* --- MÀN HÌNH CHÍNH --- */}
      {screen === 'HOME' && (
        <div className="grid grid-cols-2 gap-5 mt-6 animate-in fade-in">
          {[Subject.MATH, Subject.PHYSICS, Subject.CHEMISTRY, 'DIARY'].map((sub) => (
            <button 
              key={sub} 
              onClick={() => { if (sub === 'DIARY') setScreen('DIARY'); else { setSelectedSubject(sub as Subject); setScreen('INPUT'); } }} 
              className="bg-indigo-600 aspect-square rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-all"
            >
              <span className="text-lg font-black mb-2 uppercase tracking-tight">{sub}</span>
              <span className="text-5xl">{sub === Subject.MATH ? '📐' : sub === Subject.PHYSICS ? '⚛️' : '🧪'}</span>
            </button>
          ))}
        </div>
      )}

      {/* --- MÀN HÌNH NHẬP LIỆU: 3 ĐẦU VÀO (ẢNH, CAMERA, GIỌNG NÓI) --- */}
      {screen === 'INPUT' && (
        <div className="space-y-10 animate-in zoom-in-95">
          <div className="w-full aspect-[16/10] bg-white rounded-[3rem] flex items-center justify-center overflow-hidden border-2 border-slate-100 relative shadow-2xl">
            {image ? <img src={image} className="p-6 h-full object-contain" /> : (
               <div className="p-10 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                 {voiceText || "Đang đợi đề bài..."}
               </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-indigo-600/95 flex flex-col items-center justify-center text-white z-50 p-6 text-center">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">AI Agent đang bóc tách tri thức...</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-4 bg-slate-50 p-6 rounded-[2.5rem]">
            {/* 1. Nút Camera */}
            <button onClick={() => setScreen('CROP')} className="w-14 h-14 rounded-2xl bg-white text-indigo-600 shadow-sm flex items-center justify-center text-2xl">📸</button>
            
            {/* 2. Nút Tải ảnh */}
            <input type="file" id="upload" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => setImage(ev.target?.result as string);
                reader.readAsDataURL(file);
              }
            }} />
            <button onClick={() => document.getElementById('upload')?.click()} className="w-14 h-14 rounded-2xl bg-white text-indigo-600 shadow-sm flex items-center justify-center text-2xl">🖼️</button>
            
            {/* 3. Nút Ghi âm */}
            <button onClick={() => {
              setIsRecording(!isRecording);
              if(!isRecording) setVoiceText("Đang nghe: Cho hàm số y=x^2-4x+3..."); // Giả lập ghi âm
            }} className={`w-14 h-14 rounded-2xl ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white'} text-indigo-600 shadow-sm flex items-center justify-center text-2xl`}>🎙️</button>
            
            {/* Nút Gửi */}
            <button onClick={handleRunAnalysis} className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white shadow-2xl flex items-center justify-center active:scale-75 transition-all text-3xl">🚀</button>
          </div>
        </div>
      )}

      {/* --- MÀN HÌNH CẮT ẢNH --- */}
      {screen === 'CROP' && image && (
        <div className="flex flex-col items-center">
          <div className="rounded-[2rem] overflow-hidden border-4 border-indigo-600">
            <ReactCrop crop={crop} onChange={c => setCrop(c)}>
              <img src={image} onLoad={onImageLoad} className="max-h-[50vh]" />
            </ReactCrop>
          </div>
          <button onClick={() => setScreen('INPUT')} className="mt-8 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black">XÁC NHẬN ✅</button>
        </div>
      )}

      {/* --- MÀN HÌNH KẾT QUẢ ĐA TẦNG (VƯỢT LỖI KẾT NỐI) --- */}
      {screen === 'ANALYSIS' && (
        <div className="flex flex-col h-[78vh] space-y-4 animate-in slide-in-from-right">
          <div className="flex bg-slate-200 p-1 rounded-2xl">
            <button onClick={() => setActiveMenu(MENU_TYPES.ANSWER)} className={`flex-1 py-3 rounded-xl text-[8px] font-black transition-all ${activeMenu === MENU_TYPES.ANSWER ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>{MENU_TYPES.ANSWER}</button>
            <button onClick={() => setActiveMenu(MENU_TYPES.GUIDE)} className={`flex-1 py-3 rounded-xl text-[8px] font-black transition-all ${activeMenu === MENU_TYPES.GUIDE ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>{MENU_TYPES.GUIDE}</button>
            <button onClick={() => setActiveMenu(MENU_TYPES.QUIZ)} className={`flex-1 py-3 rounded-xl text-[8px] font-black transition-all ${activeMenu === MENU_TYPES.QUIZ ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>{MENU_TYPES.QUIZ}</button>
          </div>
          
          <div className="flex-1 bg-white border-4 border-indigo-600 rounded-[2.5rem] overflow-hidden shadow-2xl">
             <iframe 
                src={activeMenu === MENU_TYPES.ANSWER ? aiUrls.ans : activeMenu === MENU_TYPES.GUIDE ? aiUrls.guide : aiUrls.quiz} 
                className="w-full h-full border-none"
                // Thêm sandbox để bảo mật và mượt hơn
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
             ></iframe>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
