import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { fetchLatestPrices } from '$lib/services/pricing';

type PriceRow = {
	current?: number;
	lastKnown?: number;
	stale: boolean;
	updatedAt?: string;
	fetchFailedAt?: string;
	staleReason?: 'cache_ttl_expired' | 'fetch_failed';
};

type PriceState = {
	items: Record<number, PriceRow>;
	isRefreshing: boolean;
};

type PriceCachePayload = {
	savedAt: string;
	prices: Record<number, PriceRow>;
};

const PRICE_CACHE_KEY = 'osrs-planner:cache:prices:v1';
const PRICE_CACHE_TTL_MS = 1000 * 60 * 60 * 6;

function nowIso() {
	return new Date().toISOString();
}

function isOlderThanTtl(savedAt?: string) {
	if (!savedAt) return true;
	const ts = new Date(savedAt).getTime();
	if (!Number.isFinite(ts)) return true;
	return Date.now() - ts > PRICE_CACHE_TTL_MS;
}

function readPriceCache(): PriceCachePayload | null {
	if (!browser) return null;
	try {
		const raw = window.localStorage.getItem(PRICE_CACHE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as PriceCachePayload;
		if (!parsed || typeof parsed !== 'object' || !parsed.prices) return null;
		return parsed;
	} catch {
		return null;
	}
}

function writePriceCache(prices: Record<number, PriceRow>) {
	if (!browser) return;
	const payload: PriceCachePayload = {
		savedAt: nowIso(),
		prices
	};
	window.localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(payload));
}

function withStaleFlag(prices: Record<number, PriceRow>, stale: boolean) {
	const next: Record<number, PriceRow> = {};
	for (const [id, row] of Object.entries(prices)) {
		next[Number(id)] = { ...row, stale };
	}
	return next;
}

const cached = readPriceCache();
const initialItems = cached?.prices ? withStaleFlag(cached.prices, isOlderThanTtl(cached.savedAt)) : {};

const base = writable<PriceState>({
	items: initialItems,
	isRefreshing: false
});

export const priceStore = {
	subscribe: base.subscribe,
	async refresh(itemIds?: number[]) {
		base.update((s) => ({ ...s, isRefreshing: true }));
		try {
			const latest = await fetchLatestPrices(itemIds);
			let responsePayload: Record<number, { current?: number; stale?: boolean }> = {};
			base.update((s) => {
				const merged: Record<number, PriceRow> = { ...s.items };
				for (const [idText, price] of Object.entries(latest)) {
					const id = Number(idText);
					const previous = merged[id];
					const current = price.current ?? previous?.current ?? previous?.lastKnown;
					merged[id] = {
						current,
						lastKnown: current ?? previous?.lastKnown,
						stale: false,
						updatedAt: nowIso(),
						fetchFailedAt: undefined,
						staleReason: undefined
					};
				}
				responsePayload = Object.fromEntries(
					Object.entries(merged).map(([idText, row]) => [
						Number(idText),
						{ current: row.current ?? row.lastKnown, stale: row.stale }
					])
				);
				writePriceCache(merged);
				return { ...s, items: merged, isRefreshing: false };
			});
			return responsePayload;
		} catch {
			const fallback = readPriceCache();
			const cacheExpired = isOlderThanTtl(fallback?.savedAt);
			let responsePayload: Record<number, { current?: number; stale?: boolean }> = {};
			base.update((s) => {
				const fallbackRows = fallback?.prices ? withStaleFlag(fallback.prices, true) : {};
				const merged: Record<number, PriceRow> = { ...fallbackRows, ...s.items };
				for (const [idText, row] of Object.entries(merged)) {
					const id = Number(idText);
					merged[id] = {
						...row,
						stale: true,
						updatedAt: row.updatedAt ?? fallback?.savedAt ?? nowIso(),
						fetchFailedAt: nowIso(),
						staleReason: cacheExpired ? 'cache_ttl_expired' : 'fetch_failed'
					};
				}
				if (cacheExpired && fallback?.prices) {
					// Keep old values visible but explicitly stale when TTL exceeded.
					for (const [idText, row] of Object.entries(merged)) {
						merged[Number(idText)] = { ...row, stale: true, staleReason: 'cache_ttl_expired' };
					}
				}
				responsePayload = Object.fromEntries(
					Object.entries(merged).map(([idText, row]) => [
						Number(idText),
						{ current: row.current ?? row.lastKnown, stale: true }
					])
				);
				return { ...s, items: merged, isRefreshing: false };
			});
			return responsePayload;
		}
	}
};
