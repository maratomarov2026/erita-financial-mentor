import { NavLink, Outlet } from "react-router-dom";
import { Home, LayoutGrid, Target, MessageCircle, User } from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Главная", icon: Home },
  { to: "/modules", label: "Модули", icon: LayoutGrid },
  { to: "/goals", label: "Цели", icon: Target },
  { to: "/mentor", label: "Наставник", icon: MessageCircle },
  { to: "/profile", label: "Профиль", icon: User },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <main className="flex-1 max-w-xl w-full mx-auto px-4 pt-6 pb-24">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-paper border-t border-blush/70 shadow-soft">
        <div className="max-w-xl mx-auto flex justify-between px-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  "flex flex-col items-center gap-1 py-2.5 px-3 text-xs font-semibold flex-1",
                  isActive ? "text-terracotta" : "text-muted",
                )
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
