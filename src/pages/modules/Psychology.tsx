import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, SectionTitle, Button, Chip } from "../../components/ui";
import { useAppStore } from "../../store/useAppStore";
import {
  PSYCHOLOGY_LESSONS,
  COMMON_LIMITING_BELIEFS,
  BELIEF_REFRAME_QUESTIONS,
  ANXIETY_JOURNAL_QUESTIONS,
} from "../../data/content";

export default function Psychology() {
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [selectedBelief, setSelectedBelief] = useState("");
  const [reframeAnswers, setReframeAnswers] = useState<string[]>(["", "", ""]);
  const [scariestThought, setScariestThought] = useState("");
  const [scariestAction, setScariestAction] = useState("");
  const [journalText, setJournalText] = useState("");
  const [journalEmotion, setJournalEmotion] = useState("");

  const journal = useAppStore((s) => s.journal);
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);

  const saveReframe = () => {
    if (!selectedBelief) return;
    addJournalEntry({
      date: new Date().toISOString(),
      text: `Убеждение: «${selectedBelief}».\n${BELIEF_REFRAME_QUESTIONS.map((q, i) => `${q} — ${reframeAnswers[i] || "—"}`).join("\n")}`,
      emotion: "работа с убеждением",
      mentorQuestion: BELIEF_REFRAME_QUESTIONS[0],
    });
    setSelectedBelief("");
    setReframeAnswers(["", "", ""]);
  };

  const saveScariest = () => {
    if (!scariestThought) return;
    addJournalEntry({
      date: new Date().toISOString(),
      text: `Самое страшное: ${scariestThought}\nЧто я могу сделать: ${scariestAction || "—"}`,
      emotion: "страх",
      mentorQuestion: "Что самое страшное и что я могу сделать?",
    });
    setScariestThought("");
    setScariestAction("");
  };

  const saveJournal = () => {
    if (!journalText) return;
    addJournalEntry({
      date: new Date().toISOString(),
      text: journalText,
      emotion: journalEmotion || "не указано",
      mentorQuestion: ANXIETY_JOURNAL_QUESTIONS[Math.floor(Math.random() * ANXIETY_JOURNAL_QUESTIONS.length)],
    });
    setJournalText("");
    setJournalEmotion("");
  };

  return (
    <div className="flex flex-col gap-5 pb-10">
      <SectionTitle subtitle="Убеждения, тревога, дневник мыслей">Психология богатого человека</SectionTitle>

      <Card className="flex flex-col gap-2">
        <SectionTitle>Уроки</SectionTitle>
        {PSYCHOLOGY_LESSONS.map((l) => (
          <div key={l.id} className="border-b border-blush last:border-0 py-2">
            <button
              className="w-full flex justify-between items-center text-left"
              onClick={() => setOpenLesson(openLesson === l.id ? null : l.id)}
            >
              <span className="font-semibold text-warmbrown">{l.title}</span>
              <span className="flex items-center gap-2 text-xs text-muted">
                {l.minutes} мин {openLesson === l.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>
            {openLesson === l.id && <p className="text-sm text-muted mt-2 leading-relaxed">{l.body}</p>}
          </div>
        ))}
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle subtitle="Выберите установку и переформулируйте её">Поиск ограничивающих убеждений</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {COMMON_LIMITING_BELIEFS.map((b) => (
            <Chip key={b.id} active={selectedBelief === b.text} onClick={() => setSelectedBelief(b.text)}>
              {b.text}
            </Chip>
          ))}
        </div>
        {selectedBelief && (
          <div className="flex flex-col gap-3 mt-2">
            {BELIEF_REFRAME_QUESTIONS.map((q, i) => (
              <label key={i} className="block">
                <span className="block text-sm font-semibold text-warmbrown mb-1">{q}</span>
                <textarea
                  value={reframeAnswers[i]}
                  onChange={(e) => {
                    const next = [...reframeAnswers];
                    next[i] = e.target.value;
                    setReframeAnswers(next);
                  }}
                  rows={2}
                  className="w-full rounded-xl2 border border-blush bg-paper px-4 py-2 outline-none focus:border-terracotta text-warmbrown"
                />
              </label>
            ))}
            <Button onClick={saveReframe}>Сохранить в дневник</Button>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle subtitle="Практика «Что самое страшное и что я могу сделать»">Практика со страхом</SectionTitle>
        <label className="block">
          <span className="block text-sm font-semibold text-warmbrown mb-1">Что самое страшное может произойти?</span>
          <textarea
            value={scariestThought}
            onChange={(e) => setScariestThought(e.target.value)}
            rows={2}
            className="w-full rounded-xl2 border border-blush bg-paper px-4 py-2 outline-none focus:border-terracotta text-warmbrown"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold text-warmbrown mb-1">Что я могу сделать, если это случится?</span>
          <textarea
            value={scariestAction}
            onChange={(e) => setScariestAction(e.target.value)}
            rows={2}
            className="w-full rounded-xl2 border border-blush bg-paper px-4 py-2 outline-none focus:border-terracotta text-warmbrown"
          />
        </label>
        <Button onClick={saveScariest}>Сохранить в дневник</Button>
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle subtitle="3-5 минут в день — отметьте мысль и эмоцию">Дневник тревог</SectionTitle>
        <label className="block">
          <span className="block text-sm font-semibold text-warmbrown mb-1">Что произошло / о чём мысли?</span>
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            rows={2}
            className="w-full rounded-xl2 border border-blush bg-paper px-4 py-2 outline-none focus:border-terracotta text-warmbrown"
          />
        </label>
        <input
          value={journalEmotion}
          onChange={(e) => setJournalEmotion(e.target.value)}
          placeholder="Эмоция (например: тревога, облегчение)"
          className="rounded-xl2 border border-blush bg-paper px-4 py-2 outline-none focus:border-terracotta text-warmbrown"
        />
        <Button onClick={saveJournal}>Записать</Button>
      </Card>

      {journal.length > 0 && (
        <Card className="flex flex-col gap-3">
          <SectionTitle>История дневника</SectionTitle>
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
            {journal.map((e) => (
              <div key={e.id} className="border-b border-blush last:border-0 pb-2">
                <p className="text-xs text-muted">{new Date(e.date).toLocaleString("ru-RU")} · {e.emotion}</p>
                <p className="text-sm text-warmbrown whitespace-pre-line">{e.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
