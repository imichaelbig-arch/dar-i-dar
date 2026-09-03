import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, MessageCircle, ShoppingCart, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { resolveBouquetImage } from "@/lib/bouquet-images";
import { formatPublished } from "@/lib/format-date";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Цветы — маркетплейс подаренных букетов" },
      { name: "description", content: "Перепродажа подаренных букетов цветов рядом с вами." },
    ],
  }),
  component: FeedPage,
});

type Bouquet = {
  id: string;
  image: string | null;
  size: string;
  freshness: string;
  price: number;
  city: string;
  status: string;
  created_at: string;
};

const CITIES = ["Москва", "Санкт-Петербург", "Казань", "Новосибирск", "Екатеринбург"];
const CATEGORIES = ["Все букеты", "Розы", "Цветы", "Растения"] as const;
const SORTS = ["Без фильтра", "Сначала дешевле", "Сначала дороже", "Сначала свежие"] as const;

function FeedPage() {
  const navigate = useNavigate();
  const [city, setCity] = useState("Москва");
  const [cityOpen, setCityOpen] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Все букеты");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Без фильтра");
  const [items, setItems] = useState<Bouquet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from("bouquets")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!cancelled) {
          setItems((data ?? []) as Bouquet[]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = items.filter((b) => b.city === city);
    if (sort === "Сначала дешевле") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "Сначала дороже") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [items, city, sort]);

  const counts: Record<string, number> = {
    "Все букеты": items.length,
    Розы: 124,
    Цветы: 312,
    Растения: 139,
  };

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 pt-3 pb-3">
          <button
            type="button"
            aria-label="Чат"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <MessageCircle size={20} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setCityOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-semibold tracking-wide"
            >
              <span className="text-muted-foreground">ГОРОД:</span>
              <span>{city}</span>
              <ChevronDown size={16} className={`transition ${cityOpen ? "rotate-180" : ""}`} />
            </button>
            {cityOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-2 w-44 -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCity(c);
                      setCityOpen(false);
                    }}
                    className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-secondary ${
                      c === city ? "font-semibold text-primary" : ""
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: "/account" })}
            aria-label="Профиль"
            className="flex h-10 w-10 items-center justify-center rounded-full btn-grad"
          >
            <User size={20} />
          </button>
        </div>

        {/* Categories */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "btn-grad"
                    : "bg-[color:var(--color-pink-soft)] text-foreground"
                }`}
              >
                <span>{c}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active ? "bg-white/25" : "bg-white/70 text-muted-foreground"
                  }`}
                >
                  {counts[c]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 px-4 pb-3 text-xs">
          <span className="font-semibold tracking-wider text-muted-foreground">ФИЛЬТР</span>
          <span className="text-muted-foreground">Сортировать:</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])}
              className="appearance-none rounded-full bg-secondary py-1.5 pl-3 pr-7 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="px-3 pt-1">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-3xl bg-secondary" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-20 text-center text-sm text-muted-foreground">
            В этом городе пока нет букетов.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((b) => (
              <BouquetCard
                key={b.id}
                bouquet={b}
                onBuy={() =>
                  navigate({ to: "/checkout/$id", params: { id: b.id } })
                }
              />
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}

function BouquetCard({ bouquet, onBuy }: { bouquet: Bouquet; onBuy: () => void }) {
  const published = formatPublished(bouquet.created_at);
  return (
    <article className="soft-card overflow-hidden">
      <div className="aspect-square overflow-hidden bg-[color:var(--color-pink-soft)]">
        <img
          src={resolveBouquetImage(bouquet.image)}
          alt="Букет"
          loading="lazy"
          width={512}
          height={512}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-1 px-3 pt-2.5 text-[13px]">
        <p>
          <span className="text-muted-foreground">Размер: </span>
          <span className="font-medium">{bouquet.size}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Свежесть: </span>
          <span className="font-medium">{bouquet.freshness}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Цена: </span>
          <span className="font-semibold">{bouquet.price.toLocaleString("ru-RU")} руб.</span>
        </p>
        {published && (
          <time dateTime={bouquet.created_at} className="block space-y-0.5 pt-1">
            <span className="block">
              <span className="text-muted-foreground">Дата: </span>
              <span className="font-medium">{published.date}</span>
            </span>
            <span className="block">
              <span className="text-muted-foreground">Время: </span>
              <span className="font-medium">{published.time}</span>
            </span>
          </time>
        )}
      </div>
      <div className="p-3 pt-2">
        <button
          type="button"
          onClick={onBuy}
          className="btn-grad flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold"
        >
          <ShoppingCart size={16} />
          Купить
        </button>
      </div>
    </article>
  );
}
