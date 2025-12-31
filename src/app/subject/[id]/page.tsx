"use client"
import { useState } from 'react';
import { Camera, Upload, Mic, Play, Volume2 } from 'lucide-react';
import { solveExercise } from '@/lib/gemini';

export default function SubjectPage({ params }: { params: { id: string } }) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleExecute = async () => {
    if (!image) return alert("Vui lòng tải ảnh đề bài!");
    setLoading(true);
    try {
      // 1. Ghi log vào DB (gọi API route)
      await fetch('/api/log', { method: 'POST', body: JSON.stringify({ subject: params.id }) });
      // 2. Giải bằng AI
      const data = await solveExercise(image, "Giải bài này giúp tôi");
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 capitalize">Môn: {params.id}</h1>
      
      {/* 3 Nút chức năng chính */}
      <div className="flex justify-between mb-4">
        <button className="flex flex-col items-center p-4 border rounded-xl bg-blue-50 w-24 hover:bg-blue-100">
          <Camera size={32} /> <span className="text-xs mt-1">Camera</span>
        </button>
        <label className="flex flex-col items-center p-4 border rounded-xl bg-green-50 w-24 cursor-pointer hover:bg-green-100">
          <Upload size={32} /> <span className="text-xs mt-1">Tải ảnh</span>
          <input type="file" hidden onChange={handleUpload} />
        </label>
        <button className="flex flex-col items-center p-4 border rounded-xl bg-yellow-50 w-24 hover:bg-yellow-100">
          <Mic size={32} /> <span className="text-xs mt-1">Ghi âm</span>
        </button>
      </div>

      {/* Nút Thực hiện ngang phía dưới */}
      <button 
        onClick={handleExecute}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition">
        {loading ? "Đang xử lý siêu tốc..." : "Thực hiện"}
      </button>

      {/* Hiển thị kết quả 3 Professor */}
      {result && (
        <div className="mt-8 space-y-4">
          <div className="flex border-b">
            {['Đáp án', 'Giảng bài', 'Luyện tập'].map((tab, idx) => (
              <button key={idx} className="px-4 py-2 font-bold border-b-2 border-blue-500">{tab}</button>
            ))}
          </div>
          
          <div className="p-4 bg-white border rounded-xl shadow-sm relative">
            <button className="absolute top-2 right-2 text-blue-500"><Volume2 /></button>
            <div className="prose max-w-none">
                {/* Ở đây bạn có thể dùng state để chuyển đổi giữa 3 kết quả từ object result */}
                <p className="text-gray-800">{result.tab2}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}