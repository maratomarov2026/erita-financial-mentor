import { useEffect, useRef, useState } from "react";
import { Send, ShieldAlert } from "lucide-react";
import { SectionTitle, Card } from "../components/ui";
import { useAppStore } from "../store/useAppStore";
import { MENTOR_SCENARIOS, MENTOR_DISCLAIMER, mentorReply } from "../data/mentorScripts";

export default function Mentor() {
  const chat = useAppStore((s) => s.chat);
  const addChatMessage = useAppStore((s) => s.addChatMessage);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const send = (text: string) => {
    if (!text.trim()) return;
    addChatMessage({ role: "user", text });
    setInput("");
    setTimeout(() => {
      addChatMessage({ role: "mentor", text: mentorReply(text) });
    }, 400);
  };

  const startScenario = (opening: string) => {
    addChatMessage({ role: "mentor", text: opening });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <SectionTitle subtitle="Коучинговый стиль: вопросы, которые помогают вам самой найти решение">Наставник</SectionTitle>

      <Card className="mb-3 bg-blush/40 border border-terracotta-light flex gap-2 items-start">
        <ShieldAlert size={16} className="text-terracotta-dark mt-0.5 shrink-0" />
        <p className="text-xs text-warmbrown">{MENTOR_DISCLAIMER}</p>
      </Card>

      {chat.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {MENTOR_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => startScenario(s.opening)}
              className="rounded-full px-4 py-2 text-sm font-semibold border border-blush bg-paper text-warmbrown hover:border-terracotta-light"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-3">
        {chat.map((m) => (
          <div key={m.id} className={`max-w-[80%] rounded-xl2 px-4 py-3 text-sm ${m.role === "user" ? "self-end bg-terracotta text-white" : "self-start bg-paper shadow-soft text-warmbrown"}`}>
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2 pt-2 border-t border-blush">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Напишите наставнику..."
          className="flex-1 rounded-full border border-blush bg-paper px-4 py-3 outline-none focus:border-terracotta text-warmbrown"
        />
        <button
          onClick={() => send(input)}
          className="w-12 h-12 rounded-full bg-terracotta text-white flex items-center justify-center shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
