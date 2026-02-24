import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import type { BankItem, ItemGoal, QuestGoal, SkillGoal } from '$lib/domain/types';
import { QUEST_SEED, SKILL_SEED, levelToXp } from '$lib/data/seed';

const STORAGE_KEY = 'osrs-planner:v2';

type PlannerState = {
	schemaVersion: 2;
	gold: number;
	itemGoals: ItemGoal[];
	questGoals: QuestGoal[];
	skillGoals: SkillGoal[];
	bankItems: BankItem[];
	showCompleted: boolean;
	lastOpenedAt?: string;
	ui: {
		navCollapsed: boolean;
	};
	meta: {
		seedQuestAutocorrectedAt?: string;
	};
};

const nowIso = () => new Date().toISOString();

const initialState: PlannerState = {
	schemaVersion: 2,
	gold: 0,
	itemGoals: [],
	questGoals: QUEST_SEED,
	skillGoals: SKILL_SEED,
	bankItems: [],
	showCompleted: false,
	lastOpenedAt: undefined,
	ui: { navCollapsed: false },
	meta: {}
};

function dedupeQuestReqs(reqs: string[]) {
	return [...new Set(reqs.map((r) => r.trim()).filter(Boolean))];
}

function dedupeSkillReqs(reqs: Array<{ skill: string; level: number }>) {
	const map = new Map<string, { skill: string; level: number }>();
	for (const req of reqs) map.set(`${req.skill}:${req.level}`, req);
	return [...map.values()];
}

function normalizeSkillGoal(raw: Partial<SkillGoal> & { id: string; title?: string; skill?: string }): SkillGoal {
	const skillName = raw.skill ?? raw.title ?? 'Skill';
	const startLevel = Math.max(1, raw.startLevel ?? (raw as { levelCurrent?: number }).levelCurrent ?? 1);
	const targetLevel = Math.max(startLevel, raw.targetLevel ?? (raw as { levelTarget?: number }).levelTarget ?? startLevel);
	const currentLevel = Math.max(startLevel, raw.currentLevel ?? (raw as { levelCurrent?: number }).levelCurrent ?? startLevel);
	const startXp = raw.startXp ?? levelToXp(startLevel);
	const targetXp = raw.targetXp ?? levelToXp(targetLevel);
	const currentXp = raw.currentXp ?? levelToXp(currentLevel);
	const denom = Math.max(1, targetXp - startXp);
	const progressPct = raw.status === 'completed' ? 100 : Math.min(100, Math.floor(((currentXp - startXp) / denom) * 100));

	return {
		id: raw.id,
		type: 'skill',
		skill: skillName,
		title: skillName,
		status: raw.status ?? 'active',
		startLevel,
		startXp,
		currentLevel,
		currentXp,
		targetLevel,
		targetXp,
		progressPct,
		createdAt: raw.createdAt ?? nowIso(),
		updatedAt: raw.updatedAt ?? nowIso(),
		completedAt: raw.completedAt,
		iconUrl: raw.iconUrl ?? '/icons/skill.svg',
		subGoals: raw.subGoals
	};
}

