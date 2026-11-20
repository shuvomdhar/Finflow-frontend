"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Free, key-less exchange rates. The ledger stores every amount in USD and the
 * UI converts at display time, so changing the currency never rewrites data.
 */
const RATES_ENDPOINT = "https://open.er-api.com/v6/latest/USD";
const CURRENCY_KEY = "finflow-currency";
const RATES_KEY = "finflow-rates-v1";
const RATES_TTL = 1000 * 60 * 60 * 12;

export type CurrencyOption = {
  code: string;
  name: string;
  symbol: string;
};

export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "Rs" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "ARS", name: "Argentine Peso", symbol: "AR$" },
];

const CURRENCY_CODES = new Set(CURRENCIES.map((currency) => currency.code));

export function currencyMeta(code: string): CurrencyOption {
  return (
    CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0]
  );
}

export function isSupportedCurrency(code: string): boolean {
  return CURRENCY_CODES.has(code);
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function amountFormatter(): Intl.NumberFormat {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function compactFormatter(): Intl.NumberFormat {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

export function formatMoney(
  value: number,
  currency: string,
  compact = false,
): string {
  const safe = Number.isFinite(value) ? value : 0;
  const meta = currencyMeta(currency);
  const formatted = compact
    ? compactFormatter().format(safe)
    : amountFormatter().format(safe);
  const gap = meta.symbol.length > 1 ? " " : "";
  return `${meta.symbol}${gap}${formatted}`;
}

type RatesCache = {
  rates: Record<string, number>;
  fetchedAt: number;
};

function readStoredCurrency(): string | null {
  try {
    const stored = window.localStorage.getItem(CURRENCY_KEY);
    return stored && isSupportedCurrency(stored) ? stored : null;
  } catch {
    return null;
  }
}

function readRatesCache(): RatesCache | null {
  try {
    const raw = window.localStorage.getItem(RATES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RatesCache>;
    if (!parsed.rates || typeof parsed.fetchedAt !== "number") return null;
    return { rates: parsed.rates, fetchedAt: parsed.fetchedAt };
  } catch {
    return null;
  }
}

function writeRatesCache(cache: RatesCache): void {
  try {
    window.localStorage.setItem(RATES_KEY, JSON.stringify(cache));
  } catch {
    // Storage can be unavailable in private mode; rates still live in memory.
  }
}

type CurrencyState = {
  /** Currency the user picked. */
  currency: string;
  /** Units of `currency` per 1 USD (1 until live rates arrive). */
  rate: number;
  /** True when a live rate exists for the selected currency. */
  rateReady: boolean;
  ratesUpdatedAt: number | null;
  loading: boolean;
  error: string | null;
  setCurrency: (code: string) => void;
  refreshRates: () => Promise<void>;
  /** Treats the input as USD and prints it in the selected currency. */
  formatCurrency: (usd: number) => string;
  formatCompactCurrency: (usd: number) => string;
  /** Converts an amount typed in the selected currency into USD. */
  toUsd: (value: number) => number;
  /** Converts a stored USD amount into the selected currency. */
  fromUsd: (value: number) => number;
};

const CurrencyContext = createContext<CurrencyState | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState("USD");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(RATES_ENDPOINT, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Rate service returned ${response.status}`);
      }
      const payload = (await response.json()) as {
        result?: string;
        rates?: Record<string, number>;
      };
      if (payload.result !== "success" || !payload.rates) {
        throw new Error("Rate service returned an unexpected payload");
      }
      setRates(payload.rates);
      const fetchedAt = Date.now();
      setRatesUpdatedAt(fetchedAt);
      writeRatesCache({ rates: payload.rates, fetchedAt });
    } catch {
      setError("Live exchange rates are unavailable right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer storage reads and the network call one tick so this effect never
    // synchronously cascades state during the commit phase.
    const timer = setTimeout(() => {
      const stored = readStoredCurrency();
      if (stored) setCurrencyState(stored);

      const cache = readRatesCache();
      if (cache) {
        setRates(cache.rates);
        setRatesUpdatedAt(cache.fetchedAt);
        setLoading(false);
      }

      if (!cache || Date.now() - cache.fetchedAt > RATES_TTL) {
        void refreshRates();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [refreshRates]);

  const setCurrency = useCallback((code: string) => {
    if (!isSupportedCurrency(code)) return;
    setCurrencyState(code);
    try {
      window.localStorage.setItem(CURRENCY_KEY, code);
    } catch {
      // The in-memory selection still works for this session.
    }
  }, []);

  const liveRate =
    currency === "USD" ? 1 : (rates?.[currency] ?? null);
  const rateReady = liveRate !== null;
  // Never print converted-looking numbers in a currency we cannot convert yet.
  const effectiveCode = liveRate === null ? "USD" : currency;
  const rate = liveRate ?? 1;

  const formatCurrency = useCallback(
    (usd: number) => formatMoney(usd * rate, effectiveCode),
    [effectiveCode, rate],
  );

  const formatCompactCurrency = useCallback(
    (usd: number) => formatMoney(usd * rate, effectiveCode, true),
    [effectiveCode, rate],
  );

  const toUsd = useCallback(
    (value: number) => roundMoney(value / rate),
    [rate],
  );

  const fromUsd = useCallback(
    (value: number) => roundMoney(value * rate),
    [rate],
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        rate,
        rateReady,
        ratesUpdatedAt,
        loading,
        error,
        setCurrency,
        refreshRates,
        formatCurrency,
        formatCompactCurrency,
        toUsd,
        fromUsd,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyState {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used inside CurrencyProvider");
  }
  return context;
}
