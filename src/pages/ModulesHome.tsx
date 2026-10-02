import { useNavigate } from "react-router-dom";
import { Brain, ListChecks, Wallet, PieChart, Compass } from "lucide-react";
import { Card, SectionTitle } from "../components/ui";

const MODULES = [
  {
    path: "/modules/psychology",
    icon: Brain,
    title: "1. Психология богатого человека",
    desc: "Убеждения, тревога, дневник мыслей",
  },
  {
    path: "/modules/discipline",
    icon: ListChecks,
    title: "2. Дисциплина и навыки",
    desc: "Привычки, правило 24 часов, недельный обзор",
  },
  {
    path: "/modules/system",
    icon: Wallet,
    title: "3. Система управления",
    desc: "Бюджет, подушка безопасности, распределение дохода",
  },
  {
    path: "/modules/assets",
    icon: PieChart,
    title: "4. Активы",
    desc: "Активы и пассивы, чистый капитал",
  },
  {
    path: "/modules/strategy",
    icon: Compass,
    title: "5. Стратегия",
    desc: "Калькулятор кредитов, план покупки квартиры",
  },
];

export default function ModulesHome() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-5 pb-10">
      <SectionTitle subtitle="Проходите в своём темпе — рекомендованный порядок есть в «Моей карте»">Модули</SectionTitle>
      <div className="flex flex-col gap-3">
        {MODULES.map((m) => (
          <Card key={m.path} className="flex items-center gap-4 cursor-pointer" >
            <div className="flex items-center gap-4 w-full" onClick={() => navigate(m.path)}>
              <div className="w-12 h-12 rounded-full bg-blush flex items-center justify-center shrink-0">
                <m.icon size={22} className="text-terracotta-dark" />
              </div>
              <div>
                <p className="font-bold text-warmbrown">{m.title}</p>
                <p className="text-sm text-muted">{m.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
