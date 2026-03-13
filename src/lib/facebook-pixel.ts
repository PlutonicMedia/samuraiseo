declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: (...args: unknown[]) => void;
  }
}

export function initFacebookPixel(pixelId: string) {
  if (!pixelId || typeof window === "undefined") return;

  // Avoid double-init
  if (window.fbq) return;

  const n = (window.fbq = function (...args: unknown[]) {
    // @ts-ignore
    n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
  } as any);
  if (!window._fbq) window._fbq = n as any;
  (n as any).push = n;
  (n as any).loaded = true;
  (n as any).version = "2.0";
  (n as any).queue = [];

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params);
  }
}

export function trackCustomEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", eventName, params);
  }
}
