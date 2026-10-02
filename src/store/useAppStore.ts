import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DiagnosticsState,
  Goal,
  BudgetState,
  Asset,
  Habit,
  WishlistItem,
  JournalEntry,
  WeeklyStep,
  CheckIn,
  ChatMessage,
  ProfileState,
  GoalType,
} from "../types";

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const emptyDiagnostics: DiagnosticsState = {
  completed: false,
  currentStep: 0,
  income: { regular: 0, irregular: 0 },
  expenses: { fixed: 0, variable: 0 },
  debts: [],
  savings: 0,
  goalsSelected: [],
  priorityGoal: null,
  anxietyLevel: null,
  moneyRelationship: null,
  limitingBeliefs: [],
};

const emptyProfile: ProfileState = {
  name: "",
  currency: "RUB",
  notificationsEnabled: true,
  theme: "light",
  subscriptionPlan: "free",
  onboardingSeen: false,
};

const emptyBudget: BudgetState = {
  model: "50-30-20",
  categories: [],
  cushionTargetMonths: 6,
};

interface AppState {
  diagnostics: DiagnosticsState;
  goals: Goal[];
  budget: BudgetState;
  assets: Asset[];
  habits: Habit[];
  wishlist: WishlistItem[];
  journal: JournalEntry[];
  weeklyPlan: WeeklyStep[];
  checkIns: CheckIn[];
  chat: ChatMessage[];
  profile: ProfileState;

  updateDiagnostics: (patch: Partial<DiagnosticsState>) => void;
  setDiagnosticsStep: (step: number) => void;
  completeDiagnostics: () => void;

  setDebts: (debts: DiagnosticsState["debts"]) => void;

  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "milestones">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;

  setBudget: (patch: Partial<BudgetState>) => void;
  addBudgetCategory: (name: string, limit: number) => void;
  updateBudgetCategory: (id: string, patch: { name?: string; limit?: number; spent?: number }) => void;
  removeBudgetCategory: (id: string) => void;

  addAsset: (asset: Omit<Asset, "id">) => void;
  removeAsset: (id: string) => void;

  toggleHabit: (id: string, date: string) => void;
  addHabit: (name: string) => void;
  removeHabit: (id: string) => void;

  addWishlistItem: (name: string, amount: number) => void;
  decideWishlistItem: (id: string, decision: "bought" | "skipped") => void;

  addJournalEntry: (entry: Omit<JournalEntry, "id">) => void;

  setWeeklyPlan: (plan: WeeklyStep[]) => void;
  toggleWeeklyStepDone: (week: number) => void;
  addCheckIn: (checkIn: Omit<CheckIn, "date">) => void;

  addChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearChat: () => void;

  updateProfile: (patch: Partial<ProfileState>) => void;
  resetAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      diagnostics: emptyDiagnostics,
      goals: [],
      budget: emptyBudget,
      assets: [],
      habits: [],
      wishlist: [],
      journal: [],
      weeklyPlan: [],
      checkIns: [],
      chat: [],
      profile: emptyProfile,

      updateDiagnostics: (patch) =>
        set((s) => ({ diagnostics: { ...s.diagnostics, ...patch } })),
      setDiagnosticsStep: (step) =>
        set((s) => ({ diagnostics: { ...s.diagnostics, currentStep: step } })),
      completeDiagnostics: () =>
        set((s) => ({ diagnostics: { ...s.diagnostics, completed: true } })),

      setDebts: (debts) => set((s) => ({ diagnostics: { ...s.diagnostics, debts } })),

      addGoal: (goal) =>
        set((s) => ({
          goals: [
            ...s.goals,
            {
              ...goal,
              id: uid(),
              createdAt: new Date().toISOString(),
              milestones: [0.25, 0.5, 0.75, 1].map((pct) => ({
                id: uid(),
                label: `${Math.round(pct * 100)}%`,
                amount: Math.round(goal.targetAmount * pct),
                reached: false,
              })),
            },
          ],
        })),
      updateGoal: (id, patch) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      contributeToGoal: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g,
          ),
        })),

      setBudget: (patch) => set((s) => ({ budget: { ...s.budget, ...patch } })),
      addBudgetCategory: (name, limit) =>
        set((s) => ({
          budget: {
            ...s.budget,
            categories: [...s.budget.categories, { id: uid(), name, limit, spent: 0 }],
          },
        })),
      updateBudgetCategory: (id, patch) =>
        set((s) => ({
          budget: {
            ...s.budget,
            categories: s.budget.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
          },
        })),
      removeBudgetCategory: (id) =>
        set((s) => ({
          budget: { ...s.budget, categories: s.budget.categories.filter((c) => c.id !== id) },
        })),

      addAsset: (asset) => set((s) => ({ assets: [...s.assets, { ...asset, id: uid() }] })),
      removeAsset: (id) => set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),

      toggleHabit: (id, date) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            const has = h.history.includes(date);
            const history = has ? h.history.filter((d) => d !== date) : [...h.history, date];
            return { ...h, history, lastChecked: has ? h.lastChecked : date, streak: has ? Math.max(h.streak - 1, 0) : h.streak + 1 };
          }),
        })),
      addHabit: (name) =>
        set((s) => ({
          habits: [...s.habits, { id: uid(), name, history: [], streak: 0, lastChecked: null }],
        })),
      removeHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      addWishlistItem: (name, amount) =>
        set((s) => ({
          wishlist: [
            ...s.wishlist,
            { id: uid(), name, amount, addedAt: new Date().toISOString(), decidedAt: null, decision: null },
          ],
        })),
      decideWishlistItem: (id, decision) =>
        set((s) => ({
          wishlist: s.wishlist.map((w) =>
            w.id === id ? { ...w, decision, decidedAt: new Date().toISOString() } : w,
          ),
        })),

      addJournalEntry: (entry) =>
        set((s) => ({ journal: [{ ...entry, id: uid() }, ...s.journal] })),

      setWeeklyPlan: (plan) => set({ weeklyPlan: plan }),
      toggleWeeklyStepDone: (week) =>
        set((s) => ({
          weeklyPlan: s.weeklyPlan.map((w) => (w.week === week ? { ...w, completed: !w.completed } : w)),
        })),
      addCheckIn: (checkIn) =>
        set((s) => ({ checkIns: [...s.checkIns, { ...checkIn, date: new Date().toISOString() }] })),

      addChatMessage: (msg) =>
        set((s) => ({
          chat: [...s.chat, { ...msg, id: uid(), timestamp: new Date().toISOString() }],
        })),
      clearChat: () => set({ chat: [] }),

      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

      resetAllData: () =>
        set({
          diagnostics: emptyDiagnostics,
          goals: [],
          budget: emptyBudget,
          assets: [],
          habits: [],
          wishlist: [],
          journal: [],
          weeklyPlan: [],
          checkIns: [],
          chat: [],
          profile: emptyProfile,
        }),
    }),
    {
      name: "erita-financial-mentor-storage",
    },
  ),
);

export function goalTypeLabel(type: GoalType): string {
  const labels: Record<GoalType, string> = {
    cushion: "Подушка безопасности",
    debt: "Закрыть кредиты",
    apartment: "Квартира",
    savings: "Накопить",
    other: "Другое",
  };
  return labels[type];
}