function normalizeQuestGoal(raw: Partial<QuestGoal> & { id: string; title: string }): QuestGoal {
	const requirements = {
		questIds: dedupeQuestReqs(raw.requirements?.questIds ?? []),
		skillReqs: dedupeSkillReqs(raw.requirements?.skillReqs ?? [])
	};
	const completedQuestReqIds = (raw.completedQuestReqIds ?? []).filter((q) => requirements.questIds.includes(q));
	const completedSkillReqs = (raw.completedSkillReqs ?? []).filter((req) =>
		requirements.skillReqs.some((target) => target.skill === req.skill && target.level === req.level)
	);

	const generatedSubGoals = [
		...requirements.questIds.map((quest) => ({
			id: `sub-quest-${raw.id}-${quest}`,
			label: quest,
			completed: completedQuestReqIds.includes(quest),
			kind: 'quest_requirement' as const,
			parentGoalTitle: raw.title
		})),
		...requirements.skillReqs.map((req) => ({
			id: `sub-skill-${raw.id}-${req.skill}-${req.level}`,
			label: `${req.level} ${req.skill}`,
			completed: completedSkillReqs.some((done) => done.skill === req.skill && done.level === req.level),
			kind: 'skill_requirement' as const,
			parentGoalTitle: raw.title
		}))
	];

	const totalReqs = generatedSubGoals.length;
	const doneReqs = generatedSubGoals.filter((x) => x.completed).length;
	const progressPct = totalReqs > 0 ? Math.floor((doneReqs / totalReqs) * 100) : raw.progressPct ?? 0;

	return {
		id: raw.id,
		type: 'quest',
		title: raw.title,
		status: raw.status ?? 'active',
		progressPct,
		createdAt: raw.createdAt ?? nowIso(),
		updatedAt: raw.updatedAt ?? nowIso(),
		completedAt: raw.completedAt,
		subGoals: generatedSubGoals,
		requirements,
		completedQuestReqIds,
		completedSkillReqs
	};
}

function normalizeItemGoal(raw: Partial<ItemGoal> & { id: string; itemId: number; title: string }): ItemGoal {
	return {
		id: raw.id,
		type: 'item',
		itemId: raw.itemId,
		title: raw.title,
		status: raw.status ?? 'active',
		progressPct: raw.progressPct ?? 0,
		createdAt: raw.createdAt ?? nowIso(),
		updatedAt: raw.updatedAt ?? nowIso(),
		completedAt: raw.completedAt,
		imageUrl: raw.imageUrl,
		currentPrice: raw.currentPrice,
		lastKnownPrice: raw.lastKnownPrice,
		priceStale: raw.priceStale,
		goldProgressPct: raw.goldProgressPct ?? 0,
		powerProgressPct: raw.powerProgressPct ?? 0,
		subGoals: raw.subGoals
	};
}

