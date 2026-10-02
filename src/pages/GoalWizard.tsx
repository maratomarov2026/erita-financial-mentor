import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, SectionTitle, Button, Input, Chip } from "../components/ui";
import { useAppStore, goalTypeLabel } from "../store/useAppStore";
import type { GoalType } from "../types";
import { freeMonthlyBalance, monthsToTarget, formatMoney } from "../lib/finance";

const GOAL_TYPES: GoalType[] = ["cushion", "debt", "apartment", "savings", "other"];

export default function GoalWizard() {
  const navigate = useNavigate();
  const addGoal = useAppStore((s) => s.addGoal);
  const diagnostics = useAppStore((s) => s.diagnostics);

  const [type, setType] = useState<GoalType>("cushion");
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");

  const target = Number(targetAmount) || 0;
  const monthly = Number(monthlyContribution) || 0;
  const current = Number(currentAmount) || 0;

  const freeBalance = freeMonthlyBalance(diagnostics);
  const monthsNeeded = monthsToTarget(target, current, monthly);

  let monthsToDeadline: number | null = null;
  if (deadline) {
    const diffMs = new Date(deadline).getTime() - Date.now();
    monthsToDeadline = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24 * 30)));
  }

  const realistic =
    monthsNeeded !== null && monthsToDeadline !== null ? monthsNeeded <= monthsToDeadline : true;
  const exceedsBudget = monthly > 0 && freeBalance > 0 && monthly > freeBalance;

  const canSubmit = title.trim().length > 0 && target > 0 && monthly >= 0;

  const submit = () => {
    addGoal({
      type,
      title: title.trim(),
      why,
      targetAmount: target,
      deadline,
      monthlyContribution: monthly,
      currentAmount: current,
    });
    navigate("/goals");
  };

  return (
    <div className="flex flex-col gap-5 pb-10">
      <SectionTitle subtitle="Зачем, сколько, к какому сроку, какой шаг в месяц">Новая цель</SectionTitle>

      <Card className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-warmbrown mb-2">Тип цели</p>
          <div className="flex flex-wrap gap-2">
            {GOAL_TYPES.map((t) => (
              <Chip key={t} active={type === t} onClick={() => setType(t)}>
                {goalTypeLabel(t)}
              </Chip>
            ))}
          </div>
        </div>

        <Input label="Название цели" value={title} onChange={setTitle} placeholder="Например: Первый взнос на квартиру" />

        <label className="block">
          <span className="block text-sm font-semibold text-warmbrown mb-1">Зачем мне эта цель?</span>
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            rows={2}
            className="w-full rounded-xl2 border border-blush bg-paper px-4 py-3 outline-none focus:border-terracotta text-warmbrown"
            placeholder="Что изменится, когда вы её достигнете?"
          />
        </label>

        <Input label="Сколько нужно" value={targetAmount} onChange={setTargetAmount} type="number" suffix="₽" />
        <Input label="Уже накоплено" value={currentAmount} onChange={setCurrentAmount} type="number" suffix="₽" />
        <Input label="К какому сроку" value={deadline} onChange={setDeadline} type="date" />
        <Input label="Ежемесячный шаг" value={monthlyContribution} onChange={setMonthlyContribution} type="number" suffix="₽/мес" />
      </Card>

      {(monthsNeeded !== null || exceedsBudget) && (
        <Card className="bg-blush/40 border border-terracotta-light flex flex-col gap-2">
          {monthsNeeded !== null && (
            <p className="text-sm text-warmbrown">
              При таком шаге цель будет достигнута примерно через <b>{monthsNeeded} мес.</b>
              {monthsToDeadline !== null && !realistic && (
                <> — это позже выбранного срока. Попробуйте увеличить ежемесячный шаг или сдвинуть срок.</>
              )}
            </p>
          )}
          {exceedsBudget && (
            <p className="text-sm text-terracotta-dark">
              Ежемесячный шаг больше вашего свободного остатка ({formatMoney(freeBalance)}). Рассмотрите меньшую сумму.
            </p>
          )}
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => navigate("/goals")}>
          Отмена
        </Button>
        <Button onClick={submit} disabled={!canSubmit} className="flex-1">
          Создать цель
        </Button>
      </div>
    </div>
  );
}
