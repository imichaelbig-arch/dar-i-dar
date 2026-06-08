import { createFileRoute } from "@tanstack/react-router";
import { Bell, Heart, HelpCircle, LogOut, Settings, ShoppingBag, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Мой аккаунт" },
      { name: "description", content: "Профиль продавца и покупателя букетов." },
    ],
  }),
  component: AccountPage,
});

const items = [
  { Icon: ShoppingBag, label: "Мои покупки" },
  { Icon: Heart, label: "Избранное" },
  { Icon: Bell, label: "Уведомления" },
  { Icon: Settings, label: "Настройки" },
  { Icon: HelpCircle, label: "Помощь" },
  { Icon: LogOut, label: "Выйти" },
] as const;

function AccountPage() {
  return (
    <AppShell>
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Мой аккаунт</h1>
      </header>

      <section className="mx-4 mb-5 flex items-center gap-4 rounded-3xl btn-grad p-5 text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur">
          <User size={26} />
        </div>
        <div>
          <p className="text-lg font-semibold">Гость</p>
          <p className="text-sm text-white/85">Войдите, чтобы продавать букеты</p>
        </div>
      </section>

      <section className="mx-4 grid grid-cols-3 gap-3">
        <Stat value="0" label="Покупок" />
        <Stat value="0" label="Продаж" />
        <Stat value="0" label="Букетов" />
      </section>

      <section className="mt-5 px-4">
        <ul className="soft-card divide-y divide-border overflow-hidden">
          {items.map(({ Icon, label }) => (
            <li key={label}>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-medium hover:bg-secondary"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-pink-soft)] text-primary">
                  <Icon size={18} />
                </span>
                {label}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="soft-card flex flex-col items-center py-3">
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
