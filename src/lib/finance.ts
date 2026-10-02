// Детерминированные финансовые расчёты.
// Важно: никакой LLM-логики здесь — только обычная математика (см. риск Р-3 в PRD).

import type { Debt, DiagnosticsState, Asset } from "../types";

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatMoney(amount: number, currency: string = "RUB"): string {
  const symbols: Record<string, string> = { RUB: "₽", KZT: "₸", USD: "$", EUR: "€" };
  const symbol = symbols[currency] ?? currency;
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString("ru-RU")} ${symbol}`;
}

export function totalIncome(d: DiagnosticsState): number {
  return d.income.regular + d.income.irregular;
}

export function totalExpenses(d: DiagnosticsState): number {
  return d.expenses.fixed + d.expenses.variable;
}

export function totalDebtMinPayments(debts: Debt[]): number {
  return debts.reduce((sum, debt) => sum + debt.minPayment, 0);
}

export function totalDebtBalance(debts: Debt[]): number {
  return debts.reduce((sum, debt) => sum + debt.balance, 0);
}

/** Свободный остаток месяца = доходы - обязательные и переменные расходы - минимальные платежи по кредитам */
export function freeMonthlyBalance(d: DiagnosticsState): number {
  return totalIncome(d) - totalExpenses(d) - totalDebtMinPayments(d.debts);
}

/** Чистый капитал = активы - пассивы (включая остатки по кредитам как пассив) */
export function netWorth(assets: Asset[], debts: Debt[]): number {
  const assetSum = assets.filter((a) => a.kind === "asset").reduce((s, a) => s + a.amount, 0);
  const liabilitySum = assets.filter((a) => a.kind === "liability").reduce((s, a) => s + a.amount, 0);
  return assetSum - liabilitySum - totalDebtBalance(debts);
}

/** Подушка безопасности в месяцах текущих расходов */
export function cushionMonths(savings: number, monthlyExpenses: number): number {
  if (monthlyExpenses <= 0) return 0;
  return round2(savings / monthlyExpenses);
}

/** Целевая сумма подушки (по умолчанию диапазон 3-6 месяцев расходов) */
export function cushionTarget(monthlyExpenses: number, months: number = 6): number {
  return round2(monthlyExpenses * months);
}

export interface PayoffMonthEntry {
  month: number;
  debtId: string;
  interestPaid: number;
  principalPaid: number;
  remainingBalance: number;
}

export interface PayoffResult {
  strategy: "avalanche" | "snowball";
  months: number;
  totalInterest: number;
  totalPaid: number;
  order: string[]; // id долгов в порядке закрытия
  schedule: PayoffMonthEntry[];
}

const MAX_MONTHS = 600; // защита от бесконечного цикла (50 лет)

/**
 * Симуляция погашения кредитов.
 * avalanche — первым гасим долг с наибольшей ставкой (экономия на процентах).
 * snowball — первым гасим долг с наименьшим остатком (быстрые победы, мотивация).
 */
export function simulatePayoff(
  debts: Debt[],
  extraMonthly: number,
  strategy: "avalanche" | "snowball",
): PayoffResult {
  const working = debts.map((d) => ({ ...d }));
  const schedule: PayoffMonthEntry[] = [];
  const order: string[] = [];
  let totalInterest = 0;
  let month = 0;

  const pickTarget = () => {
    const open = working.filter((d) => d.balance > 0.01);
    if (open.length === 0) return null;
    if (strategy === "avalanche") {
      return open.reduce((a, b) => (b.rate > a.rate ? b : a));
    }
    return open.reduce((a, b) => (b.balance < a.balance ? b : a));
  };

  while (working.some((d) => d.balance > 0.01) && month < MAX_MONTHS) {
    month += 1;
    let pool = extraMonthly;

    for (const debt of working) {
      if (debt.balance <= 0.01) continue;
      const monthlyRate = debt.rate / 100 / 12;
      const interest = debt.balance * monthlyRate;
      totalInterest += interest;
      let payment = Math.min(debt.minPayment, debt.balance + interest);
      debt.balance = debt.balance + interest - payment;
      schedule.push({
        month,
        debtId: debt.id,
        interestPaid: round2(interest),
        principalPaid: round2(payment - interest),
        remainingBalance: round2(Math.max(debt.balance, 0)),
      });
    }

    while (pool > 0.01) {
      const target = pickTarget();
      if (!target) break;
      const extra = Math.min(pool, target.balance);
      target.balance -= extra;
      pool -= extra;
      if (target.balance <= 0.01 && !order.includes(target.id)) {
        order.push(target.id);
      }
    }

    for (const debt of working) {
      if (debt.balance <= 0.01 && !order.includes(debt.id)) {
        order.push(debt.id);
      }
    }
  }

  const totalPaid = debts.reduce((s, d) => s + d.balance, 0) + totalInterest;

  return {
    strategy,
    months: month,
    totalInterest: round2(totalInterest),
    totalPaid: round2(totalPaid),
    order,
    schedule,
  };
}

export interface MortgageInput {
  propertyPrice: number;
  downPayment: number;
  annualRate: number; // %
  termYears: number;
}

export interface MortgageResult {
  loanAmount: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  termMonths: number;
}

/** Аннуитетный платёж по ипотеке */
export function calcMortgage(input: MortgageInput): MortgageResult {
  const loanAmount = Math.max(input.propertyPrice - input.downPayment, 0);
  const monthlyRate = input.annualRate / 100 / 12;
  const termMonths = Math.round(input.termYears * 12);

  if (loanAmount <= 0 || termMonths <= 0) {
    return { loanAmount, monthlyPayment: 0, totalPayment: 0, totalInterest: 0, termMonths };
  }

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / termMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    monthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1);
  }

  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - loanAmount;

  return {
    loanAmount: round2(loanAmount),
    monthlyPayment: round2(monthlyPayment),
    totalPayment: round2(totalPayment),
    totalInterest: round2(totalInterest),
    termMonths,
  };
}

/** Месяцев до накопления целевой суммы при текущем взносе и без доходности (консервативно) */
export function monthsToTarget(targetAmount: number, currentAmount: number, monthlyContribution: number): number | null {
  if (monthlyContribution <= 0) return null;
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / monthlyContribution);
}

export interface BudgetSuggestion {
  model: "50-30-20";
  essentials: number;
  lifestyle: number;
  savingsAndDebt: number;
}

/** Предложение разбивки дохода по модели 50/30/20 */
export function suggestBudget503020(income: number): BudgetSuggestion {
  return {
    model: "50-30-20",
    essentials: round2(income * 0.5),
    lifestyle: round2(income * 0.3),
    savingsAndDebt: round2(income * 0.2),
  };
}
