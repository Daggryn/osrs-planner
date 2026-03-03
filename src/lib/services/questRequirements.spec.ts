import { describe, expect, it } from 'vitest';
import { buildQuestDisplayModel, mergeSkillReqsMax } from './questRequirements';

describe('mergeSkillReqsMax', () => {
	it('merges duplicate skills and keeps the highest level', () => {
		const merged = mergeSkillReqsMax([
			{ skill: 'Crafting', level: 61 },
			{ skill: 'Crafting', level: 65 },
			{ skill: 'Mining', level: 55 },
			{ skill: 'Mining', level: 60 }
		]);

		expect(merged).toContainEqual({ skill: 'Crafting', level: 65 });
		expect(merged).toContainEqual({ skill: 'Mining', level: 60 });
		expect(merged.filter((req) => req.skill === 'Crafting')).toHaveLength(1);
		expect(merged.filter((req) => req.skill === 'Mining')).toHaveLength(1);
	});
});

describe('buildQuestDisplayModel', () => {
	it('sorts top-level quest rows as ready, not-ready, then completed', () => {
		const rows = buildQuestDisplayModel(
			[
				{ quest: 'Blocked Quest', directSkillReqs: [{ skill: 'Magic', level: 50 }], directQuestReqs: [], children: [] },
				{ quest: 'Ready Quest', directSkillReqs: [], directQuestReqs: [], children: [] },
				{ quest: 'Done Quest', completed: true, directSkillReqs: [], directQuestReqs: [], children: [] }
			],
			{ userSkills: {}, completedQuestIds: [] }
		);

		expect(rows.map((row) => row.quest)).toEqual(['Ready Quest', 'Blocked Quest', 'Done Quest']);
	});

	it('keeps subtree ordering as unmet skills first then child quests', () => {
		const [row] = buildQuestDisplayModel(
			[
				{
					quest: 'Parent',
					directSkillReqs: [{ skill: 'Crafting', level: 40 }],
					directQuestReqs: ['Child'],
					children: [{ quest: 'Child', directSkillReqs: [], directQuestReqs: [], children: [] }]
				}
			],
			{ userSkills: {}, completedQuestIds: [] }
		);

		expect(row.unmetSkills[0]).toEqual({ skill: 'Crafting', level: 40 });
		expect(row.children[0].quest).toBe('Child');
	});
});
