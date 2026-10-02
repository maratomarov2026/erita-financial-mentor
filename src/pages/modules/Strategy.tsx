import { useState } from "react";
import { Card, SectionTitle, Input, Chip, EmptyState } from "../../components/ui";
import { useAppStore } from "../../store/useAppStore";
import { simulatePayoff, calcMortgage, formatMoney, monthsToTarget } from "../../lib/finance";

function monthsToYearsLabel(months: number): string {
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} г.`);
  if (rem > 0) parts.push(`${rem} мес.`);
  return parts.join(" ") || "0 мес.";
}

function CreditsTab() {
  const diagnostics = useAppStore((s) => s.diagnostics);
  const profile = useAppStore((s) => s.profile);
  const [extra, setExtra] = useState("0");

  if (diagnostics.debts.length === 0) {
    return <EmptyState title="Кредитов нет" body="Если появятся — добавьте их в диагностике, и здесь появится расчёт." />;
  }

  const extraAmount = Number(extra) || 0;
  const avalanche = simulatePayoff(diagnostics.debts, extraAmount, "avalanche");
  const snowball = simulatePayoff(diagnostics.debts, extraAmount, "snowball");
  const baseline = simulatePayoff(diagnostics.debts, 0, "avalanche");

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <SectionTitle subtitle="Сколько готовы добавлять сверх минимальных платежей">Доп. платёж</SectionTitle>
        <Input value={extra} onChange={setExtra} type="number" suffix="₽/мес" />
      </Card>

      <div className="grid grid-cols-1 gap-3">
        {[
          { label: "Лавина (по ставке)", desc: "Экономия на процентах", r: avalanche },
          { label: "Снежный ком (по размеру)", desc: "Быстрые победы, мотивация", r: snowball },
        ].map(({ label, desc, r }) => (
          <Card key={label} className="flex flex-col gap-2">
            <div>
              <p className="font-bold text-warmbrown">{label}</p>
              <p className="text-xs text-muted">{desc}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mt-1">
              <div>
                <p className="text-muted text-xs">Срок</p>
                <p className="font-semibold text-warmbrown">{monthsToYearsLabel(r.months)}</p>
              </div>
              <div>
                <p className="text-muted text-xs">Переплата</p>
                <p className="font-semibold text-warmbrown">{formatMoney(r.totalInterest, profile.currency)}</p>
              </div>
            </div>
            {extraAmount > 0 && (
              <p className="text-xs text-sage-dark">
                Экономия на процентах vs без доп. платежей: {formatMoney(Math.max(0, baseline.totalInterest - r.totalInterest), profile.currency)}
              </p>
            )}
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted italic">
        Расчёт эффекта рефинансирования: уменьшите ставку у кредита в диагностике и сравните переплату.
      </p>
    </div>
  );
}

function ApartmentTab() {
  const profile = useAppStore((s) => s.profile);
  const diagnostics = useAppStore((s) => s.diagnostics);
  const [price, setPrice] = useState("8000000");
  const [downPayment, setDownPayment] = useState("1600000");
  const [rate, setRate] = useState("18");
  const [term, setTerm] = useState("20");
  const [currentSavings, setCurrentSavings] = useState(String(diagnostics.savings || 0));
  const [monthlySaving, setMonthlySaving] = useState("20000");

  const result = calcMortgage({
    propertyPrice: Number(price) || 0,
    downPayment: Number(downPayment) || 0,
    annualRate: Number(rate) || 0,
    termYears: Number(term) || 0,
  });

  const monthsToDownPayment = monthsToTarget(Number(downPayment) || 0, Number(currentSavings) || 0, Number(monthlySaving) || 0);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <SectionTitle subtitle="Целевая стоимость, первоначальный взнос, срок">Параметры ипотеки</SectionTitle>
        <Input label="Стоимость квартиры" value={price} onChange={setPrice} type="number" suffix="₽" />
        <Input label="Первоначальный взнос" value={downPayment} onChange={setDownPayment} type="number" suffix="₽" />
        <div className="grid grid-cols-2 gap-2">
          <Input label="Ставка" value={rate} onChange={setRate} type="number" suffix="%" />
          <Input label="Срок" value={term} onChange={setTerm} type="number" suffix="лет" />
        </div>
      </Card>

      <Card className="flex flex-col gap-2">
        <SectionTitle>Результат</SectionTitle>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted text-xs">Сумма кредита</p>
            <p className="font-bold text-warmbrown">{formatMoney(result.loanAmount, profile.currency)}</p>
          </div>
          <div>
            <p className="text-muted text-xs">Платёж в месяц</p>
            <p className="font-bold text-warmbrown">{formatMoney(result.monthlyPayment, profile.currency)}</p>
          </div>
          <div>
            <p className="text-muted text-xs">Переплата</p>
            <p className="font-bold text-warmbrown">{formatMoney(result.totalInterest, profile.currency)}</p>
          </div>
          <div>
            <p className="text-muted text-xs">Всего выплат</p>
            <p className="font-bold text-warmbrown">{formatMoney(result.totalPayment, profile.currency)}</p>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle subtitle="Сколько осталось накопить на первый взнос">Накопление взноса</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <Input label="Уже накоплено" value={currentSavings} onChange={setCurrentSavings} type="number" suffix="₽" />
          <Input label="Откладываю" value={monthlySaving} onChange={setMonthlySaving} type="number" suffix="₽/мес" />
        </div>
        {monthsToDownPayment !== null && (
          <p className="text-sm text-warmbrown">
            При таком темпе взнос будет накоплен за <b>{monthsToYearsLabel(monthsToDownPayment)}</b>.
          </p>
        )}
      </Card>

      <p className="text-xs text-muted italic">
        Сценарии «что если»: меняйте взнос, срок или ставку выше — результат пересчитывается сразу.
      </p>
    </div>
  );
}

export default function Strategy() {
  const [tab, setTab] = useState<"credits" | "apartment">("credits");

  return (
    <div className="flex flex-col gap-5 pb-10">
      <SectionTitle subtitle="Калькулятор кредитов и планировщик покупки квартиры">Стратегия</SectionTitle>
      <div className="flex gap-2">
        <Chip active={tab === "credits"} onClick={() => setTab("credits")}>
          Кредиты
        </Chip>
        <Chip active={tab === "apartment"} onClick={() => setTab("apartment")}>
          Квартира
        </Chip>
      </div>
      {tab === "credits" ? <CreditsTab /> : <ApartmentTab />}
    </div>
  );
}
