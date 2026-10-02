import { useState } from "react";
import { Download, Trash2, Check } from "lucide-react";
import { Card, SectionTitle, Button, Input, Chip } from "../components/ui";
import { useAppStore } from "../store/useAppStore";
import type { SubscriptionPlan } from "../types";

const CURRENCIES = ["RUB", "KZT", "USD", "EUR"] as const;

export default function Profile() {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const resetAllData = useAppStore((s) => s.resetAllData);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const exportData = () => {
    const state = useAppStore.getState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "erita-my-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAll = () => {
    resetAllData();
    setConfirmDelete(false);
  };

  const setPlan = (plan: SubscriptionPlan) => updateProfile({ subscriptionPlan: plan });

  return (
    <div className="flex flex-col gap-5 pb-10">
      <SectionTitle>Профиль</SectionTitle>

      <Card className="flex flex-col gap-4">
        <Input label="Имя" value={profile.name} onChange={(v) => updateProfile({ name: v })} placeholder="Как к вам обращаться?" />
        <div>
          <p className="text-sm font-semibold text-warmbrown mb-2">Валюта</p>
          <div className="flex gap-2">
            {CURRENCIES.map((c) => (
              <Chip key={c} active={profile.currency === c} onClick={() => updateProfile({ currency: c })}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
        <label className="flex items-center justify-between">
          <span className="text-sm font-semibold text-warmbrown">Уведомления и напоминания</span>
          <button
            onClick={() => updateProfile({ notificationsEnabled: !profile.notificationsEnabled })}
            className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${
              profile.notificationsEnabled ? "bg-sage justify-end" : "bg-blush justify-start"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white block" />
          </button>
        </label>
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle subtitle="Бесплатный план ограничен — подписка открывает все модули и наставника без ограничений">
          Подписка
        </SectionTitle>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setPlan("free")}
            className={`rounded-xl2 border p-4 text-left ${profile.subscriptionPlan === "free" ? "border-terracotta bg-blush/30" : "border-blush"}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-warmbrown">Бесплатный</span>
              {profile.subscriptionPlan === "free" && <Check size={16} className="text-terracotta" />}
            </div>
            <p className="text-xs text-muted mt-1">Диагностика, «Моя карта», базовый дашборд, 1 цель, ограниченный чат</p>
          </button>
          <button
            onClick={() => setPlan("subscriber")}
            className={`rounded-xl2 border p-4 text-left ${profile.subscriptionPlan === "subscriber" ? "border-terracotta bg-blush/30" : "border-blush"}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-warmbrown">Подписка</span>
              {profile.subscriptionPlan === "subscriber" && <Check size={16} className="text-terracotta" />}
            </div>
            <p className="text-xs text-muted mt-1">Все модули, неограниченный наставник, калькуляторы, план внедрения</p>
          </button>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle>Данные</SectionTitle>
        <Button variant="secondary" onClick={exportData} className="flex items-center justify-center gap-2">
          <Download size={16} /> Экспортировать мои данные
        </Button>
        {!confirmDelete ? (
          <Button variant="danger" onClick={() => setConfirmDelete(true)} className="flex items-center justify-center gap-2">
            <Trash2 size={16} /> Удалить все данные
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-terracotta-dark">Это действие необратимо. Удалить все данные приложения?</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setConfirmDelete(false)} className="flex-1">
                Отмена
              </Button>
              <Button variant="danger" onClick={deleteAll} className="flex-1">
                Да, удалить
              </Button>
            </div>
          </div>
        )}
      </Card>

      <p className="text-xs text-muted text-center px-6">
        Приложение образовательное и не является финансовой, инвестиционной, юридической или психологической консультацией.
      </p>
    </div>
  );
}
