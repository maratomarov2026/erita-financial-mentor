import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, SectionTitle, Button, Input, Chip, EmptyState, StatTile } from "../../components/ui";
import { useAppStore } from "../../store/useAppStore";
import { ASSET_LESSONS } from "../../data/content";
import { netWorth, formatMoney } from "../../lib/finance";

export default function Assets() {
  const assets = useAppStore((s) => s.assets);
  const addAsset = useAppStore((s) => s.addAsset);
  const removeAsset = useAppStore((s) => s.removeAsset);
  const diagnostics = useAppStore((s) => s.diagnostics);
  const profile = useAppStore((s) => s.profile);

  const [kind, setKind] = useState<"asset" | "liability">("asset");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const worth = netWorth(assets, diagnostics.debts);

  const create = () => {
    const n = Number(amount);
    if (!name.trim() || n <= 0) return;
    addAsset({ name: name.trim(), amount: n, kind });
    setName("");
    setAmount("");
  };

  return (
    <div className="flex flex-col gap-5 pb-10">
      <SectionTitle subtitle="Активы и пассивы, чистый капитал">Активы</SectionTitle>

      <StatTile label="Чистый капитал" value={formatMoney(worth, profile.currency)} />

      <Card className="flex flex-col gap-2">
        <SectionTitle>Коротко по теме</SectionTitle>
        {ASSET_LESSONS.map((l) => (
          <div key={l.id} className="border-b border-blush last:border-0 py-2">
            <p className="font-semibold text-warmbrown">{l.title}</p>
            <p className="text-sm text-muted mt-1 leading-relaxed">{l.body}</p>
          </div>
        ))}
        <p className="text-xs text-muted italic mt-1">
          Образовательный материал. Это не персональная инвестиционная рекомендация.
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle>Мои активы и пассивы</SectionTitle>
        {assets.length === 0 ? (
          <EmptyState title="Пока пусто" body="Добавьте вклады, накопления, недвижимость или кредиты (кроме внесённых в диагностике)." />
        ) : (
          <div className="flex flex-col gap-2">
            {assets.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl2 border border-blush px-4 py-3">
                <div>
                  <span className={`text-xs font-semibold uppercase ${a.kind === "asset" ? "text-sage-dark" : "text-terracotta-dark"}`}>
                    {a.kind === "asset" ? "Актив" : "Пассив"}
                  </span>
                  <p className="font-semibold text-warmbrown">{a.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted">{formatMoney(a.amount, profile.currency)}</span>
                  <button onClick={() => removeAsset(a.id)} className="text-muted hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Chip active={kind === "asset"} onClick={() => setKind("asset")}>Актив</Chip>
          <Chip active={kind === "liability"} onClick={() => setKind("liability")}>Пассив</Chip>
        </div>
        <div className="flex gap-2">
          <Input value={name} onChange={setName} placeholder="Название" />
          <Input value={amount} onChange={setAmount} type="number" placeholder="Сумма" />
          <Button onClick={create}>
            <Plus size={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
