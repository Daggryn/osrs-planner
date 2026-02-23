import { writable } from 'svelte/store';
import type { GoalType } from '$lib/domain/types';

type Toast = {
	id: string;
	title: string;
	goalName: string;
	goalType: GoalType;
};

const base = writable<Toast[]>([]);

function makeId() {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const feedbackStore = {
	subscribe: base.subscribe,
	push(toast: Omit<Toast, 'id'>, ttlMs = 2800) {
		const entry: Toast = { id: makeId(), ...toast };
		base.update((all) => [entry, ...all].slice(0, 3));
		setTimeout(() => {
			base.update((all) => all.filter((t) => t.id !== entry.id));
		}, ttlMs);
	},
	remove(id: string) {
		base.update((all) => all.filter((t) => t.id !== id));
	}
};

