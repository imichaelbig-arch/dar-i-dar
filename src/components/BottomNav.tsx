import { Link } from "@tanstack/react-router";
import { Flower2, CircleDollarSign, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Цветы", Icon: Flower2 },
  { to: "/sell", label: "Продать", Icon: CircleDollarSign },
  { to: "/account", label: "Мой аккаунт", Icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {tabs.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-muted-foreground transition-colors data-[status=active]:text-primary"
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    isActive ? "btn-grad" : "bg-transparent"
                  }`}
                >
                  <Icon size={20} />
                </span>
                <span className="text-[11px] font-medium">{label}</span>
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
