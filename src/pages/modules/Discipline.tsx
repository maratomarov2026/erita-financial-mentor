import { useState } from "react";
import { Plus, Trash2, Flame, Check } from "lucide-react";
import { Card, SectionTitle, Button, Input, EmptyState } from "../../components/ui";
import { useAppStore } from "../../store/useAppStore";
import { formatMoney } from "../../lib/finance";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
}

export default function Discipline() {
  const habits = useAppStore((s) => s.habits);
  const addHabit = useAppStore((s) => s.addHabit);
  const removeHabit = useAppStore((s) => s.removeHabit);
  const toggleHabit = useAppStore((s) => s.toggleHabit);

  const wishlist = useAppStore((s) => s.wishlist);
  const addWishlistItem = useAppStore((s) => s.addWishlistItem);
  const decideWishlistItem = useAppStore((s) => s.decideWishlistItem);

  const checkIns = useAppStore((s) => s.checkIns);
  const addCheckIn = useAppStore((s) => s.addCheckIn);
  const profile = useAppStore((s) => s.profile);

  const [newHabit, setNewHabit] = useState("");
  const [wishName, setWishName] = useState("");
  const [wishAmount, setWishAmount] = useState("");
  const [did, setDid] = useState("");
  const [blockers, setBlockers] = useState("");
  const [feeling, setFeeling] = useState("5");

  const today = todayISO();

  const createHabit = () => {
    if (!newHabit.trim()) return;
    addHabit(newHabit.trim());
    setNewHabit("");
  };

  const createWish = () => {
    const amount = Number(wishAmount);
    if (!wishName.trim() || amount <= 0) return;
    addWishlistItem(wishName.trim(), amount);
    setWishName("");
    setWishAmount("");
  };

  const submitCheckIn = () => {
    if (!did.trim()) return;
    addCheckIn({ week: checkIns.length + 1, did, blockers, feeling: Number(feeling) });
    setDid("");
    setBlockers("");
    setFeeling("5");
  };

  return (
    <div className="flex flex-col gap-5 pb-10">
      <SectionTitle subtitle="Привычки, правило 24 часов, недельный обзор">Дисциплина и навыки</SectionTitle>

      <Card className="flex flex-col gap-3">
        <SectionTitle subtitle="Отмечайте выполнение — пропуск не сжигает серию">Трекер привычек</SectionTitle>
        {habits.length === 0 ? (
          <EmptyState title="Пока нет привычек" body="Добавьте: проверить бюджет, записать траты, перевести в накопления." />
        ) : (
          <div className="flex flex-col gap-2">
            {habits.map((h) => {
              const doneToday = h.history.includes(today);
              return (
                <div key={h.id} className="flex items-center justify-between rounded-xl2 border border-blush px-4 py-3">
                  <div>
                    <p className="font-semibold text-warmbrown">{h.name}</p>
                    <p className="text-xs text-muted flex items-center gap-1">
                      <Flame size={12} /> серия: {h.streak}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleHabit(h.id, today)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                        doneToday ? "bg-sage border-sage text-white" : "border-blush text-muted"
                      }`}
                    >
                      <Check size={16} />
                    </button>
                    <button onClick={() => removeHabit(h.id)} className="text-muted hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex gap-2">
          <Input value={newHabit} onChange={setNewHabit} placeholder="Новая привычка" />
          <Button onClick={createHabit}>
            <Plus size={16} />
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle subtitle="Внесите желаемую покупку — через сутки спросим «ещё хочу?»">Правило 24 часов</SectionTitle>
        <div className="flex gap-2">
          <Input value={wishName} onChange={setWishName} placeholder="Что хочу купить" />
          <Input value={wishAmount} onChange={setWishAmount} type="number" placeholder="Сумма" />
          <Button onClick={createWish}>
            <Plus size={16} />
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {wishlist
            .filter((w) => !w.decision)
            .map((w) => {
              const ready = hoursSince(w.addedAt) >= 24;
              return (
                <div key={w.id} className="rounded-xl2 border border-blush px-4 py-3">
                  <div className="flex justify-between">
                    <p className="font-semibold text-warmbrown">{w.name}</p>
                    <p className="text-sm text-muted">{formatMoney(w.amount, profile.currency)}</p>
                  </div>
                  {ready ? (
                    <div className="flex gap-2 mt-2">
                      <Button variant="secondary" onClick={() => decideWishlistItem(w.id, "bought")} className="flex-1">
                        Да, покупаю
                      </Button>
                      <Button variant="ghost" onClick={() => decideWishlistItem(w.id, "skipped")} className="flex-1">
                        Уже не хочу
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted mt-1">
                      Ещё {Math.max(0, Math.ceil(24 - hoursSince(w.addedAt)))} ч. до вопроса «ещё хочу?»
                    </p>
                  )}
                </div>
              );
            })}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle subtitle="Что получилось, что мешало, что скорректировать">Недельный обзор</SectionTitle>
        <label className="block">
          <span className="block text-sm font-semibold text-warmbrown mb-1">Что получилось на этой неделе?</span>
          <textarea value={did} onChange={(e) => setDid(e.target.value)} rows={2} className="w-full rounded-xl2 border border-blush bg-paper px-4 py-2 outline-none focus:border-terracotta text-warmbrown" />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold text-warmbrown mb-1">Что мешало?</span>
          <textarea value={blockers} onChange={(e) => setBlockers(e.target.value)} rows={2} className="w-full rounded-xl2 border border-blush bg-paper px-4 py-2 outline-none focus:border-terracotta text-warmbrown" />
        </label>
        <Input label="Самочувствие (1-10)" value={feeling} onChange={setFeeling} type="number" />
        <Button onClick={submitCheckIn}>Сохранить обзор</Button>

        {checkIns.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {checkIns.slice().reverse().map((c, i) => (
              <div key={i} className="text-sm border-t border-blush pt-2">
                <p className="font-semibold text-warmbrown">Неделя {c.week} · самочувствие {c.feeling}/10</p>
                <p className="text-muted">{c.did}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
