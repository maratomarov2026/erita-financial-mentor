import { useNavigate } from "react-router-dom";
import { Card, SectionTitle, StatTile, Button, ProgressBar } from "../components/ui";
import { useAppStore, goalTypeLabel } from "../store/useAppStore";
import {
  freeMonthlyBalance,
  netWorth,
  totalDebtBalance,
  totalExpenses,
  cushionMonths,
  formatMoney,
} from "../lib/finance";

export default function Dashboard() {
  const navigate = useNavigate();
  const diagnostics = useAppStore((s) => s.diagnostics);
  const assets = useAppStore((s) => s.assets);
  const goals = useAppStore((s) => s.goals);
  const weeklyPlan = useAppStore((s) => s.weeklyPlan);
  const profile = useAppStore((s) => s.profile);
  const toggleWeeklyStepDone = useAppStore((s) => s.toggleWeeklyStepDone);

  const freeBalance = freeMonthlyBalance(diagnostics);
  const worth = netWorth(assets, diagnostics.debts);
  const debtTotal = totalDebtBalance(diagnostics.debts);
  const expenses = totalExpenses(diagnostics);
  const cushion = cushionMonths(diagnostics.savings, expenses);

  const currentWeekStep = weeklyPlan.find((w) => !w.completed) ?? weeklyPlan[weeklyPlan.length - 1];
  const priorityGoal = goals.find((g) => g.type === diagnostics.priorityGoal) ?? goals[0];

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div>
        <p className="text-sm text-muted">Здравствуйте{profile.name ? `, ${profile.name}` : ""}!</p>
        <h1 className="text-2xl font-extrabold text-warmbrown">Мои цифры</h1>
      </div>

      {!diagnostics.completed && (
        <Card className="bg-blush/50 border border-terracotta-light">
          <p className="text-sm text-warmbrown mb-3">
            Вы ещё не прошли диагностику — пройдите её, чтобы получить персональную карту и маршрут.
          </p>
          <Button onClick={() => navigate("/diagnostics")}>Пройти диагностику</Button>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Свободный остаток" value={formatMoney(freeBalance, profile.currency)} tone={freeBalance >= 0 ? "positive" : "warning"} />
        <StatTile label="Чистый капитал" value={formatMoney(worth, profile.currency)} />
        <StatTile label="Долговая нагрузка" value={formatMoney(debtTotal, profile.currency)} tone={debtTotal > 0 ? "warning" : "positive"} />
        <StatTile label="Подушка" value={`${cushion} мес.`} tone={cushion >= 3 ? "positive" : "warning"} />
      </div>

      <Card className="flex flex-col gap-3">
        <SectionTitle>Шаг недели</SectionTitle>
        {currentWeekStep ? (
          <>
            <p className="text-warmbrown font-semibold">{currentWeekStep.mainStep}</p>
            <ul className="text-sm text-muted list-disc list-inside">
              {currentWeekStep.microPractices.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            <Button
              variant={currentWeekStep.completed ? "secondary" : "primary"}
              onClick={() => toggleWeeklyStepDone(currentWeekStep.week)}
            >
              {currentWeekStep.completed ? "Выполнено ✓" : "Отметить выполненным"}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted">
            План недели появится после диагностики — он подстраивается под вашу скорость.
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <SectionTitle>Прогресс по целям</SectionTitle>
          <button className="text-sm text-terracotta font-semibold" onClick={() => navigate("/goals")}>
            Все цели
          </button>
        </div>
        {priorityGoal ? (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-warmbrown">{priorityGoal.title || goalTypeLabel(priorityGoal.type)}</span>
              <span className="text-muted">
                {formatMoney(priorityGoal.currentAmount, profile.currency)} / {formatMoney(priorityGoal.targetAmount, profile.currency)}
              </span>
            </div>
            <ProgressBar value={priorityGoal.currentAmount} max={priorityGoal.targetAmount} />
          </div>
        ) : (
          <p className="text-sm text-muted">Целей пока нет — поставьте первую, чтобы видеть прогресс здесь.</p>
        )}
      </Card>
    </div>
  );
}
