import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PartyPopper, Trash2 } from "lucide-react";
import { Card, SectionTitle, Button, ProgressBar, Input } from "../components/ui";
import { useAppStore, goalTypeLabel } from "../store/useAppStore";
import { formatMoney } from "../lib/finance";

export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const goals = useAppStore((s) => s.goals);
  const contributeToGoal = useAppStore((s) => s.contributeToGoal);
  const removeGoal = useAppStore((s) => s.removeGoal);
  const profile = useAppStore((s) => s.profile);
  const [amount, setAmount] = useState("");

  const goal = goals.find((g) => g.id === id);
  if (!goal) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted">Цель не найдена.</p>
        <Button onClick={() => navigate("/goals")}>К списку целей</Button>
      </div>
    );
  }

  const add = () => {
    const n = Number(amount);
    if (n > 0) {
      contributeToGoal(goal.id, n);
      setAmount("");
    }
  };

  const remove = () => {
    removeGoal(goal.id);
    navigate("/goals");
  };

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div>
        <span className="text-xs font-semibold text-terracotta uppercase">{goalTypeLabel(goal.type)}</span>
        <h1 className="text-2xl font-extrabold text-warmbrown">{goal.title}</h1>
        {goal.why && <p className="text-sm text-muted mt-1">«{goal.why}»</p>}
      </div>

      <Card className="flex flex-col gap-2">
        <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-warmbrown">{formatMoney(goal.currentAmount, profile.currency)}</span>
          <span className="text-muted">из {formatMoney(goal.targetAmount, profile.currency)}</span>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle>Вехи</SectionTitle>
        <div className="flex flex-col gap-2">
          {goal.milestones.map((m) => {
            const reached = goal.currentAmount >= m.amount;
            return (
              <div key={m.id} className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    reached ? "bg-sage text-white" : "bg-blush text-muted"
                  }`}
                >
                  {reached ? <PartyPopper size={14} /> : m.label}
                </span>
                <span className="text-sm text-warmbrown">{formatMoney(m.amount, profile.currency)}</span>
                {reached && <span className="text-xs text-sage-dark font-semibold">Достигнуто!</span>}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle>Внести пополнение</SectionTitle>
        <div className="flex gap-2">
          <Input value={amount} onChange={setAmount} type="number" placeholder="Сумма" suffix="₽" />
          <Button onClick={add}>Добавить</Button>
        </div>
      </Card>

      <Button variant="danger" onClick={remove} className="flex items-center justify-center gap-2">
        <Trash2 size={16} /> Удалить цель
      </Button>
    </div>
  );
}
