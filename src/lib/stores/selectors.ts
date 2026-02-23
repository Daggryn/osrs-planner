import type { BankItem, Goal, ItemGoal } from '$lib/domain/types';

function effectivePrice(item: {
	currentPrice?: number;
	lastKnownPrice?: number;
	current?: number;
	lastKnown?: number;
}) {
	return item.currentPrice ?? item.lastKnownPrice ?? item.current ?? item.lastKnown ?? 0;
}

export function bankValue(gold: number, bankItems: BankItem[], priceMap: Record<number, { current?: number; lastKnown?: number }>) {
	const liquid = bankItems.reduce((sum, item) => {
		const price = effectivePrice(priceMap[item.itemId] ?? {});
		return sum + price * item.quantity;
	}, 0);
	return gold + liquid;
}

export function itemWithProgress(
	item: ItemGoal,
	gold: number,
	power: number
): ItemGoal {
	const price = Math.max(1, effectivePrice(item));
	const goldProgressPct = Math.min(100, Math.floor((gold / price) * 100));
	const powerProgressPct = Math.min(100, Math.floor((power / price) * 100));
	return {
		...item,
		goldProgressPct,
		powerProgressPct,
		progressPct: item.status === 'completed' ? 100 : Math.max(goldProgressPct, powerProgressPct)
	};
}

export function splitCompleted<T extends Goal>(goals: T[]) {
	return {
		active: goals.filter((g) => g.status === 'active'),
		completed: goals.filter((g) => g.status === 'completed')
	};
}

export function sortByCheapest(items: ItemGoal[]) {
	return [...items].sort((a, b) => effectivePrice(a) - effectivePrice(b));
}

export function sortByClosest(goals: Goal[]) {
	return [...goals].sort((a, b) => b.progressPct - a.progressPct);
}

export function sinceLastVisit(goals: Goal[], lastOpenedAt?: string) {
	if (!lastOpenedAt) return [];
	const last = new Date(lastOpenedAt).getTime();
	return goals.filter((g) => g.completedAt && new Date(g.completedAt).getTime() > last);
}

export function topWishlistDrops(
	items: ItemGoal[],
	priceMap: Record<number, { current?: number; lastKnown?: number }>
) {
	const deltas = items
		.map((item) => {
			const live = priceMap[item.itemId];
			const current = effectivePrice(live ?? item);
			const previous = item.lastKnownPrice ?? current;
			return { item, delta: current - previous };
		})
		.filter((x) => Number.isFinite(x.delta))
		.sort((a, b) => a.delta - b.delta);
	return deltas.slice(0, 3);
}

export function topBankGains(
	bankItems: BankItem[],
	priceMap: Record<number, { current?: number; lastKnown?: number }>
) {
	const deltas = bankItems
		.map((item) => {
			const live = priceMap[item.itemId];
			const current = effectivePrice(live ?? {});
			const previous = live?.lastKnown ?? current;
			return { item, delta: (current - previous) * item.quantity };
		})
		.sort((a, b) => b.delta - a.delta);
	return deltas.slice(0, 3);
}
