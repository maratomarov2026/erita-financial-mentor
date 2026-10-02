import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShieldCheck, Compass } from "lucide-react";
import { Button } from "../components/ui";
import { useAppStore } from "../store/useAppStore";

const SLIDES = [
  {
    icon: Heart,
    title: "Ваш личный финансовый наставник",
    body: "Соберём все цифры в одном месте, выстроим систему и дойдём до ваших целей — без стыда и давления.",
  },
  {
    icon: Compass,
    title: "Коучинг, а не готовые советы",
    body: "Наставник задаёт вопросы, которые помогают вам самой найти решение и снизить тревогу из-за денег.",
  },
  {
    icon: ShieldCheck,
    title: "Ваши данные — только ваши",
    body: "Мы не передаём ваши финансовые данные третьим лицам без согласия. Вы можете экспортировать или удалить их в любой момент.",
  },
];

export default function Welcome() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const updateProfile = useAppStore((s) => s.updateProfile);

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const next = () => {
    if (isLast) {
      updateProfile({ onboardingSeen: true });
      navigate("/diagnostics");
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between px-6 py-10">
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
        <div className="w-20 h-20 rounded-full bg-blush flex items-center justify-center mb-6">
          <slide.icon size={34} className="text-terracotta-dark" />
        </div>
        <h1 className="text-2xl font-extrabold text-warmbrown mb-3">{slide.title}</h1>
        <p className="text-muted leading-relaxed">{slide.body}</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-terracotta" : "w-2 bg-blush"
              }`}
            />
          ))}
        </div>
        <Button onClick={next} className="w-full max-w-sm">
          {isLast ? "Начать диагностику" : "Далее"}
        </Button>
        {!isLast && (
          <button
            className="text-sm text-muted underline"
            onClick={() => {
              updateProfile({ onboardingSeen: true });
              navigate("/diagnostics");
            }}
          >
            Пропустить
          </button>
        )}
      </div>
    </div>
  );
}
