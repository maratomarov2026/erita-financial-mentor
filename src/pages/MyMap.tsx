import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, SectionTitle, Button, StatTile } from "../components/ui";
import { useAppStore } from "../store/useAppStore";
import {
  freeMonthlyBalance,
  totalDebtBalance,
  totalExpenses,
  cushionMonths,
  formatMoney,
} from "../lib/finance";
import { generateWeeklyPlan } from "../lib/weeklyPlan";
import { goalTypeLabel } from "../store/useAppStore";

function buildObservations(args: {
  freeBalance: number;
  debtTotal: number;
  cushion: number;
  anxiety: number | null;
}): string[] {
  const obs: string[] = [];
  if (args.freeBalance < 0) {
    obs.push("Расходы сейчас превышают доходы — начнём с того, чтобы найти, где можно сделать паузу, без жёстких ограничений.");
  } else if (args.freeBalance === 0) {
    obs.push("Доходы и расходы в равновесии — свободного остатка пока нет, это отправная точка, а не приговор.");
  } else {
    obs.push(`У вас остаётся ${formatMoney(args.freeBalance)} в месяц — именно эта сумма станет топливом для ваших целей.`);
  }

  if (args.debtTotal > 0) {
    obs.push("Есть кредитная нагрузка — в модуле «Стратегия» разберём, какой долг выгоднее закрыть первым.");
  }

  if (args.cushion < 3) {
    obs.push("Подушка безопасности меньше 3 месяцев расходов — это будет один из первых шагов системы.");
  } else {
    obs.push("Подушка безопасности уже на хорошем уровне — можно сфокусироваться на других целях.");
  }

  if (args.anxiety !== null && args.anxiety >= 6) {
    obs.push("Вы отметили высокий уровень тревоги из-за денег — начнём с модуля «Психология богатого человека», это поможет снизить напряжение.");
  }

  return obs;
}

function recommendedModules(anxiety: number | null, debtTotal: number): { path: string; title: string }[] {
  const modules: { path: string; title: string; priority: number }[] = [
    { path: "/modules/psychology", title: "Психология богатого человека", priority: anxiety && anxiety >= 6 ? 0 : 3 },
    { path: "/modules/system", title: "Система управления", priority: 1 },
    { path: "/modules/strategy", title: "Стратегия (кредиты и квартира)", priority: debtTotal > 0 ? 0.5 : 4 },
    { path: "/modules/discipline", title: "Дисциплина и навыки", priority: 2 },
    { path: "/modules/assets", title: "Активы", priority: 5 },
  ];
  return modules.sort((a, b) => a.priority - b.priority).map(({ path, title }) => ({ path, title }));
}

export default function MyMap() {
  const navigate = useNavigate();
  const diagnostics = useAppStore((s) => s.diagnostics);
  const profile = useAppStore((s) => s.profile);
  const weeklyPlan = useAppStore((s) => s.weeklyPlan);
  const setWeeklyPlan = useAppStore((s) => s.setWeeklyPlan);

  useEffect(() => {
    if (weeklyPlan.length === 0) {
      setWeeklyPlan(generateWeeklyPlan(diagnostics));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const freeBalance = freeMonthlyBalance(diagnostics);
  const debtTotal = totalDebtBalance(diagnostics.debts);
  const expenses = totalExpenses(diagnostics);
  const cushion = cushionMonths(diagnostics.savings, expenses);

  const observations = buildObservations({ freeBalance, debtTotal, cushion, anxiety: diagnostics.anxietyLevel });
  const modules = recommendedModules(diagnostics.anxietyLevel, debtTotal);
  const firstModule = modules[0];

  return (
    <div className="flex flex-col gap-5 pb-10">
      <SectionTitle subtitle="Персональная сводка по вашим цифрам и состоянию">Моя карта</SectionTitle>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="Свободный остаток"
          value={formatMoney(freeBalance, profile.currency)}
          tone={freeBalance >= 0 ? "positive" : "warning"}
        />
        <StatTile label="Долг" value={formatMoney(debtTotal, profile.currency)} tone={debtTotal > 0 ? "warning" : "positive"} />
        <StatTile label="Подушка" value={`${cushion} мес.`} tone={cushion >= 3 ? "positive" : "warning"} />
        <StatTile
          label="Главная цель"
          value={diagnostics.priorityGoal ? goalTypeLabel(diagnostics.priorityGoal) : "Не выбрана"}
        />
      </div>

      <Card className="flex flex-col gap-3">
        <SectionTitle>Наблюдения</SectionTitle>
        <ul className="flex flex-col gap-2">
          {observations.map((o, i) => (
            <li key={i} className="text-sm text-warmbrown leading-relaxed flex gap-2">
              <span className="text-terracotta">•</span>
              {o}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle subtitle="Рекомендованный порядок — вы всегда можете выбрать другой">Маршрут по модулям</SectionTitle>
        <ol className="flex flex-col gap-2">
          {modules.map((m, i) => (
            <li key={m.path} className="flex items-center gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-blush flex items-center justify-center text-xs font-bold text-terracotta-dark">
                {i + 1}
              </span>
              <span className="text-warmbrown font-medium">{m.title}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Button
        onClick={() => navigate(firstModule.path)}
        className="w-full"
      >
        Начать с первого шага
      </Button>
      <Button variant="ghost" onClick={() => navigate("/dashboard")} className="w-full">
        Перейти на главный экран
      </Button>
    </div>
  );
}
