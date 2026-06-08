
DROP POLICY "Anyone can update bouquet status" ON public.bouquets;
CREATE POLICY "Anyone can mark bouquet sold" ON public.bouquets
  FOR UPDATE USING (true) WITH CHECK (status IN ('available','sold'));
