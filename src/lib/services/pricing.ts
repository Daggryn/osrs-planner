import { browser } from '$app/environment';
import type { CatalogItem } from '$lib/domain/types';

type MappingResponse = Array<{ id: number; name: string; icon?: string }>;

type MappingCachePayload = {
	savedAt: string;
	items: CatalogItem[];
};

const MAPPING_CACHE_KEY = 'osrs-planner:cache:mapping:v1';

let mappingCache: CatalogItem[] = [];
let mappingLoadedAt = 0;
const mappingTtlMs = 1000 * 60 * 30;

function iconToImageUrl(icon?: string) {
	if (!icon) return '/icons/item-placeholder.svg';
	return `https://oldschool.runescape.wiki/images/${encodeURIComponent(icon)}`;
}

function readMappingCache(): MappingCachePayload | null {
	if (!browser) return null;
	try {
		const raw = window.localStorage.getItem(MAPPING_CACHE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as MappingCachePayload;
		if (!Array.isArray(parsed.items)) return null;
		return parsed;
	} catch {
		return null;
	}
}

function writeMappingCache(items: CatalogItem[]) {
	if (!browser) return;
	const payload: MappingCachePayload = {
		savedAt: new Date().toISOString(),
		items
	};
	window.localStorage.setItem(MAPPING_CACHE_KEY, JSON.stringify(payload));
}

async function refreshMappingFromNetwork() {
	if (!browser) return mappingCache;
	const res = await fetch('/api/osrs/mapping');
	if (!res.ok) throw new Error('mapping fetch failed');
	const data = (await res.json()) as MappingResponse;
	mappingCache = data.map((row) => ({
		itemId: row.id,
		name: row.name,
		icon: row.icon,
		imageUrl: iconToImageUrl(row.icon)
	}));
	mappingLoadedAt = Date.now();
	writeMappingCache(mappingCache);
	return mappingCache;
}

async function loadMapping(force = false) {
	if (!browser) return mappingCache;

	const fresh = Date.now() - mappingLoadedAt < mappingTtlMs;
	if (!force && mappingCache.length > 0 && fresh) return mappingCache;

	if (mappingCache.length === 0) {
		const cached = readMappingCache();
		if (cached?.items?.length) {
			mappingCache = cached.items;
			mappingLoadedAt = new Date(cached.savedAt).getTime() || 0;
		}
	}

	if (force || Date.now() - mappingLoadedAt >= mappingTtlMs) {
		try {
			await refreshMappingFromNetwork();
		} catch {
			// Keep in-memory/local cached mapping if network fails.
		}
	}

	return mappingCache;
}

export async function searchItems(query: string) {
	const q = query.trim().toLowerCase();
	if (!q) return [];
	const catalog = await loadMapping(false);
	if (catalog.length === 0) {
		try {
			await loadMapping(true);
		} catch {
			// No-op; fallback to empty if fully unavailable.
		}
	}
	return mappingCache.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 8);
}

export async function fetchLatestPrices(itemIds?: number[]) {
	if (!browser) return {};
	const param = itemIds?.length ? `?ids=${itemIds.join(',')}` : '';
	const res = await fetch(`/api/osrs/latest${param}`);
	if (!res.ok) throw new Error('latest prices fetch failed');
	const data = (await res.json()) as {
		data?: Record<string, { high?: number; low?: number }>;
		stale?: boolean;
	};
	const out: Record<number, { current?: number; stale?: boolean }> = {};
	for (const [idText, row] of Object.entries(data.data ?? {})) {
		const id = Number(idText);
		const current = row.high ?? row.low;
		out[id] = { current, stale: Boolean(data.stale) };
	}
	return out;
}
