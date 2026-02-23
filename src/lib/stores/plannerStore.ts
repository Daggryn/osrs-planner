import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { BankItem, ItemGoal, QuestGoal, SkillGoal } from '$lib/domain/types';
import { QUEST_SEED, SKILL_SEED } from '$lib/data/catalog';

const STORAGE_KEY = 'osrs-planner:v1';

type PlannerState = {
	schemaVersion: 1;
	gold: number;
	itemGoals: ItemGoal[];
	questGoals: QuestGoal[];
	skillGoals: SkillGoal[];
	bankItems: BankItem[];
	showCompleted: boolean;
	lastOpenedAt?: string;
};

const nowIso = () => new Date().toISOString();

const initialState: PlannerState = {
	schemaVersion: 1,
	gold: 0,
	itemGoals: [],
	questGoals: QUEST_SEED,
	skillGoals: SKILL_SEED,
	bankItems: [],
	showCompleted: false,
	lastOpenedAt: undefined
};

function parseStoredState(raw: string | null): PlannerState {
	if (!raw) return initialState;
	try {
		const parsed = JSON.parse(raw) as Partial<PlannerState>;
		if (parsed.schemaVersion !== 1) return initialState;
		return {
			...initialState,
			...parsed,
			itemGoals: parsed.itemGoals ?? [],
			questGoals: parsed.questGoals ?? QUEST_SEED,
			skillGoals: parsed.skillGoals ?? SKILL_SEED,
			bankItems: parsed.bankItems ?? []
		};
	} catch {
		return initialState;
	}
}

const base = writable<PlannerState>(
	parseStoredState(browser ? window.localStorage.getItem(STORAGE_KEY) : null)
);

if (browser) {
	base.subscribe((state) => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	});
}

export const plannerStore = {
	subscribe: base.subscribe,
	setGold(value: number) {
		base.update((s) => ({ ...s, gold: Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0 }));
	},
	addItemGoal(item: { itemId: number; name: string; iconUrl?: string; price?: number }) {
		base.update((s) => {
			if (s.itemGoals.some((g) => g.itemId === item.itemId)) return s;
			const goal: ItemGoal = {
				id: `item-${item.itemId}`,
				type: 'item',
				itemId: item.itemId,
				title: item.name,
				iconUrl: item.iconUrl,
				status: 'active',
				progressPct: 0,
				currentPrice: item.price,
				lastKnownPrice: item.price,
				priceStale: false,
				goldProgressPct: 0,
				powerProgressPct: 0,
				updatedAt: nowIso()
			};
			return { ...s, itemGoals: [...s.itemGoals, goal] };
		});
	},
	updateItemPrices(prices: Record<number, { current?: number; stale?: boolean }>) {
		base.update((s) => ({
			...s,
			itemGoals: s.itemGoals.map((g) => {
				const match = prices[g.itemId];
				if (!match) return g;
				const nextCurrent = match.current ?? g.currentPrice;
				return {
					...g,
					currentPrice: nextCurrent,
					lastKnownPrice: nextCurrent ?? g.lastKnownPrice,
					priceStale: Boolean(match.stale),
					updatedAt: nowIso()
				};
			}),
			bankItems: s.bankItems.map((b) => ({ ...b }))
		}));
	},
	markItemGoalComplete(goalId: string) {
		base.update((s) => ({
			...s,
			itemGoals: s.itemGoals.map((g) =>
				g.id === goalId
					? { ...g, status: 'completed', progressPct: 100, completedAt: nowIso(), updatedAt: nowIso() }
					: g
			)
		}));
	},
	undoItemGoalComplete(goalId: string) {
		base.update((s) => ({
			...s,
			itemGoals: s.itemGoals.map((g) =>
				g.id === goalId
					? { ...g, status: 'active', progressPct: Math.min(g.progressPct, 99), completedAt: undefined, updatedAt: nowIso() }
					: g
			)
		}));
	},
	addBankItem(item: { itemId: number; name: string; iconUrl?: string }, quantity = 1) {
		base.update((s) => {
			const existing = s.bankItems.find((b) => b.itemId === item.itemId);
			if (existing) {
				return {
					...s,
					bankItems: s.bankItems.map((b) =>
						b.itemId === item.itemId ? { ...b, quantity: b.quantity + Math.max(1, quantity) } : b
					)
				};
			}
			const next: BankItem = {
				itemId: item.itemId,
				name: item.name,
				iconUrl: item.iconUrl,
				quantity: Math.max(1, quantity)
			};
			return { ...s, bankItems: [...s.bankItems, next] };
		});
	},
	removeBankItem(itemId: number) {
		base.update((s) => ({ ...s, bankItems: s.bankItems.filter((b) => b.itemId !== itemId) }));
	},
	setBankItemQuantity(itemId: number, quantity: number) {
		base.update((s) => ({
			...s,
			bankItems: s.bankItems.map((b) =>
				b.itemId === itemId ? { ...b, quantity: Math.max(1, Math.floor(quantity || 1)) } : b
			)
		}));
	},
	setShowCompleted(next: boolean) {
		base.update((s) => ({ ...s, showCompleted: next }));
	},
	setLastOpenedAt(iso: string) {
		base.update((s) => ({ ...s, lastOpenedAt: iso }));
	}
};

export type { PlannerState };

