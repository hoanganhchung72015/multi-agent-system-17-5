import React, { useState, useEffect } from 'react';
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
  // --- CÁC TRẠNG THÁI (STATE) ---
  const [screen, setScreen] = useState<'HOME' | 'INPUT' | 'CROP' | 'ANALYSIS'>('HOME');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeMenu, setActiveMenu] = useState(MENU_TYPES.ANSWER);
  const [image, setImage] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [crop, setCrop] = useState<Crop>();
  const [aiUrls, setAiUrls] = useState({ ans: '', guide: '', quiz: '' });

  // --- HÀM RESET DỮ LIỆU (GIẢI QUYẾT LỖI TREO) ---
  const resetAllData = () => {
    setImage(null);
    setVoiceText('');
    setAiUrls({ ans: '', guide: '', quiz: '' });
    setIsLoading(false);
  };

  // --- HÀM XỬ LÝ KHI NHẤN NÚT BACK ---
  const handleBack = () => {
    if (screen === 'ANALYSIS') {
      setScreen('INPUT'); // Quay lại màn hình nhập đề
      // Giữ lại đề bài cũ để user sửa nếu muốn
    } else if (screen === 'CROP') {
      setScreen('INPUT');
    } else if (screen === 'INPUT') {
      setScreen('HOME');
      resetAllData(); // Xóa sạch dữ liệu khi về trang chủ
    }
  };

  // --- HÀM GỬI DỮ LIỆU CHO AI ---
  const handleRunAnalysis = () => {
    if (!image && !voiceText) return alert("Vui lòng cung cấp đề bài!");
    setIsLoading(true);

    const inputData = voiceText || "Giải chi tiết bài tập này";
    const sub = selectedSubject || "Kiến thức";

    // Tạo link tìm kiếm AI (Dùng Bing để tránh bị chặn Iframe)
    const qAns = `${sub}: ${inputData}. Đáp án và hướng dẫn bấm máy Casio fx-580VNX.`;
    const qGuide = `Giải thích ngắn gọn công thức lý thuyết bài: ${inputData}`;
    const qQuiz = `Soạn 2 câu trắc nghiệm tương tự bài: ${inputData} có đáp án A,B,C,D.`;

    setAiUrls({
      ans: `https://www.bing.com/search?q=${encodeURIComponent(qAns)}&setlang=vi`,
      guide: `https://www.bing.com/search?q=${encodeURIComponent(qGuide)}&setlang=vi`,
      quiz: `https://www.bing.com/search?q=${encodeURIComponent(qQuiz)}&setlang=vi`
    });

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
    <Layout onBack={handleBack} title={selectedSubject || 'AI STUDY'}>
      
      {/* 1. MÀN HÌNH CHỌN MÔN (HOME) */}
      {screen === 'HOME' && (
        <div className="grid grid-cols-2 gap-6 mt-10 animate-in fade-in duration-500">
          {[Subject.MATH, Subject.PHYSICS, Subject.CHEMISTRY, 'LỊCH SỬ'].map((sub) => (
            <button 
              key={sub} 
              onClick={() => { setSelectedSubject(sub as Subject); setScreen('INPUT'); }} 
              className="bg-indigo-600 aspect-square rounded-[3rem] flex flex-col items-center justify-center text-white shadow-2xl active:scale-90 transition-all border-4 border-white/20"
            >
              <span className="text-4xl mb-2">{sub === Subject.MATH ? '📐' : sub === Subject.PHYSICS ? '⚛️' : sub === Subject.CHEMISTRY ? '🧪' : '📔'}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{sub}</span>
            </button>
          ))}
        </div>
      )}

      {/* 2. MÀN HÌNH NHẬP ĐỀ (INPUT) */}
      {screen === 'INPUT' && (
        <div className="space-y-8 animate-in zoom-in-95 duration-300">
          <div className="w-full aspect-video bg-white rounded-[3rem] flex items-center justify-center overflow-hidden border-4 border-slate-50 relative shadow-2xl">
            {image ? <img src={image} className="p-4 h-full object-contain" /> : (
              <p className="text-slate-300 font-bold text-[10px] p-10 text-center uppercase tracking-[0.2em] leading-relaxed">
                {voiceText || "Đang đợi đề bài từ bạn...\n(Camera | Ảnh | Giọng nói)"}
              </p>
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-indigo-600/90 flex flex-col items-center justify-center text-white z-50">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-widest">Hệ thống đang xử lý...</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-4 py-6 bg-slate-50 rounded-[3rem] shadow-inner border border-white">
            {/* Nút dọn dẹp nhanh */}
            <button onClick={resetAllData} className="w-12 h-12 rounded-2xl bg-white text-red-500 shadow-sm flex items-center justify-center text-xl">🗑️</button>
            
            {/* Nút Chụp ảnh */}
            <button onClick={() => setScreen('CROP')} className="w-14 h-14 rounded-2xl bg-white text-indigo-600 shadow-sm flex items-center justify-center text-2xl">📸</button>
            
            {/* Nút Tải ảnh */}
            <input type="file" id="up" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { const r = new FileReader(); r.onload = (ev) => setImage(ev.target?.result as string); r.readAsDataURL(f); }
            }} />
            <button onClick={() => document.getElementById('up')?.click()} className="w-14 h-14 rounded-2xl bg-white text-indigo-600 shadow-sm flex items-center justify-center text-2xl">🖼️</button>
            
            {/* Nút Ghi âm (Giả lập) */}
            <button onClick={() => { setIsRecording(!isRecording); if(!isRecording) setVoiceText("Giải bài tập: Tìm x biết 2x + 5 = 15"); }} 
              className={`w-14 h-14 rounded-2xl ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-white text-indigo-600'} shadow-sm flex items-center justify-center text-2xl`}>
              🎙️
            </button>
            
            {/* Nút Chạy AI */}
            <button onClick={handleRunAnalysis} className="w-20 h-20 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl flex items-center justify-center active:scale-75 transition-all text-4xl">🚀</button>
          </div>
        </div>
      )}

      {/* 3. MÀN HÌNH CẮT ẢNH (CROP) */}
      {screen === 'CROP' && image && (
        <div className="flex flex-col items-center animate-in fade-in">
          <div className="rounded-[2.5rem] overflow-hidden border-4 border-indigo-600 shadow-2xl">
            <ReactCrop crop={crop} onChange={c => setCrop(c)}>
              <img src={image} onLoad={onImageLoad} className="max-h-[50vh]" />
            </ReactCrop>
          </div>
          <button onClick={() => setScreen('INPUT')} className="mt-8 px-12 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl">XÁC NHẬN ✅</button>
        </div>
      )}

      {/* 4. MÀN HÌNH KẾT QUẢ (ANALYSIS) */}
      {screen === 'ANALYSIS' && (
        <div className="flex flex-col h-[78vh] space-y-4 animate-in slide-in-from-right duration-500">
          {/* Tabs menu */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-white shadow-inner">
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
          
          {/* Khung hiển thị AI (Kỹ thuật Clipping ẩn Header Bing) */}
          <div className="flex-1 bg-white border-4 border-indigo-600 rounded-[3.5rem] overflow-hidden shadow-2xl relative">
             <div style={{ width: '100%', height: '100%', marginTop: '-140px' }}> 
                <iframe 
                   src={activeMenu === MENU_TYPES.ANSWER ? aiUrls.ans : activeMenu === MENU_TYPES.GUIDE ? aiUrls.guide : aiUrls.quiz} 
                   className="w-full"
                   style={{ height: 'calc(100% + 140px)' }}
                   title="AI Expert Result"
                ></iframe>
             </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
