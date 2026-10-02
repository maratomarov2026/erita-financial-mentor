import type { DiagnosticsState, WeeklyStep } from "../types";

/** Генерация персонального плана на 6 недель по итогам диагностики (FR-34). */
export function generateWeeklyPlan(d: DiagnosticsState): WeeklyStep[] {
  const steps: Omit<WeeklyStep, "week" | "completed">[] = [];

  if (d.anxietyLevel !== null && d.anxietyLevel >= 6) {
    steps.push({
      mainStep: "Пройти модуль «Психология богатого человека» и сделать первую запись в дневнике тревог",
      microPractices: ["5 минут дневника тревог", "Прочитать урок «Тревога — это сигнал, а не приговор»"],
    });
  }

  steps.push({
    mainStep: "Зафиксировать все доходы и расходы за месяц в дашборде",
    microPractices: ["Открыть банковские выписки", "Внести обязательные и переменные расходы"],
  });

  if (d.debts.length > 0) {
    steps.push({
      mainStep: "Выбрать стратегию закрытия кредитов (лавина или снежный ком)",
      microPractices: ["Открыть калькулятор в модуле «Стратегия»", "Сравнить переплату по двум методам"],
    });
  }

  steps.push({
    mainStep: "Настроить бюджет и выбрать модель распределения дохода",
    microPractices: ["Выбрать модель 50/30/20 или свою", "Создать 3-5 категорий расходов"],
  });

  steps.push({
    mainStep: "Поставить первую финансовую цель",
    microPractices: ["Пройти мастер постановки цели", "Указать ежемесячный шаг"],
  });

  steps.push({
    mainStep: "Начать отслеживать 3 ключевые привычки",
    microPractices: ["Добавить привычки в трекер", "Отметить выполнение сегодня"],
  });

  steps.push({
    mainStep: "Пройти первый недельный check-in",
    microPractices: ["Ответить на 3 вопроса обзора недели"],
  });

  return steps.slice(0, 6).map((s, i) => ({ ...s, week: i + 1, completed: false }));
}
