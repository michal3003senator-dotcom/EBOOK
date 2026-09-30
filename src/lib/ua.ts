export function parseUA(ua: string) {
  const s = ua.toLowerCase();
  const bot = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|curl|wget|python/.test(s);
  const device = /ipad|tablet|(android(?!.*mobile))/.test(s) ? "tablet" : /mobi|iphone|android/.test(s) ? "mobile" : "desktop";
  const browser = /edg\//.test(s)
    ? "Edge"
    : /opr\/|opera/.test(s)
      ? "Opera"
      : /samsungbrowser/.test(s)
        ? "Samsung"
        : /tiktok|musical_ly|bytedance/.test(s)
          ? "TikTok (in-app)"
          : /instagram/.test(s)
            ? "Instagram (in-app)"
            : /fban|fbav/.test(s)
              ? "Facebook (in-app)"
              : /firefox|fxios/.test(s)
                ? "Firefox"
                : /chrome|crios/.test(s)
                  ? "Chrome"
                  : /safari/.test(s)
                    ? "Safari"
                    : "inna";
  const os = /windows/.test(s)
    ? "Windows"
    : /iphone|ipad|ios/.test(s)
      ? "iOS"
      : /android/.test(s)
        ? "Android"
        : /mac os/.test(s)
          ? "macOS"
          : /linux/.test(s)
            ? "Linux"
            : "inny";
  return { bot, device, browser, os };
}
