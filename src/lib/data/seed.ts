import type { QuestGoal, SkillGoal } from '$lib/domain/types';

const nowIso = () => new Date().toISOString();

function levelToXp(level: number) {
	let points = 0;
	for (let lvl = 1; lvl < level; lvl++) {
		points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
	}
	return Math.floor(points / 4);
}

export const QUEST_SEED: QuestGoal[] = [
	{
		id: 'quest-ds2',
		type: 'quest',
		title: 'Dragon Slayer II',
		status: 'active',
		progressPct: 50,
		createdAt: nowIso(),
		updatedAt: nowIso(),
		requirements: {
			questIds: ['Dream Mentor', 'Monkey Madness II'],
			skillReqs: [
				{ skill: 'Agility', level: 70 },
				{ skill: 'Smithing', level: 70 }
			]
		},
		completedQuestReqIds: ['Dream Mentor'],
		completedSkillReqs: [{ skill: 'Agility', level: 70 }],
		subGoals: []
	},
	{
		id: 'quest-rfd',
		type: 'quest',
		title: 'Recipe for Disaster',
		status: 'completed',
		progressPct: 100,
		createdAt: nowIso(),
		completedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
		updatedAt: nowIso(),
		requirements: {
			questIds: ['Desert Treasure'],
			skillReqs: [{ skill: 'Cooking', level: 70 }]
		},
		completedQuestReqIds: ['Desert Treasure'],
		completedSkillReqs: [{ skill: 'Cooking', level: 70 }],
		subGoals: []
	}
];

export const SKILL_SEED: SkillGoal[] = [
	{
		id: 'skill-slayer',
		type: 'skill',
		skill: 'Slayer',
		title: 'Slayer',
		status: 'active',
		startLevel: 70,
		startXp: levelToXp(70),
		currentLevel: 74,
		currentXp: levelToXp(74),
		targetLevel: 87,
		targetXp: levelToXp(87),
		progressPct: 0,
		createdAt: nowIso(),
		updatedAt: nowIso(),
		iconUrl: '/icons/skill.svg'
	},
	{
		id: 'skill-agility',
		type: 'skill',
		skill: 'Agility',
		title: 'Agility',
		status: 'completed',
		startLevel: 68,
		startXp: levelToXp(68),
		currentLevel: 70,
		currentXp: levelToXp(70),
		targetLevel: 70,
		targetXp: levelToXp(70),
		progressPct: 100,
		createdAt: nowIso(),
		completedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
		updatedAt: nowIso(),
		iconUrl: '/icons/skill.svg'
	}
];

export { levelToXp };

