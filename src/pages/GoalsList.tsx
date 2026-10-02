import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Card, SectionTitle, Button, ProgressBar, EmptyState } from "../components/ui";
import { useAppStore, goalTypeLabel } from "../store/useAppStore";
import { formatMoney } from "../lib/finance";

export default function GoalsList() {
  const navigate = useNavigate();
  const goals = useAppStore((s) => s.goals);
  const profile = useAppStore((s) => s.profile);

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex justify-between items-center">
        <SectionTitle subtitle="Структура: зачем, сколько, к какому сроку, какой шаг в месяц">Цели</SectionTitle>
      </div>

      {goals.length === 0 ? (
        <EmptyState title="Пока нет ни одной цели" body="Поставьте первую — и увидите прогресс и напоминания здесь." />
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map((g) => (
            <Card key={g.id} className="flex flex-col gap-2 cursor-pointer" >
              <div onClick={() => navigate(`/goals/${g.id}`)}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-terracotta uppercase">{goalTypeLabel(g.type)}</span>
                    <p className="font-bold text-warmbrown">{g.title}</p>
                  </div>
                  <span className="text-sm text-muted">{formatMoney(g.monthlyContribution, profile.currency)}/мес</span>
                </div>
                <ProgressBar value={g.currentAmount} max={g.targetAmount} />
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>{formatMoney(g.currentAmount, profile.currency)}</span>
                  <span>{formatMoney(g.targetAmount, profile.currency)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Button onClick={() => navigate("/goals/new")} className="flex items-center justify-center gap-2 w-full">
        <Plus size={16} /> Новая цель
      </Button>
    </div>
  );
}