function parseStoredState(raw: string | null): PlannerState {
	if (!raw) return initialState;
	try {
		const parsed = JSON.parse(raw) as Partial<PlannerState> & {
			schemaVersion?: number;
			skillGoals?: Array<Partial<SkillGoal> & { id: string }>;
			questGoals?: Array<Partial<QuestGoal> & { id: string; title: string }>;
			itemGoals?: Array<Partial<ItemGoal> & { id: string; itemId: number; title: string }>;
		};

		if (parsed.schemaVersion === 2) {
			return {
				...initialState,
				...parsed,
				itemGoals: (parsed.itemGoals ?? []).map(normalizeItemGoal),
				questGoals: (parsed.questGoals ?? QUEST_SEED).map(normalizeQuestGoal),
				skillGoals: (parsed.skillGoals ?? SKILL_SEED).map(normalizeSkillGoal),
				bankItems:
					parsed.bankItems?.map((b) => ({
						itemId: b.itemId,
						name: b.name,
						quantity: b.quantity,
						imageUrl: b.imageUrl,
						currentPrice: b.currentPrice,
						lastKnownPrice: b.lastKnownPrice
					})) ?? [],
				ui: { navCollapsed: parsed.ui?.navCollapsed ?? false },
				meta: parsed.meta ?? {}
			};
		}

		return {
			...initialState,
			gold: Number(parsed.gold ?? 0),
			showCompleted: Boolean(parsed.showCompleted),
			lastOpenedAt: parsed.lastOpenedAt,
			itemGoals: (parsed.itemGoals ?? []).map(normalizeItemGoal),
			questGoals: (parsed.questGoals ?? QUEST_SEED).map(normalizeQuestGoal),
			skillGoals: (parsed.skillGoals ?? SKILL_SEED).map(normalizeSkillGoal),
			bankItems:
				parsed.bankItems?.map((b) => ({
					itemId: b.itemId,
					name: b.name,
					quantity: b.quantity,
					imageUrl: b.imageUrl,
					currentPrice: b.currentPrice,
					lastKnownPrice: b.lastKnownPrice
				})) ?? [],
			meta: {}
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
	setNavCollapsed(next: boolean) {
		base.update((s) => ({ ...s, ui: { ...s.ui, navCollapsed: next } }));
	},
	addItemGoal(item: { itemId: number; name: string; imageUrl?: string; price?: number }) {
		base.update((s) => {
			if (s.itemGoals.some((g) => g.itemId === item.itemId && g.status === 'active')) return s;
			const goal: ItemGoal = {
				id: `item-${item.itemId}-${Date.now()}`,
				type: 'item',
				itemId: item.itemId,
				title: item.name,
				imageUrl: item.imageUrl,
				status: 'active',
				progressPct: 0,
				currentPrice: item.price,
				lastKnownPrice: item.price,
				priceStale: false,
				goldProgressPct: 0,
				powerProgressPct: 0,
				createdAt: nowIso(),
				updatedAt: nowIso()
			};
			return { ...s, itemGoals: [...s.itemGoals, goal] };
		});
	},
	addQuestGoal(goal: {
		title: string;
		requirements: { questIds: string[]; skillReqs: Array<{ skill: string; level: number }> };
	}) {
		const requirements = {
			questIds: dedupeQuestReqs(goal.requirements.questIds),
			skillReqs: dedupeSkillReqs(goal.requirements.skillReqs)
		};
		const subGoals = [
			...requirements.questIds.map((quest) => ({
				id: `sub-quest-${Date.now()}-${quest}`,
				label: quest,
				completed: false,
				kind: 'quest_requirement' as const,
				parentGoalTitle: goal.title
			})),
			...requirements.skillReqs.map((req) => ({
				id: `sub-skill-${Date.now()}-${req.skill}-${req.level}`,
				label: `${req.level} ${req.skill}`,
				completed: false,
				kind: 'skill_requirement' as const,
				parentGoalTitle: goal.title
			}))
		];

		base.update((s) => ({
			...s,
			questGoals: [
				...s.questGoals,
				{
					id: `quest-${Date.now()}`,
					type: 'quest',
					title: goal.title,
					status: 'active',
					progressPct: 0,
					createdAt: nowIso(),
					updatedAt: nowIso(),
					requirements,
					completedQuestReqIds: [],
					completedSkillReqs: [],
					subGoals
				}
			]
		}));
	},
	addSkillGoal(goal: { skill: string; currentLevel: number; targetLevel: number; currentXp?: number }) {
		base.update((s) => {
			const startLevel = Math.max(1, goal.currentLevel);
			const targetLevel = Math.max(startLevel, goal.targetLevel);
			const startXp = goal.currentXp ?? levelToXp(startLevel);
			const targetXp = levelToXp(targetLevel);
			const skillGoal: SkillGoal = {
				id: `skill-${goal.skill.toLowerCase()}-${Date.now()}`,
				type: 'skill',
				skill: goal.skill,
				title: goal.skill,
				status: 'active',
				startLevel,
				startXp,
				currentLevel: startLevel,
				currentXp: startXp,
				targetLevel,
				targetXp,
				progressPct: 0,
				createdAt: nowIso(),
				updatedAt: nowIso(),
				iconUrl: '/icons/skill.svg',
				subGoals: []
			};
			return { ...s, skillGoals: [...s.skillGoals, skillGoal] };
		});
	},
	updateItemPrices(prices: Record<number, { current?: number; stale?: boolean }>) {
		base.update((s) => ({
			...s,
			itemGoals: s.itemGoals.map((g) => {
				const match = prices[g.itemId];
				if (!match) return g;
				const nextCurrent = match.current ?? g.currentPrice ?? g.lastKnownPrice;
				return {
					...g,
					currentPrice: nextCurrent,
					lastKnownPrice: nextCurrent ?? g.lastKnownPrice,
					priceStale: Boolean(match.stale),
					updatedAt: nowIso()
				};
			}),
			bankItems: s.bankItems.map((b) => {
				const match = prices[b.itemId];
				if (!match) return b;
				const nextCurrent = match.current ?? b.currentPrice ?? b.lastKnownPrice;
				return {
					...b,
					currentPrice: nextCurrent,
					lastKnownPrice: nextCurrent ?? b.lastKnownPrice
				};
			})
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
	addBankItem(item: { itemId: number; name: string; imageUrl?: string }, quantity = 1) {
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
				imageUrl: item.imageUrl,
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
	},
	async autocorrectSeedQuests() {
		if (!browser) return;
		const current = get(base);
		if (current.meta.seedQuestAutocorrectedAt) return;

		const seedIds = new Set(['quest-ds2', 'quest-rfd']);
		const seedGoals = current.questGoals.filter((q) => seedIds.has(q.id));
		if (seedGoals.length === 0) {
			base.update((s) => ({ ...s, meta: { ...s.meta, seedQuestAutocorrectedAt: nowIso() } }));
			return;
		}

		const metadataRows = await Promise.all(
			seedGoals.map(async (goal) => {
				try {
					const res = await fetch(`/api/osrs/quest-meta?title=${encodeURIComponent(goal.title)}`);
					if (!res.ok) return { goalId: goal.id, questIds: goal.requirements.questIds, skillReqs: goal.requirements.skillReqs };
					const data = (await res.json()) as {
						questIds?: string[];
						skillReqs?: Array<{ skill: string; level: number }>;
					};
					return {
						goalId: goal.id,
						questIds: dedupeQuestReqs(data.questIds ?? goal.requirements.questIds),
						skillReqs: dedupeSkillReqs(data.skillReqs ?? goal.requirements.skillReqs)
					};
				} catch {
					return { goalId: goal.id, questIds: goal.requirements.questIds, skillReqs: goal.requirements.skillReqs };
				}
			})
		);

		const byId = new Map(metadataRows.map((row) => [row.goalId, row]));

		base.update((s) => ({
			...s,
			questGoals: s.questGoals.map((goal) => {
				const corrected = byId.get(goal.id);
				if (!corrected) return goal;

				const requirements = {
					questIds: corrected.questIds,
					skillReqs: corrected.skillReqs
				};
				const completedQuestReqIds = goal.completedQuestReqIds.filter((q) => requirements.questIds.includes(q));
				const completedSkillReqs = goal.completedSkillReqs.filter((req) =>
					requirements.skillReqs.some((target) => target.skill === req.skill && target.level === req.level)
				);

				const subGoals = [
					...requirements.questIds.map((quest) => ({
						id: `sub-quest-${goal.id}-${quest}`,
						label: quest,
						completed: completedQuestReqIds.includes(quest),
						kind: 'quest_requirement' as const,
						parentGoalTitle: goal.title
					})),
					...requirements.skillReqs.map((req) => ({
						id: `sub-skill-${goal.id}-${req.skill}-${req.level}`,
						label: `${req.level} ${req.skill}`,
						completed: completedSkillReqs.some((x) => x.skill === req.skill && x.level === req.level),
						kind: 'skill_requirement' as const,
						parentGoalTitle: goal.title
					}))
				];

				const progressPct =
					subGoals.length > 0
						? Math.floor((subGoals.filter((x) => x.completed).length / subGoals.length) * 100)
						: goal.progressPct;

				return {
					...goal,
					requirements,
					completedQuestReqIds,
					completedSkillReqs,
					subGoals,
					progressPct,
					updatedAt: nowIso()
				};
			}),
			meta: { ...s.meta, seedQuestAutocorrectedAt: nowIso() }
		}));
	}
};

export type { PlannerState };
