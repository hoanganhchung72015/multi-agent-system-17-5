import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export function ProfessorTabs({ data }: { data: any }) {
  return (
    <Tabs defaultValue="tab1" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tab1">Professor 1 (Đáp án)</TabsTrigger>
        <TabsTrigger value="tab2">Professor 2 (Giảng bài)</TabsTrigger>
        <TabsTrigger value="tab3">Professor 3 (Luyện tập)</TabsTrigger>
      </TabsList>
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <TabsContent value="tab1" className="p-4 border rounded-lg bg-white">
          <p className="font-bold text-xl text-blue-600">{data.tab1}</p>
          <button onClick={() => playVoice(data.voice_summary)}>🔊 Nghe tóm tắt</button>
        </TabsContent>
        {/* Tương tự cho Tab 2 và Tab 3 */}
      </motion.div>
    </Tabs>
  );
}