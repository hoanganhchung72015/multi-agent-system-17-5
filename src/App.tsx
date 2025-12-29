import React, { useState, useEffect, useCallback } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Import các định nghĩa cần thiết
import { Subject } from '../types';
import { Layout } from '../components/Layout';

const MENU_TYPES = {
  ANSWER: '🎯 ĐÁP ÁN & CASIO',
  GUIDE: '📝 GIẢI THÍCH GỌN',
  QUIZ: '✏️ LUYỆN TẬP (AI 2)'
};

interface DiaryEntry {
  id: string;
  subject: string;
  type: 'IMAGE' | 'VOICE';
  content: string; 
  time: string;
}

const App: React.FC = () => {
  const [screen, setScreen] = useState<'HOME' | 'INPUT' | 'CROP' | 'ANALYSIS' | 'DIARY'>('HOME');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeMenu, setActiveMenu] = useState(MENU_TYPES.ANSWER);
  const [image, setImage] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [crop, setCrop] = useState<Crop>();
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  
  // Lưu URL cho 3 Tab AI
  const [aiUrls, setAiUrls] = useState({ ans: '', guide: '', quiz: '' });

  useEffect(() => {
    const saved = localStorage.getItem('study_diary');
    if (saved) {
      try { setDiaryEntries(JSON.parse(saved)); } catch (e) { console.error("Lỗi nhật ký"); }
    }
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

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
  };

  // --- HÀM XỬ LÝ CHÍNH TÍCH HỢP MULTI-AI ---
  const handleRunAnalysis = () => {
    if (!image && !voiceText) return alert("Vui lòng cung cấp đề bài!");
    
    setIsLoading(true);
    saveToDiary(image ? 'IMAGE' : 'VOICE', image || voiceText);
    
    const query = voiceText || "Giải bài tập trong ảnh này";
    const sub = selectedSubject || "Kiến thức";

    // Cấu hình 3 luồng AI
    const urlAns = `https://www.perplexity.ai/search?q=${encodeURIComponent("Môn " + sub + ": " + query + ". Cho đáp án ngắn gọn và hướng dẫn cách bấm máy tính Casio để giải.")}`;
    const urlGuide = `https://www.perplexity.ai/search?q=${encodeURIComponent("Giải thích ngắn gọn lý thuyết và các bước giải bài: " + query)}`;
    const urlQuiz = `https://www.phind.com/search?q=${encodeURIComponent("Dựa trên bài " + query + ", soạn 2 câu trắc nghiệm tương tự môn " + sub + " có đáp án để tôi luyện tập.")}`;

    setAiUrls({ ans: urlAns, guide: urlGuide, quiz: urlQuiz });

    setTimeout(() => {
      setIsLoading(false);
      setScreen('ANALYSIS');
    }, 2000);
  };

  return (
    <Layout 
      onBack={() => {
        if (screen === 'ANALYSIS' || screen === 'CROP') setScreen('INPUT');
        else if (screen === 'INPUT' || screen === 'DIARY') setScreen('HOME');
      }}
      title={selectedSubject || (screen === 'DIARY' ? 'Nhật ký' : 'AI STUDY')}
    >
      {/* --- MÀN HÌNH CHÍNH --- */}
      {screen === 'HOME' && (
        <div className="grid grid-cols-2 gap-5 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {[
            { name: Subject.MATH, color: 'bg-indigo-600', icon: '📐' },
            { name: Subject.PHYSICS, color: 'bg-violet-600', icon: '⚛️' },
            { name: Subject.CHEMISTRY, color: 'bg-emerald-600', icon: '🧪' },
            { name: Subject.DIARY, color: 'bg-amber-600', icon: '📔' },
          ].map((sub) => (
            <button 
              key={sub.name} 
              onClick={() => { if (sub.name === Subject.DIARY) setScreen('DIARY'); else { setSelectedSubject(sub.name as Subject); setScreen('INPUT'); } }} 
              className={`${sub.color} aspect-square rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-all`}
            >
              <span className="text-lg font-black mb-2 uppercase tracking-tight">{sub.name}</span>
              <span className="text-5xl">{sub.icon}</span>
            </button>
          ))}
        </div>
      )}

      {/* --- MÀN HÌNH NHẬP LIỆU --- */}
      {screen === 'INPUT' && (
        <div className="space-y-10 animate-in zoom-in-95 duration-500">
          <div className="w-full aspect-[16/10] bg-white rounded-[3rem] flex items-center justify-center overflow-hidden border-2 border-slate-100 relative shadow-2xl">
            {image ? <img src={image} className="p-6 h-full object-contain" /> : <div className="p-10 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">{voiceText || "Đang đợi đề bài..."}</div>}
            {isLoading && (
              <div className="absolute inset-0 bg-indigo-600/90 backdrop-blur-md flex flex-col items-center justify-center text-white z-50 text-center p-4">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Hệ thống AI đa luồng đang phân tích...</p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center px-4">
            <button onClick={() => setScreen('CROP')} className="w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg flex items-center justify-center active:scale-75 transition-all">📸</button>
            <textarea 
              className="flex-1 mx-4 p-4 rounded-2xl border-2 border-slate-100 text-xs focus:outline-none focus:border-indigo-600 h-14 resize-none"
              placeholder="Nhập đề bài..."
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
            />
            <button onClick={handleRunAnalysis} className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white shadow-2xl flex items-center justify-center active:scale-75 transition-all text-3xl">🚀</button>
          </div>
        </div>
      )}

      {/* --- MÀN HÌNH CẮT ẢNH --- */}
      {screen === 'CROP' && image && (
        <div className="flex flex-col items-center animate-in fade-in">
          <div className="rounded-[2rem] overflow-hidden border-4 border-indigo-600 shadow-2xl">
            <ReactCrop crop={crop} onChange={c => setCrop(c)}>
              <img src={image} onLoad={onImageLoad} className="max-h-[55vh]" />
            </ReactCrop>
          </div>
          <button onClick={() => setScreen('INPUT')} className="mt-8 px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg uppercase tracking-widest active:scale-95 transition-all">XÁC NHẬN ✅</button>
        </div>
      )}

      {/* --- MÀN HÌNH KẾT QUẢ ĐA TẦNG (MULTI-AI IFRAME) --- */}
      {screen === 'ANALYSIS' && (
        <div className="flex flex-col h-[75vh] space-y-4 animate-in slide-in-from-right">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-white shadow-sm">
            <button onClick={() => setActiveMenu(MENU_TYPES.ANSWER)} className={`flex-1 py-3 rounded-xl text-[8px] font-black transition-all ${activeMenu === MENU_TYPES.ANSWER ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>{MENU_TYPES.ANSWER}</button>
            <button onClick={() => setActiveMenu(MENU_TYPES.GUIDE)} className={`flex-1 py-3 rounded-xl text-[8px] font-black transition-all ${activeMenu === MENU_TYPES.GUIDE ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>{MENU_TYPES.GUIDE}</button>
            <button onClick={() => setActiveMenu(MENU_TYPES.QUIZ)} className={`flex-1 py-3 rounded-xl text-[8px] font-black transition-all ${activeMenu === MENU_TYPES.QUIZ ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>{MENU_TYPES.QUIZ}</button>
          </div>
          
          <div className="flex-1 bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
             <iframe 
                src={activeMenu === MENU_TYPES.ANSWER ? aiUrls.ans : activeMenu === MENU_TYPES.GUIDE ? aiUrls.guide : aiUrls.quiz} 
                className="w-full h-full border-none"
                title="AI Expert Result"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
             ></iframe>
          </div>
        </div>
      )}

      {/* --- MÀN HÌNH NHẬT KÝ --- */}
      {screen === 'DIARY' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-black text-indigo-600 uppercase tracking-widest text-lg">Lịch sử</h2>
            <button onClick={() => { if(window.confirm("Xóa hết?")) { setDiaryEntries([]); localStorage.removeItem('study_diary'); } }} className="text-[10px] font-black text-red-500">XÓA TẤT CẢ 🗑️</button>
          </div>
          <div className="space-y-4">
            {diaryEntries.map(entry => (
              <div key={entry.id} className="bg-white p-5 rounded-[2.2rem] shadow-sm border border-slate-50 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[10px] bg-indigo-600`}>{entry.subject.charAt(0)}</div>
                <div className="flex-1">
                  <p className="text-[8px] text-slate-300 font-bold">{entry.time}</p>
                  <p className="text-xs font-black text-slate-700 truncate w-40">{entry.type === 'IMAGE' ? '📷 Bài tập ảnh' : entry.content}</p>
                </div>
                {entry.type === 'IMAGE' && <img src={entry.content} className="w-12 h-12 rounded-xl object-cover" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
