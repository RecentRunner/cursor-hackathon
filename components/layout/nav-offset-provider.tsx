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

const NAV_OFFSET_FALLBACK = "6rem";

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

function setNavOffset(value: string) {
  document.documentElement.style.setProperty("--app-nav-offset", value);
}

function setViewportBottomOffset(value: string) {
  document.documentElement.style.setProperty(
    "--app-viewport-bottom-offset",
    value,
  );
}

export function NavOffsetProvider({
  children,
  enabled = true,
}: NavOffsetProviderProps) {
  const navElementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const syncOffset = useCallback(() => {
    if (!enabled || !navElementRef.current) {
      setNavOffset(enabled ? NAV_OFFSET_FALLBACK : "0px");
      return;
    }

    setNavOffset(`${navElementRef.current.offsetHeight}px`);
  }, [enabled]);

  const syncViewportBottom = useCallback(() => {
    const viewport = window.visualViewport;

    if (!viewport) {
      setViewportBottomOffset("0px");
      return;
    }

    const keyboardGap = Math.max(
      0,
      window.innerHeight - viewport.height - viewport.offsetTop,
    );

    setViewportBottomOffset(`${keyboardGap}px`);
  }, []);

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
    syncViewportBottom();

    window.addEventListener("resize", syncOffset);
    window.addEventListener("resize", syncViewportBottom);

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", syncViewportBottom);
    viewport?.addEventListener("scroll", syncViewportBottom);

    return () => {
      window.removeEventListener("resize", syncOffset);
      window.removeEventListener("resize", syncViewportBottom);
      viewport?.removeEventListener("resize", syncViewportBottom);
      viewport?.removeEventListener("scroll", syncViewportBottom);

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      setNavOffset(NAV_OFFSET_FALLBACK);
      setViewportBottomOffset("0px");
    };
  }, [syncOffset, syncViewportBottom]);

  useEffect(() => {
    if (!enabled) {
      setNavElement(null);
      setNavOffset("0px");
    }
  }, [enabled, setNavElement]);

  return (
    <NavOffsetContext.Provider value={{ setNavElement }}>
      {children}
    </NavOffsetContext.Provider>
  );
}
