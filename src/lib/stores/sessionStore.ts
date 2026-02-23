import { writable } from 'svelte/store';

type ReconcileEntry = {
	goalId: string;
	itemId: number;
	name: string;
	iconUrl?: string;
};

type SessionState = {
	reconciliationQueue: ReconcileEntry[];
};

const base = writable<SessionState>({
	reconciliationQueue: []
});

export const sessionStore = {
	subscribe: base.subscribe,
	enqueueReconciliationItem(entry: ReconcileEntry) {
		base.update((s) => {
			if (s.reconciliationQueue.some((q) => q.goalId === entry.goalId)) return s;
			return { ...s, reconciliationQueue: [...s.reconciliationQueue, entry] };
		});
	},
	dismissReconciliationItem(goalId: string) {
		base.update((s) => ({
			...s,
			reconciliationQueue: s.reconciliationQueue.filter((q) => q.goalId !== goalId)
		}));
	},
	clear() {
		base.set({ reconciliationQueue: [] });
	}
};

export type { ReconcileEntry };

