"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Tone = "success" | "error" | "muted";

interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

interface ToastContextValue {
  flash: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const flash = useCallback((message: string, tone: Tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ flash }), [flash]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-50 flex w-80 flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.p
              key={toast.id}
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 16 }}
              className={
                toast.tone === "error"
                  ? "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-lg"
                  : toast.tone === "muted"
                    ? "rounded-xl border border-line bg-card px-4 py-3 text-sm text-ink shadow-lg"
                    : "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-lg"
              }
            >
              {toast.message}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
