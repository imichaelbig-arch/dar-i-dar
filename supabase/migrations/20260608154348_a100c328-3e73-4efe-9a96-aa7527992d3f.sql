
CREATE TABLE public.bouquets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image TEXT,
  size TEXT NOT NULL,
  freshness TEXT NOT NULL,
  price INTEGER NOT NULL,
  city TEXT NOT NULL DEFAULT 'Москва',
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.bouquets TO anon, authenticated;
GRANT ALL ON public.bouquets TO service_role;

ALTER TABLE public.bouquets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bouquets" ON public.bouquets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert bouquets" ON public.bouquets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bouquet status" ON public.bouquets FOR UPDATE USING (true) WITH CHECK (true);
