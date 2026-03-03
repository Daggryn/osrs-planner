import { describe, expect, it } from 'vitest';
import type { PlannerState } from './plannerStore';
import { enforceQuestSeedMigration } from './plannerStore';

function makeState(overrides: Partial<PlannerState> = {}): PlannerState {
	return {
		schemaVersion: 2,
		gold: 0,
		itemGoals: [],
		questGoals: [],
		skillGoals: [],
		bankItems: [],
		showCompleted: false,
		ui: { navCollapsed: false },
		meta: {},
		...overrides
	};
}

describe('enforceQuestSeedMigration', () => {
	it('replaces existing quest goals with the Fremennik Exiles test card', () => {
		const migrated = enforceQuestSeedMigration(
			makeState({
				questGoals: [
					{
						id: 'quest-old',
						type: 'quest',
						title: 'Dragon Slayer II',
						status: 'active',
						progressPct: 0,
						createdAt: new Date(0).toISOString(),
						updatedAt: new Date(0).toISOString(),
						requirements: { questIds: [], skillReqs: [] },
						completedQuestReqIds: [],
						completedSkillReqs: [],
						subGoals: []
					}
				]
			})
		);

		expect(migrated.questGoals).toHaveLength(1);
		expect(migrated.questGoals[0].id).toBe('quest-fremennik-exiles-test');
		expect(migrated.meta.questSeedMigrationV1At).toBeTruthy();
	});

	it('is idempotent after migration', () => {
		const once = enforceQuestSeedMigration(makeState());
		const twice = enforceQuestSeedMigration(once);
		expect(twice.questGoals[0].id).toBe('quest-fremennik-exiles-test');
		expect(twice.meta.questSeedMigrationV1At).toBe(once.meta.questSeedMigrationV1At);
	});
});
