import { Redis } from "@upstash/redis";

/** The handful of Redis operations the ledger needs. */
export type KV = {
  get(key: string): Promise<string | null>;
  mget(keys: string[]): Promise<(string | null)[]>;
  set(key: string, value: string, opts?: { nx?: boolean; px?: number }): Promise<unknown>;
  del(key: string): Promise<unknown>;
  rpush(key: string, ...values: string[]): Promise<number>;
  lrange(key: string, start: number, end: number): Promise<string[]>;
  llen(key: string): Promise<number>;
  hincrby(key: string, field: string, by: number): Promise<number>;
  hgetall(key: string): Promise<Record<string, string> | null>;
};

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

/** True when backed by Redis; false means process memory (local dev and tests). */
export const durable = Boolean(url && token);

function upstash(): KV {
  const r = new Redis({ url: url!, token: token!, automaticDeserialization: false });
  return {
    get: (k) => r.get<string>(k),
    mget: (keys) => (keys.length ? r.mget<(string | null)[]>(...keys) : Promise.resolve([])),
    set: (k, v, o) =>
      o?.nx ? r.set(k, v, { nx: true, px: o.px ?? 15_000 }) : o?.px ? r.set(k, v, { px: o.px }) : r.set(k, v),
    del: (k) => r.del(k),
    rpush: (k, ...v) => r.rpush(k, ...v),
    lrange: (k, s, e) => r.lrange<string>(k, s, e),
    llen: (k) => r.llen(k),
    hincrby: (k, f, n) => r.hincrby(k, f, n),
    hgetall: (k) => r.hgetall<Record<string, string>>(k),
  };
}

// ponytail: in-memory stand-in (no TTL eviction) for local dev and tests; production uses Redis.
function memory(): KV {
  const g = globalThis as { __prooflaneKV?: Map<string, unknown> };
  const m = (g.__prooflaneKV ??= new Map());
  const list = (k: string) => {
    if (!m.has(k)) m.set(k, []);
    return m.get(k) as string[];
  };
  return {
    get: async (k) => (m.get(k) as string | undefined) ?? null,
    mget: async (keys) => keys.map((k) => (m.get(k) as string | undefined) ?? null),
    set: async (k, v, o) => {
      if (o?.nx && m.has(k)) return null;
      m.set(k, v);
      return "OK";
    },
    del: async (k) => m.delete(k),
    rpush: async (k, ...v) => list(k).push(...v),
    lrange: async (k, s, e) => list(k).slice(s, e === -1 ? undefined : e + 1),
    llen: async (k) => list(k).length,
    hincrby: async (k, f, n) => {
      const h = (m.get(k) as Record<string, string> | undefined) ?? {};
      h[f] = String(Number(h[f] ?? 0) + n);
      m.set(k, h);
      return Number(h[f]);
    },
    hgetall: async (k) => (m.get(k) as Record<string, string> | undefined) ?? null,
  };
}

export const kv: KV = durable ? upstash() : memory();

export async function getJson<T>(key: string): Promise<T | null> {
  const raw = await kv.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export const setJson = (key: string, value: unknown) => kv.set(key, JSON.stringify(value));
