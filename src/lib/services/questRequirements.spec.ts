import { describe, expect, it } from 'vitest';
import { mergeSkillReqsMax } from './questRequirements';

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
