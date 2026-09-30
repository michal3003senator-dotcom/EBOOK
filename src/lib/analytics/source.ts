const KNOWN: [RegExp, string][] = [
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)instagram\.com$|^l\.instagram\.com$/, "Instagram"],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, "YouTube"],
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$|^l\.facebook\.com$|^m\.facebook\.com$/, "Facebook"],
  [/(^|\.)t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/, "X"],
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/, "LinkedIn"],
  [/(^|\.)pinterest\./, "Pinterest"],
  [/(^|\.)reddit\.com$/, "Reddit"],
  [/(^|\.)wykop\.pl$/, "Wykop"],
  [/mail\.|poczta|gmail|outlook/, "E-mail"],
];

export function referrerHost(referrer: string | undefined, ownHost: string) {
  if (!referrer) return null;
  try {
    const h = new URL(referrer).hostname.replace(/^www\./, "");
    return h && h !== ownHost ? h : null;
  } catch {
    return null;
  }
}

export function classifySource(utmSource: string | null | undefined, refHost: string | null, affiliate?: string | null) {
  if (utmSource) {
    const u = utmSource.toLowerCase();
    for (const [re, name] of KNOWN) if (re.test(`${u}.com`) || u === name.toLowerCase()) return name;
    return utmSource.slice(0, 60);
  }
  if (refHost) {
    for (const [re, name] of KNOWN) if (re.test(refHost)) return name;
    return refHost;
  }
  return affiliate ? "Partner" : "bezpośrednie";
}
