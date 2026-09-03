import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, ChevronDown } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Продать букет" },
      { name: "description", content: "Разместите подаренный букет на продажу за пару касаний." },
    ],
  }),
  component: SellPage,
});

const CITIES = ["Москва", "Санкт-Петербург", "Казань", "Новосибирск", "Екатеринбург"];
const SIZES = ["Огромный", "Большой", "Средний"];
const FRESHNESS = ["Свежие поставки", "Отличная", "Хорошая"];

function SellPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [city, setCity] = useState(CITIES[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [freshness, setFreshness] = useState(FRESHNESS[0]);
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFile = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(price);
    if (!priceNum || priceNum < 1) {
      toast.error("Укажите корректную цену");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bouquets").insert({
      image: preview,
      city,
      size,
      freshness,
      price: priceNum,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Не удалось опубликовать");
      return;
    }
    toast.success("Букет опубликован!");
    navigate({ to: "/" });
  };

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Продать букет</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Заполните карточку — букет появится в ленте сразу после публикации.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 px-4">
        {/* Photo upload */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="soft-card flex aspect-square w-full flex-col items-center justify-center overflow-hidden border border-dashed border-[color:var(--color-pink-accent)] bg-[color:var(--color-pink-soft)]"
        >
          {preview ? (
            <img src={preview} alt="Превью букета" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="flex h-14 w-14 items-center justify-center rounded-full btn-grad">
                <Camera size={22} />
              </div>
              <span className="text-sm font-medium text-foreground">Добавить фото</span>
              <span className="text-xs">Камера или галерея</span>
            </div>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        <Field label="Город">
          <Select value={city} onChange={setCity} options={CITIES} />
        </Field>
        <Field label="Размер">
          <Select value={size} onChange={setSize} options={SIZES} />
        </Field>
        <Field label="Свежесть">
          <Select value={freshness} onChange={setFreshness} options={FRESHNESS} />
        </Field>
        <Field label="Цена, руб.">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Например, 1500"
            className="w-full rounded-2xl bg-secondary px-4 py-3 text-base font-medium placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="btn-grad mt-2 w-full rounded-full py-3.5 text-base font-semibold"
        >
          {submitting ? "Публикуем…" : "Опубликовать букет"}
        </button>
      </form>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-2xl bg-secondary px-4 py-3 pr-10 text-base font-medium focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
