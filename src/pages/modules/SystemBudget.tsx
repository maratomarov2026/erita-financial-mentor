import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, SectionTitle, Button, Input, Chip, ProgressBar, EmptyState } from "../../components/ui";
import { useAppStore } from "../../store/useAppStore";
import {
  suggestBudget503020,
  totalIncome,
  cushionTarget,
  cushionMonths,
  totalExpenses,
  formatMoney,
} from "../../lib/finance";
import type { BudgetModel } from "../../types";

const MODEL_LABELS: Record<BudgetModel, string> = {
  "50-30-20": "50 / 30 / 20",
  envelopes: "Конверты",
  custom: "Своя схема",
};

export default function SystemBudget() {
  const diagnostics = useAppStore((s) => s.diagnostics);
  const budget = useAppStore((s) => s.budget);
  const setBudget = useAppStore((s) => s.setBudget);
  const addBudgetCategory = useAppStore((s) => s.addBudgetCategory);
  const updateBudgetCategory = useAppStore((s) => s.updateBudgetCategory);
  const removeBudgetCategory = useAppStore((s) => s.removeBudgetCategory);
  const profile = useAppStore((s) => s.profile);

  const [catName, setCatName] = useState("");
  const [catLimit, setCatLimit] = useState("");

  const income = totalIncome(diagnostics);
  const suggestion = suggestBudget503020(income);
  const expenses = totalExpenses(diagnostics);
  const cushionNow = cushionMonths(diagnostics.savings, expenses);
  const cushionGoal = cushionTarget(expenses, budget.cushionTargetMonths);
  const remainingForCushion = Math.max(0, cushionGoal - diagnostics.savings);

  const addCategory = () => {
    const limit = Number(catLimit);
    if (!catName.trim() || limit <= 0) return;
    addBudgetCategory(catName.trim(), limit);
    setCatName("");
    setCatLimit("");
  };

  return (
    <div className="flex flex-col gap-5 pb-10">
      <SectionTitle subtitle="Бюджет, подушка безопасности, распределение дохода">Система управления</SectionTitle>

      <Card className="flex flex-col gap-3">
        <SectionTitle>Модель бюджета</SectionTitle>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(MODEL_LABELS) as BudgetModel[]).map((m) => (
            <Chip key={m} active={budget.model === m} onClick={() => setBudget({ model: m })}>
              {MODEL_LABELS[m]}
            </Chip>
          ))}
        </div>
        {budget.model === "50-30-20" && income > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            <div className="rounded-xl2 bg-blush/50 p-3">
              <p className="text-xs text-muted">Обязательные 50%</p>
              <p className="font-bold text-warmbrown">{formatMoney(suggestion.essentials, profile.currency)}</p>
            </div>
            <div className="rounded-xl2 bg-blush/50 p-3">
              <p className="text-xs text-muted">Жизнь 30%</p>
              <p className="font-bold text-warmbrown">{formatMoney(suggestion.lifestyle, profile.currency)}</p>
            </div>
            <div className="rounded-xl2 bg-blush/50 p-3">
              <p className="text-xs text-muted">Копим 20%</p>
              <p className="font-bold text-warmbrown">{formatMoney(suggestion.savingsAndDebt, profile.currency)}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle subtitle="Лимит и факт по каждой категории">Категории расходов</SectionTitle>
        {budget.categories.length === 0 ? (
          <EmptyState title="Категорий пока нет" body="Добавьте первую категорию бюджета." />
        ) : (
          <div className="flex flex-col gap-3">
            {budget.categories.map((c) => (
              <div key={c.id} className="rounded-xl2 border border-blush p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-warmbrown">{c.name}</span>
                  <button onClick={() => removeBudgetCategory(c.id)} className="text-muted hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
                <ProgressBar value={c.spent} max={c.limit} />
                <div className="flex justify-between items-center mt-2 gap-2">
                  <span className="text-xs text-muted">
                    {formatMoney(c.spent, profile.currency)} / {formatMoney(c.limit, profile.currency)}
                  </span>
                  <input
                    type="number"
                    placeholder="факт"
                    className="w-24 text-sm rounded-lg border border-blush px-2 py-1 outline-none"
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && e.target.value !== "") updateBudgetCategory(c.id, { spent: v });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input value={catName} onChange={setCatName} placeholder="Категория" />
          <Input value={catLimit} onChange={setCatLimit} type="number" placeholder="Лимит" />
          <Button onClick={addCategory}>
            <Plus size={16} />
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle subtitle="Целевая сумма — 3-6 месяцев расходов">Подушка безопасности</SectionTitle>
        <div className="flex gap-2">
          {[3, 4, 5, 6].map((m) => (
            <Chip key={m} active={budget.cushionTargetMonths === m} onClick={() => setBudget({ cushionTargetMonths: m })}>
              {m} мес.
            </Chip>
          ))}
        </div>
        <ProgressBar value={diagnostics.savings} max={cushionGoal} />
        <div className="flex justify-between text-sm">
          <span className="text-warmbrown font-semibold">{cushionNow} из {budget.cushionTargetMonths} мес.</span>
          <span className="text-muted">осталось {formatMoney(remainingForCushion, profile.currency)}</span>
        </div>
      </Card>
    </div>
  );
}
