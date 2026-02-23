import { writable } from 'svelte/store';
import { fetchLatestPrices } from '$lib/services/pricing';

type PriceState = {
	items: Record<number, { current?: number; lastKnown?: number; stale: boolean; updatedAt?: string }>;
	isRefreshing: boolean;
};

const base = writable<PriceState>({
	items: {},
	isRefreshing: false
});

const nowIso = () => new Date().toISOString();

export const priceStore = {
	subscribe: base.subscribe,
	async refresh(itemIds?: number[]) {
		base.update((s) => ({ ...s, isRefreshing: true }));
		try {
			const latest = await fetchLatestPrices(itemIds);
			base.update((s) => {
				const merged = { ...s.items };
				for (const [idText, price] of Object.entries(latest)) {
					const id = Number(idText);
					const previous = merged[id];
					merged[id] = {
						current: price.current,
						lastKnown: price.current ?? previous?.current ?? previous?.lastKnown,
						stale: Boolean(price.stale),
						updatedAt: nowIso()
					};
				}
				return { ...s, items: merged, isRefreshing: false };
			});
			return latest;
		} catch {
			base.update((s) => ({ ...s, isRefreshing: false }));
			return {};
		}
	}
};

