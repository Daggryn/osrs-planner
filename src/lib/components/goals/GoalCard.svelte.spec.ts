import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import GoalCard from './GoalCard.svelte';
import type { QuestGoal } from '$lib/domain/types';

describe('GoalCard quest requirements', () => {
	it('renders skills first and collapsible quest requirements without headers', async () => {
		const goal: QuestGoal = {
			id: 'quest-fremennik-exiles-test',
			type: 'quest',
			title: 'The Fremennik Exiles',
			status: 'active',
			progressPct: 0,
			createdAt: new Date(0).toISOString(),
			updatedAt: new Date(0).toISOString(),
			requirements: {
				directQuestIds: ["Heroes' Quest"],
				directSkillReqs: [
					{ skill: 'Crafting', level: 65 },
					{ skill: 'Magic', level: 65 }
				],
				topLevelQuestDeps: [
					{
						quest: "Heroes' Quest",
						directSkillReqs: [{ skill: 'Cooking', level: 53 }],
						directQuestReqs: ['Shield of Arrav'],
						children: [
							{
								quest: 'Shield of Arrav',
								directSkillReqs: [],
								directQuestReqs: [],
								children: []
							}
						]
					}
				],
				questIds: ["Heroes' Quest"],
				skillReqs: [
					{ skill: 'Crafting', level: 65 },
					{ skill: 'Magic', level: 65 }
				]
			},
			completedQuestReqIds: [],
			completedSkillReqs: [],
			subGoals: []
		};

		render(GoalCard, { goal });

		await expect.element(page.getByText('65 Crafting')).toBeInTheDocument();
		await expect.element(page.getByText("Heroes' Quest")).toBeInTheDocument();
	});
});
