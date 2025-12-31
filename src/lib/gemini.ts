import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function solveExercise(imageBase64: string, audioTranscript: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    Bạn là một giáo sư đa năng. Hãy giải bài tập trong ảnh này.
    Nếu có phần âm thanh kèm theo, hãy chú ý: "${audioTranscript}".
    Trả về định dạng JSON nghiêm ngặt sau:
    {
      "tab1": "Chỉ ghi đáp án cuối cùng, cực gọn.",
      "tab2": "Giải thích từng bước chi tiết, dùng LaTeX cho công thức.",
      "tab3": {
        "q1": "Câu hỏi trắc nghiệm tương tự 1",
        "options1": ["A. x", "B. y", "C. z", "D. t"],
        "ans1": "A",
        "explain1": "Giải thích ngắn gọn"
      },
      "voice": "Tóm tắt mấu chốt vấn đề trong 1 câu ngắn để đọc."
    }
  `;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: imageBase64.split(',')[1], mimeType: "image/jpeg" } }
  ]);
  
  return JSON.parse(result.response.text());
}
