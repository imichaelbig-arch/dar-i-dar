import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { resolveBouquetImage } from "@/lib/bouquet-images";

const SERVICE_FEE = 200;

export const Route = createFileRoute("/checkout/$id")({
  head: () => ({
    meta: [
      { title: "Оплата букета" },
      { name: "description", content: "Безопасная оплата покупки букета." },
    ],
  }),
  component: CheckoutPage,
});

type Bouquet = {
  id: string;
  image: string | null;
  size: string;
  freshness: string;
  price: number;
  city: string;
};

function CheckoutPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [bouquet, setBouquet] = useState<Bouquet | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    supabase
      .from("bouquets")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setBouquet(data as Bouquet | null);
        setLoading(false);
      });
  }, [id]);

  const handlePay = async () => {
    if (!bouquet) return;
    setPaying(true);
    await supabase.from("bouquets").update({ status: "sold" }).eq("id", bouquet.id);
    setPaying(false);
    setPaid(true);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="mt-20 text-center text-sm text-muted-foreground">Загрузка…</div>
      </AppShell>
    );
  }

  if (!bouquet) {
    return (
      <AppShell>
        <div className="mt-20 px-6 text-center">
          <p className="text-sm text-muted-foreground">Букет не найден.</p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="btn-grad mt-4 rounded-full px-6 py-2 text-sm font-semibold"
          >
            На главную
          </button>
        </div>
      </AppShell>
    );
  }

  if (paid) {
    return (
      <AppShell>
        <div className="flex flex-col items-center px-6 pt-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full btn-grad">
            <CheckCircle2 size={42} />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Оплата прошла!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Продавец получил уведомление и свяжется с вами в чате.
          </p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="btn-grad mt-8 w-full rounded-full py-3 text-base font-semibold"
          >
            Вернуться к букетам
          </button>
        </div>
      </AppShell>
    );
  }

  const total = bouquet.price + SERVICE_FEE;

  return (
    <AppShell>
      <header className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
          aria-label="Назад"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">Оплата</h1>
      </header>

      <section className="soft-card mx-4 mb-4 flex gap-3 p-3">
        <img
          src={resolveBouquetImage(bouquet.image)}
          alt="Букет"
          className="h-20 w-20 rounded-2xl object-cover"
        />
        <div className="flex flex-col justify-center text-sm">
          <p className="font-semibold">Букет, {bouquet.size.toLowerCase()}</p>
          <p className="text-muted-foreground">Свежесть: {bouquet.freshness}</p>
          <p className="text-muted-foreground">Город: {bouquet.city}</p>
        </div>
      </section>

      <section className="soft-card mx-4 mb-4 divide-y divide-border p-1">
        <Row label="Цена продавца" value={`${bouquet.price.toLocaleString("ru-RU")} руб.`} />
        <Row label="Сервисный сбор платформы" value={`${SERVICE_FEE} руб.`} />
        <Row label="Итого к оплате" value={`${total.toLocaleString("ru-RU")} руб.`} bold />
      </section>

      <p className="mx-5 mb-5 flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
        Платёж защищён. Деньги придут продавцу после подтверждения получения букета.
      </p>

      <div className="px-4">
        <button
          type="button"
          onClick={handlePay}
          disabled={paying}
          className="btn-grad w-full rounded-full py-3.5 text-base font-semibold"
        >
          {paying ? "Обработка…" : `Оплатить ${total.toLocaleString("ru-RU")} руб.`}
        </button>
      </div>
    </AppShell>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className={bold ? "font-semibold" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "text-base font-bold text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}
