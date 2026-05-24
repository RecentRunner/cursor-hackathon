"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error";

type ToastMessage = {
  id: number;
  title: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (title: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((title: string, variant: ToastVariant = "default") => {
    const id = Date.now() + Math.random();

    setMessages((current) => [...current, { id, title, variant }]);

    window.setTimeout(() => {
      setMessages((current) => current.filter((message) => message.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 z-50 flex w-[min(100vw-2rem,20rem)] flex-col gap-2"
        style={{ bottom: "calc(var(--bottom-nav-height) + 0.75rem)" }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "rounded-lg border px-4 py-3 text-xs shadow-lg backdrop-blur-sm",
              message.variant === "success" &&
                "border-emerald-500/30 bg-emerald-500/15 text-emerald-100",
              message.variant === "error" &&
                "border-red-500/30 bg-red-500/15 text-red-100",
              message.variant === "default" &&
                "border-border/60 bg-background/95 text-foreground",
            )}
          >
            {message.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
