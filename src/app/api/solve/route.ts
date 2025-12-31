import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "@/lib/ai-prompt";
import { sql } from "@vercel/postgres";
import { waitUntil } from "@vercel/functions"; // Cực kỳ quan trọng để chạy ngầm

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const runtime = 'edge'; // Chạy tại trạm gần người dùng nhất

export async function POST(req: Request) {
  try {
    const { image, audioText, subjectName } = await req.json();

    // 1. Khởi tạo Model AI
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" } // Ép AI trả JSON sạch
    });

    // 2. Gọi AI xử lý (Đây là tác vụ đợi - await)
    const result = await model.generateContent([
      SYSTEM_PROMPT,
      { 
        inlineData: { 
          data: image.split(",")[1], // Chỉ lấy phần base64, bỏ prefix data:image/...
          mimeType: "image/jpeg" 
        } 
      },
      audioText || "Giải bài tập này"
    ]);

    const aiResponse = result.response.text();

    // 3. XỬ LÝ CHẠY NGẦM (Ghi Postgres mà không bắt người dùng đợi)
    // waitUntil đảm bảo Vercel không ngắt hàm cho đến khi DB được ghi xong
    waitUntil(
      (async () => {
        try {
          await sql`
            INSERT INTO diary (subject_name, access_time) 
            VALUES (${subjectName || 'Không xác định'}, NOW())
          `;
          console.log("Ghi nhật ký thành công ngầm.");
        } catch (dbError) {
          console.error("Lỗi ghi DB ngầm:", dbError);
        }
      })()
    );

    // 4. TRẢ KẾT QUẢ NGAY LẬP TỨC
    return new Response(aiResponse, {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store' 
      },
    });

  } catch (error: any) {
    console.error("Lỗi API:", error);
    return new Response(JSON.stringify({ error: "Lỗi xử lý hệ thống" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}