"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type Ref,
} from "react";

type NavOffsetContextValue = {
  setNavElement: (element: HTMLElement | null) => void;
};

const NavOffsetContext = createContext<NavOffsetContextValue | null>(null);

export function useNavOffsetRef<T extends HTMLElement>() {
  const context = useContext(NavOffsetContext);

  if (!context) {
    throw new Error("useNavOffsetRef must be used within NavOffsetProvider.");
  }

  const setNavElement = context.setNavElement;

  return useCallback(
    (node: T | null) => {
      setNavElement(node);
    },
    [setNavElement],
  ) as Ref<T>;
}

type NavOffsetProviderProps = {
  children: ReactNode;
  enabled?: boolean;
};

export function NavOffsetProvider({
  children,
  enabled = true,
}: NavOffsetProviderProps) {
  const navElementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const syncOffset = useCallback(() => {
    const root = document.documentElement;

    if (!enabled || !navElementRef.current) {
      root.style.setProperty("--app-nav-offset", "0px");
      return;
    }

    root.style.setProperty(
      "--app-nav-offset",
      `${navElementRef.current.offsetHeight}px`,
    );
  }, [enabled]);

  const setNavElement = useCallback(
    (element: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      navElementRef.current = element;

      if (!element || !enabled) {
        syncOffset();
        return;
      }

      const observer = new ResizeObserver(() => {
        syncOffset();
      });

      observer.observe(element);
      observerRef.current = observer;
      syncOffset();
    },
    [enabled, syncOffset],
  );

  useEffect(() => {
    syncOffset();
    window.addEventListener("resize", syncOffset);

    return () => {
      window.removeEventListener("resize", syncOffset);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      document.documentElement.style.setProperty("--app-nav-offset", "0px");
    };
  }, [syncOffset]);

  useEffect(() => {
    if (!enabled) {
      setNavElement(null);
    }
  }, [enabled, setNavElement]);

  return (
    <NavOffsetContext.Provider value={{ setNavElement }}>
      {children}
    </NavOffsetContext.Provider>
  );
}
