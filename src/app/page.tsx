import Link from 'next/link';
import { sql } from "@vercel/postgres";

export default async function HomePage() {
  // Lấy dữ liệu nhật ký từ Postgres
  const { rows } = await sql`SELECT * FROM diary ORDER BY access_time DESC LIMIT 10`;

  const subjects = [
    { id: 'math', name: 'Toán học', icon: '📐' },
    { id: 'physics', name: 'Vật lý', icon: '⚛️' },
    { id: 'chemistry', name: 'Hóa học', icon: '🧪' },
  ];

  return (
    <main className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold text-center mb-8">Hệ Sinh Thái Học Tập Thông Minh</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-12">
        {subjects.map((s) => (
          <Link href={`/subject/${s.id}`} key={s.id} 
            className="p-6 border-2 border-blue-500 rounded-2xl hover:bg-blue-50 transition text-center shadow-lg">
            <span className="text-4xl">{s.icon}</span>
            <h2 className="mt-2 font-bold">{s.name}</h2>
          </Link>
        ))}
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl shadow-inner">
        <h2 className="text-xl font-bold mb-4 italic">Nhật ký truy cập</h2>
        <table className="w-full text-left bg-white rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">Thời gian</th>
              <th className="p-3">Môn học</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="p-3 text-sm">{new Date(log.access_time).toLocaleString('vi-VN')}</td>
                <td className="p-3 font-medium">{log.subject_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}