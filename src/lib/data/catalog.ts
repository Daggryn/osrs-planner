import type { CatalogItem } from '$lib/domain/types';

export const ITEM_CATALOG: CatalogItem[] = [
	{ itemId: 4151, name: 'Abyssal whip', icon: '🗡️', basePrice: 2500000 },
	{ itemId: 11235, name: 'Dark bow', icon: '🏹', basePrice: 750000 },
	{ itemId: 11840, name: 'Dragon boots', icon: '🥾', basePrice: 180000 },
	{ itemId: 11802, name: 'Armadyl godsword', icon: '⚔️', basePrice: 10800000 },
	{ itemId: 2577, name: 'Ranger boots', icon: '👢', basePrice: 30000000 },
	{ itemId: 6570, name: 'Fire cape', icon: '🔥', basePrice: 1 },
	{ itemId: 6585, name: 'Amulet of fury', icon: '📿', basePrice: 1800000 },
	{ itemId: 12006, name: 'Abyssal tentacle', icon: '🦑', basePrice: 1700000 },
	{ itemId: 4153, name: 'Granite maul', icon: '🔨', basePrice: 42000 },
	{ itemId: 21003, name: 'Elder maul', icon: '🪵', basePrice: 16000000 }
];

export const QUEST_SEED = [
	{
		id: 'quest-ds2',
		type: 'quest' as const,
		title: "Dragon Slayer II",
		status: 'active' as const,
		progressPct: 55,
		updatedAt: new Date().toISOString(),
		subGoals: [
			{ id: 'q-ds2-1', label: 'Complete Dream Mentor', completed: true },
			{ id: 'q-ds2-2', label: 'Complete Monkey Madness II', completed: false }
		]
	},
	{
		id: 'quest-rfd',
		type: 'quest' as const,
		title: 'Recipe for Disaster',
		status: 'completed' as const,
		progressPct: 100,
		completedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
		updatedAt: new Date().toISOString(),
		subGoals: []
	}
];

export const SKILL_SEED = [
	{
		id: 'skill-slayer',
		type: 'skill' as const,
		title: 'Slayer 87',
		status: 'active' as const,
		progressPct: 81,
		levelCurrent: 71,
		levelTarget: 87,
		updatedAt: new Date().toISOString()
	},
	{
		id: 'skill-agility',
		type: 'skill' as const,
		title: 'Agility 70',
		status: 'completed' as const,
		progressPct: 100,
		levelCurrent: 70,
		levelTarget: 70,
		completedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
		updatedAt: new Date().toISOString()
	}
];

