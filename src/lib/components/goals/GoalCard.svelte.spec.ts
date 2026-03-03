import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import GoalCard from './GoalCard.svelte';
import type { QuestGoal } from '$lib/domain/types';

describe('GoalCard quest requirements', () => {
	it('renders direct, cascaded, and merged skill requirement sections', async () => {
		const goal: QuestGoal = {
			id: 'quest-fremennik-exiles-test',
			type: 'quest',
			title: 'The Fremennik Exiles',
			status: 'active',
			progressPct: 0,
			createdAt: new Date(0).toISOString(),
			updatedAt: new Date(0).toISOString(),
			requirements: {
				directQuestIds: ['Heroes\' Quest'],
				cascadedQuestIds: ['Lost City'],
				mergedSkillReqs: [
					{ skill: 'Crafting', level: 65 },
					{ skill: 'Magic', level: 65 }
				],
				questIds: ['Heroes\' Quest', 'Lost City'],
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

		await expect.element(page.getByText('Quest Requirements (Direct)')).toBeInTheDocument();
		await expect.element(page.getByText('Quest Requirements (From Prereqs)')).toBeInTheDocument();
		await expect.element(page.getByText('Skill Requirements (Merged Max)')).toBeInTheDocument();
		await expect.element(page.getByText("• Heroes' Quest")).toBeInTheDocument();
		await expect.element(page.getByText('• Lost City')).toBeInTheDocument();
		await expect.element(page.getByText('• 65 Crafting')).toBeInTheDocument();
	});
});
