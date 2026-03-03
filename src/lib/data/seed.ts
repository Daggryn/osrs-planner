import type { QuestGoal, SkillGoal } from '$lib/domain/types';
import { categoryIcons } from '$lib/constants/categoryIcons';
import fremennikFixture from '$lib/data/fixtures/the-fremennik-exiles.requirements.json';
import {
	buildFremennikRequirements,
	type QuestRequirementsFixture
} from '$lib/services/questRequirements';

const nowIso = () => new Date().toISOString();

function levelToXp(level: number) {
	let points = 0;
	for (let lvl = 1; lvl < level; lvl++) {
		points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
	}
	return Math.floor(points / 4);
}

const fremennikRequirements = buildFremennikRequirements(fremennikFixture as QuestRequirementsFixture);

export function makeFremennikExilesTestGoal(): QuestGoal {
	return {
		id: 'quest-fremennik-exiles-test',
		type: 'quest',
		title: 'The Fremennik Exiles',
		status: 'active',
		progressPct: 0,
		createdAt: nowIso(),
		updatedAt: nowIso(),
		requirements: {
			directQuestIds: fremennikRequirements.directQuestIds,
			cascadedQuestIds: fremennikRequirements.cascadedQuestIds,
			directSkillReqs: fremennikRequirements.directSkillReqs,
			cascadedSkillReqs: fremennikRequirements.cascadedSkillReqs,
			mergedSkillReqs: fremennikRequirements.mergedSkillReqs,
			topLevelQuestDeps: fremennikRequirements.topLevelQuestDeps,
			questIds: fremennikRequirements.questIds,
			skillReqs: fremennikRequirements.mergedSkillReqs
		},
		completedQuestReqIds: [],
		completedSkillReqs: [],
		subGoals: []
	};
}

export const QUEST_SEED: QuestGoal[] = [makeFremennikExilesTestGoal()];

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
		iconUrl: categoryIcons.skill
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
		iconUrl: categoryIcons.skill
	}
];

export { levelToXp };
