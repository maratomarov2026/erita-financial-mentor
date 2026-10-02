import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { Button, Card, Input, ProgressBar, SectionTitle, Chip } from "../components/ui";
import { useAppStore } from "../store/useAppStore";
import type { Debt, GoalType } from "../types";
import { COMMON_LIMITING_BELIEFS } from "../data/content";

const STEP_LABELS = ["Доходы", "Расходы", "Кредиты", "Накопления", "Цели", "Состояние"];

const GOAL_OPTIONS: { type: GoalType; label: string }[] = [
  { type: "cushion", label: "Подушка безопасности" },
  { type: "debt", label: "Закрыть кредиты" },
  { type: "apartment", label: "Квартира" },
  { type: "savings", label: "Накопить" },
  { type: "other", label: "Другое" },
];

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function Diagnostics() {
  const navigate = useNavigate();
  const diagnostics = useAppStore((s) => s.diagnostics);
  const updateDiagnostics = useAppStore((s) => s.updateDiagnostics);
  const setDiagnosticsStep = useAppStore((s) => s.setDiagnosticsStep);
  const completeDiagnostics = useAppStore((s) => s.completeDiagnostics);
  const setDebts = useAppStore((s) => s.setDebts);

  const [step, setStep] = useState(diagnostics.currentStep || 0);

  const goToStep = (s: number) => {
    setStep(s);
    setDiagnosticsStep(s);
  };

  const finish = () => {
    completeDiagnostics();
    navigate("/my-map");
  };

  const next = () => {
    if (step === STEP_LABELS.length - 1) {
      finish();
    } else {
      goToStep(step + 1);
    }
  };

  const skipAll = () => {
    finish();
  };

  const addDebt = () => {
    const newDebt: Debt = { id: uid(), name: "Кредит", balance: 0, rate: 15, minPayment: 0 };
    setDebts([...diagnostics.debts, newDebt]);
  };

  const updateDebt = (id: string, patch: Partial<Debt>) => {
    setDebts(diagnostics.debts.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const removeDebt = (id: string) => {
    setDebts(diagnostics.debts.filter((d) => d.id !== id));
  };

  const toggleGoal = (type: GoalType) => {
    const has = diagnostics.goalsSelected.includes(type);
    const goalsSelected = has
      ? diagnostics.goalsSelected.filter((g) => g !== type)
      : [...diagnostics.goalsSelected, type];
    updateDiagnostics({ goalsSelected });
  };

  const toggleBelief = (text: string) => {
    const has = diagnostics.limitingBeliefs.includes(text);
    const limitingBeliefs = has
      ? diagnostics.limitingBeliefs.filter((b) => b !== text)
      : [...diagnostics.limitingBeliefs, text];
    updateDiagnostics({ limitingBeliefs });
  };

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div>
        <div className="flex justify-between text-xs text-muted font-semibold mb-2">
          <span>{STEP_LABELS[step]}</span>
          <span>
            {step + 1} / {STEP_LABELS.length}
          </span>
        </div>
        <ProgressBar value={step + 1} max={STEP_LABELS.length} />
      </div>

      {step === 0 && (
        <Card className="flex flex-col gap-4">
          <SectionTitle subtitle="Сколько в среднем приходит денег в месяц?">Доходы</SectionTitle>
          <Input
            label="Регулярный доход (зарплата и т.п.)"
            value={diagnostics.income.regular || ""}
            onChange={(v) => updateDiagnostics({ income: { ...diagnostics.income, regular: Number(v) || 0 } })}
            type="number"
            suffix="₽/мес"
          />
          <Input
            label="Нерегулярный доход (подработки, премии)"
            value={diagnostics.income.irregular || ""}
            onChange={(v) => updateDiagnostics({ income: { ...diagnostics.income, irregular: Number(v) || 0 } })}
            type="number"
            suffix="₽/мес"
          />
        </Card>
      )}

      {step === 1 && (
        <Card className="flex flex-col gap-4">
          <SectionTitle subtitle="Сколько уходит на обязательные и переменные траты?">Расходы</SectionTitle>
          <Input
            label="Обязательные (жильё, еда, транспорт)"
            value={diagnostics.expenses.fixed || ""}
            onChange={(v) => updateDiagnostics({ expenses: { ...diagnostics.expenses, fixed: Number(v) || 0 } })}
            type="number"
            suffix="₽/мес"
          />
          <Input
            label="Переменные (развлечения, покупки)"
            value={diagnostics.expenses.variable || ""}
            onChange={(v) => updateDiagnostics({ expenses: { ...diagnostics.expenses, variable: Number(v) || 0 } })}
            type="number"
            suffix="₽/мес"
          />
        </Card>
      )}

      {step === 2 && (
        <Card className="flex flex-col gap-4">
          <SectionTitle subtitle="Если кредитов нет — просто переходите дальше">Кредиты</SectionTitle>
          {diagnostics.debts.map((debt) => (
            <div key={debt.id} className="rounded-xl2 border border-blush p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <input
                  value={debt.name}
                  onChange={(e) => updateDebt(debt.id, { name: e.target.value })}
                  className="font-semibold text-warmbrown bg-transparent outline-none flex-1"
                />
                <button onClick={() => removeDebt(debt.id)} className="text-muted hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input label="Остаток" value={debt.balance || ""} onChange={(v) => updateDebt(debt.id, { balance: Number(v) || 0 })} type="number" />
                <Input label="Ставка %" value={debt.rate || ""} onChange={(v) => updateDebt(debt.id, { rate: Number(v) || 0 })} type="number" />
                <Input label="Платёж" value={debt.minPayment || ""} onChange={(v) => updateDebt(debt.id, { minPayment: Number(v) || 0 })} type="number" className="col-span-2" />
              </div>
            </div>
          ))}
          <Button variant="secondary" onClick={addDebt} className="flex items-center justify-center gap-2">
            <Plus size={16} /> Добавить кредит
          </Button>
        </Card>
      )}

      {step === 3 && (
        <Card className="flex flex-col gap-4">
          <SectionTitle subtitle="Сколько уже отложено — вклады, накопительные счета, наличные">Накопления</SectionTitle>
          <Input
            label="Сумма накоплений"
            value={diagnostics.savings || ""}
            onChange={(v) => updateDiagnostics({ savings: Number(v) || 0 })}
            type="number"
            suffix="₽"
          />
        </Card>
      )}

      {step === 4 && (
        <Card className="flex flex-col gap-4">
          <SectionTitle subtitle="Выберите одну или несколько — и отметьте главную">Цели</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((g) => (
              <Chip key={g.type} active={diagnostics.goalsSelected.includes(g.type)} onClick={() => toggleGoal(g.type)}>
                {g.label}
              </Chip>
            ))}
          </div>
          {diagnostics.goalsSelected.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-warmbrown mb-2">Какая цель главная сейчас?</p>
              <div className="flex flex-wrap gap-2">
                {diagnostics.goalsSelected.map((type) => (
                  <Chip
                    key={type}
                    active={diagnostics.priorityGoal === type}
                    onClick={() => updateDiagnostics({ priorityGoal: type })}
                  >
                    {GOAL_OPTIONS.find((g) => g.type === type)?.label}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {step === 5 && (
        <Card className="flex flex-col gap-5">
          <SectionTitle subtitle="Это поможет наставнику быть бережнее">Состояние</SectionTitle>
          <div>
            <p className="text-sm font-semibold text-warmbrown mb-2">
              Насколько вы тревожитесь из-за денег? (1 — спокойно, 10 — очень тревожно)
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <Chip key={n} active={diagnostics.anxietyLevel === n} onClick={() => updateDiagnostics({ anxietyLevel: n })}>
                  {n}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-warmbrown mb-2">Какие установки про деньги откликаются?</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_LIMITING_BELIEFS.map((b) => (
                <Chip key={b.id} active={diagnostics.limitingBeliefs.includes(b.text)} onClick={() => toggleBelief(b.text)}>
                  {b.text}
                </Chip>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="ghost" onClick={() => goToStep(step - 1)}>
            Назад
          </Button>
        )}
        <Button onClick={next} className="flex-1">
          {step === STEP_LABELS.length - 1 ? "Собрать мою карту" : "Далее"}
        </Button>
      </div>
      <button className="text-sm text-muted underline self-center" onClick={skipAll}>
        Пропустить диагностику
      </button>
    </div>
  );
}
