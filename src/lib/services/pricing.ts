import { ITEM_CATALOG } from '$lib/data/catalog';

const priceCache = new Map<number, number>();

for (const item of ITEM_CATALOG) {
	priceCache.set(item.itemId, item.basePrice);
}

function jitter(seed: number) {
	const t = Math.floor(Date.now() / (1000 * 60));
	const base = Math.sin(seed * 0.007 + t * 0.13);
	return Math.round(base * 0.04 * 1000) / 1000;
}

export async function searchItems(query: string) {
	const q = query.trim().toLowerCase();
	if (!q) return [];
	return ITEM_CATALOG.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 8);
}

export async function fetchLatestPrices(itemIds?: number[]) {
	const targets = itemIds?.length ? ITEM_CATALOG.filter((i) => itemIds.includes(i.itemId)) : ITEM_CATALOG;
	const out: Record<number, { current?: number; stale?: boolean }> = {};

	for (const item of targets) {
		const prev = priceCache.get(item.itemId) ?? item.basePrice;
		const next = Math.max(1, Math.floor(prev * (1 + jitter(item.itemId))));
		priceCache.set(item.itemId, next);
		out[item.itemId] = { current: next, stale: false };
	}

	return out;
}

export function getCatalogItem(itemId: number) {
	return ITEM_CATALOG.find((i) => i.itemId === itemId);
}

