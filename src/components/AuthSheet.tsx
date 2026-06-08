import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

const STORAGE_KEY = "flowers_auth_user";

export type AuthUser = { name: string; phone: string };

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("auth-changed"));
}

export function AuthSheet({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: (user: AuthUser) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [code, setCode] = useState(["", "", "", ""]);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (open) {
      setStep(1);
      setPhone("");
      setAgree(false);
      setCode(["", "", "", ""]);
    }
  }, [open]);

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    }
  }, [step]);

  const canContinue = phone.replace(/\D/g, "").length >= 6 && agree;

  function handleCodeChange(i: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    if (digit && i < 3) inputsRef.current[i + 1]?.focus();
    if (next.every((d) => d.length === 1)) {
      const user: AuthUser = { name: "Анна", phone };
      setStoredUser(user);
      setTimeout(() => {
        onSuccess(user);
        onOpenChange(false);
      }, 250);
    }
  }

  function handleCodeKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-3xl border-0 p-0"
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted" />
        <div className="px-6 pb-8 pt-4">
          {step === 1 ? (
            <>
              <SheetHeader className="space-y-2 text-left">
                <SheetTitle className="text-2xl font-bold">Добро пожаловать</SheetTitle>
                <SheetDescription className="text-base">
                  Для использования нашего сервиса, укажите Ваш номер телефона
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="Номер телефона"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-[color:var(--color-pink-soft)] px-5 py-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
                  <Checkbox
                    checked={agree}
                    onCheckedChange={(v) => setAgree(Boolean(v))}
                    className="mt-0.5"
                  />
                  <span>
                    Я принимаю{" "}
                    <span className="text-primary underline">Политику конфиденциальности</span>{" "}
                    и даю согласие на обработку персональных данных
                  </span>
                </label>
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setStep(2)}
                  className="btn-grad w-full rounded-2xl py-4 text-base font-semibold"
                >
                  Продолжить
                </button>
              </div>
            </>
          ) : (
            <>
              <SheetHeader className="space-y-2 text-left">
                <SheetTitle className="text-2xl font-bold">Подтверждение</SheetTitle>
                <SheetDescription className="text-base">
                  Введите 4-значный код из SMS
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex justify-center gap-3">
                {code.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="h-16 w-14 rounded-2xl border border-border bg-[color:var(--color-pink-soft)] text-center text-2xl font-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-6 w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Изменить номер
              </button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
