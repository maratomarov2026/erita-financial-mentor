// Общие типы приложения «Финансовый наставник»

export type GoalType = "cushion" | "debt" | "apartment" | "savings" | "other";

export type BudgetModel = "50-30-20" | "envelopes" | "custom";

export interface Debt {
  id: string;
  name: string;
  balance: number;
  rate: number; // годовая ставка, %
  minPayment: number;
}

export interface Income {
  regular: number;
  irregular: number;
}

export interface Expenses {
  fixed: number;
  variable: number;
}

export interface DiagnosticsState {
  completed: boolean;
  currentStep: number;
  income: Income;
  expenses: Expenses;
  debts: Debt[];
  savings: number;
  goalsSelected: GoalType[];
  priorityGoal: GoalType | null;
  anxietyLevel: number | null; // 1-10
  moneyRelationship: string | null;
  limitingBeliefs: string[];
}

export interface Milestone {
  id: string;
  label: string;
  amount: number;
  reached: boolean;
}

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  why: string;
  targetAmount: number;
  deadline: string; // ISO date
  monthlyContribution: number;
  currentAmount: number;
  milestones: Milestone[];
  createdAt: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
  spent: number;
}

export interface BudgetState {
  model: BudgetModel;
  categories: BudgetCategory[];
  cushionTargetMonths: number;
}

export interface Asset {
  id: string;
  name: string;
  amount: number;
  kind: "asset" | "liability";
}

export interface Habit {
  id: string;
  name: string;
  history: string[]; // ISO dates, когда отмечено выполнение
  streak: number;
  lastChecked: string | null;
}

export interface WishlistItem {
  id: string;
  name: string;
  amount: number;
  addedAt: string;
  decidedAt: string | null;
  decision: "bought" | "skipped" | null;
}

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  emotion: string;
  mentorQuestion: string;
}

export interface WeeklyStep {
  week: number;
  mainStep: string;
  microPractices: string[];
  completed: boolean;
}

export interface CheckIn {
  week: number;
  did: string;
  blockers: string;
  feeling: number; // 1-10
  date: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "mentor";
  text: string;
  timestamp: string;
}

export type SubscriptionPlan = "free" | "subscriber";

export interface ProfileState {
  name: string;
  currency: "RUB" | "KZT" | "USD" | "EUR";
  notificationsEnabled: boolean;
  theme: "light" | "dark";
  subscriptionPlan: SubscriptionPlan;
  onboardingSeen: boolean;
}
